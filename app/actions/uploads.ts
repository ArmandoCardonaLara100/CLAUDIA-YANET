"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { patientUploads } from "@/lib/db/schema";
import { assertSession, sessionUserId } from "@/lib/dal";
import { getUploadRow } from "@/lib/queries";
import {
  BUCKET_UPLOADS,
  buildObjectPath,
  createSignedUpload,
  getSignedDownloadUrl,
  removeObject,
} from "@/lib/storage";
import type { ActionResult, UploadDTO } from "@/lib/types";

/** Step 1: signed URL for the patient to upload their deliverable directly. */
export async function preparePatientUpload(
  originalName: string,
): Promise<ActionResult<{ bucket: string; path: string; token: string }>> {
  const session = await assertSession();
  try {
    const { path, token } = await createSignedUpload(
      BUCKET_UPLOADS,
      buildObjectPath(sessionUserId(session), originalName),
    );
    return { ok: true, data: { bucket: BUCKET_UPLOADS, path, token } };
  } catch {
    return { ok: false, error: "No se pudo preparar la subida" };
  }
}

const registerSchema = z.object({
  storagePath: z.string().min(1),
  originalName: z.string().min(1),
});

/** Step 2: register the uploaded object against the current user. */
export async function registerPatientUpload(
  input: unknown,
): Promise<ActionResult<UploadDTO>> {
  const session = await assertSession();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const patientId = sessionUserId(session);
  const inserted = await db
    .insert(patientUploads)
    .values({
      patientId,
      storagePath: parsed.data.storagePath,
      originalName: parsed.data.originalName,
    })
    .returning();

  const r = inserted[0];
  revalidatePath("/admin");
  revalidatePath("/patient");
  return {
    ok: true,
    data: {
      id: r.id,
      patientId: r.patientId,
      patientName: session.user.name ?? "",
      storagePath: r.storagePath,
      originalName: r.originalName,
      createdAt: r.createdAt.toISOString(),
    },
  };
}

export async function deletePatientUpload(id: number): Promise<ActionResult> {
  const session = await assertSession();
  const row = await getUploadRow(id);
  if (!row) return { ok: false, error: "Archivo no encontrado" };

  // Admin can delete any upload (moderation); patients only their own.
  if (session.user.role !== "admin" && row.patientId !== sessionUserId(session)) {
    return { ok: false, error: "No autorizado" };
  }

  await removeObject(BUCKET_UPLOADS, row.storagePath);
  await db.delete(patientUploads).where(eq(patientUploads.id, id));

  revalidatePath("/admin");
  revalidatePath("/patient");
  return { ok: true, data: undefined };
}

export async function getUploadFileUrl(
  id: number,
): Promise<ActionResult<string>> {
  const session = await assertSession();
  const row = await getUploadRow(id);
  if (!row) return { ok: false, error: "Archivo no encontrado" };

  if (session.user.role !== "admin" && row.patientId !== sessionUserId(session)) {
    return { ok: false, error: "No autorizado" };
  }

  try {
    const url = await getSignedDownloadUrl(BUCKET_UPLOADS, row.storagePath);
    return { ok: true, data: url };
  } catch {
    return { ok: false, error: "No se pudo abrir el archivo" };
  }
}
