"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { content, users } from "@/lib/db/schema";
import { assertAdmin, assertSession, sessionUserId } from "@/lib/dal";
import {
  getContentForPatient,
  getContentRow,
  patientOwnsContent,
} from "@/lib/queries";
import {
  BUCKET_CONTENT,
  buildObjectPath,
  createSignedUpload,
  getSignedDownloadUrl,
  removeObject,
} from "@/lib/storage";
import { notifyWhatsApp } from "@/lib/notify";
import type { ActionResult, ContentDTO } from "@/lib/types";

function toDTO(r: typeof content.$inferSelect): ContentDTO {
  return {
    id: r.id,
    patientId: r.patientId,
    type: r.type,
    title: r.title,
    url: r.url,
    storagePath: r.storagePath,
    originalName: r.originalName,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Step 1 (file): get a signed URL so the browser uploads bytes directly. */
export async function prepareContentUpload(
  patientId: number,
  originalName: string,
): Promise<ActionResult<{ bucket: string; path: string; token: string }>> {
  await assertAdmin();
  try {
    const { path, token } = await createSignedUpload(
      BUCKET_CONTENT,
      buildObjectPath(patientId, originalName),
    );
    return { ok: true, data: { bucket: BUCKET_CONTENT, path, token } };
  } catch {
    return { ok: false, error: "No se pudo preparar la subida" };
  }
}

const fileSchema = z.object({
  patientId: z.number().int(),
  title: z.string().trim().min(1),
  storagePath: z.string().min(1),
  originalName: z.string().min(1),
});

/** Step 2 (file): register the uploaded object as content. */
export async function registerFileContent(
  input: unknown,
): Promise<ActionResult<ContentDTO>> {
  const session = await assertAdmin();
  const parsed = fileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const inserted = await db
    .insert(content)
    .values({
      patientId: parsed.data.patientId,
      uploadedBy: sessionUserId(session),
      type: "file",
      title: parsed.data.title,
      storagePath: parsed.data.storagePath,
      originalName: parsed.data.originalName,
    })
    .returning();

  const patient = await db.query.users.findFirst({
    where: eq(users.id, parsed.data.patientId),
    columns: { phone: true, name: true },
  });
  notifyWhatsApp(patient?.phone ?? null);

  revalidatePath("/admin");
  return { ok: true, data: toDTO(inserted[0]) };
}

const linkSchema = z.object({
  patientId: z.number().int(),
  title: z.string().trim().min(1, "El título es requerido"),
  url: z.string().trim().url("URL inválida"),
  type: z.enum(["link", "video"]),
});

export async function addLink(input: unknown): Promise<ActionResult<ContentDTO>> {
  const session = await assertAdmin();
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const inserted = await db
    .insert(content)
    .values({
      patientId: parsed.data.patientId,
      uploadedBy: sessionUserId(session),
      type: parsed.data.type,
      title: parsed.data.title,
      url: parsed.data.url,
    })
    .returning();

  const patient = await db.query.users.findFirst({
    where: eq(users.id, parsed.data.patientId),
    columns: { phone: true, name: true },
  });
  notifyWhatsApp(patient?.phone ?? null);

  revalidatePath("/admin");
  return { ok: true, data: toDTO(inserted[0]) };
}

export async function deleteContent(id: number): Promise<ActionResult> {
  await assertAdmin();
  const row = await getContentRow(id);
  if (!row) return { ok: false, error: "Contenido no encontrado" };

  if (row.storagePath) {
    await removeObject(BUCKET_CONTENT, row.storagePath);
  }
  await db.delete(content).where(eq(content.id, id));

  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

/** List the content shared with a patient (admin, or the patient themselves). */
export async function listContent(
  patientId: number,
): Promise<ActionResult<ContentDTO[]>> {
  const session = await assertSession();
  if (session.user.role !== "admin" && sessionUserId(session) !== patientId) {
    return { ok: false, error: "No autorizado" };
  }
  return { ok: true, data: await getContentForPatient(patientId) };
}

/** Resolve a short-lived signed download URL for a content file. */
export async function getContentFileUrl(
  id: number,
): Promise<ActionResult<string>> {
  const session = await assertSession();
  const row = await getContentRow(id);
  if (!row || !row.storagePath) {
    return { ok: false, error: "Archivo no encontrado" };
  }

  if (session.user.role !== "admin") {
    const owns = await patientOwnsContent(sessionUserId(session), id);
    if (!owns) return { ok: false, error: "No autorizado" };
  }

  try {
    const url = await getSignedDownloadUrl(BUCKET_CONTENT, row.storagePath);
    return { ok: true, data: url };
  } catch {
    return { ok: false, error: "No se pudo abrir el archivo" };
  }
}
