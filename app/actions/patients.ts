"use server";

import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  clinicalRecords,
  content,
  patientUploads,
  users,
} from "@/lib/db/schema";
import { assertAdmin } from "@/lib/dal";
import { getPatient } from "@/lib/queries";
import { BUCKET_CONTENT, BUCKET_UPLOADS, removeObject } from "@/lib/storage";
import { EMPTY_CLINICAL } from "@/lib/types";
import type { ActionResult, ClinicalData, PatientDTO } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  username: z.string().trim().min(1, "El usuario es requerido"),
  age: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
});

const createSchema = profileSchema.extend({
  password: z.string().min(1, "La contraseña es requerida"),
});

const updateSchema = profileSchema.extend({
  password: z.string().optional().nullable(),
});

function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Datos inválidos";
}

async function usernameTaken(username: string, excludeId?: number) {
  const row = await db.query.users.findFirst({
    where: excludeId
      ? and(eq(users.username, username), ne(users.id, excludeId))
      : eq(users.username, username),
    columns: { id: true },
  });
  return Boolean(row);
}

export async function createPatient(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  await assertAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { name, username, password, age, phone } = parsed.data;

  if (await usernameTaken(username)) {
    return { ok: false, error: "El nombre de usuario ya existe" };
  }

  const hash = bcrypt.hashSync(password, 10);
  const inserted = await db
    .insert(users)
    .values({ username, password: hash, role: "patient", name, age: age || null, phone: phone || null })
    .returning({ id: users.id });

  const id = inserted[0].id;
  await db
    .insert(clinicalRecords)
    .values({ patientId: id, data: EMPTY_CLINICAL })
    .onConflictDoNothing();

  const patient = await getPatient(id);
  revalidatePath("/admin");
  return { ok: true, data: patient! };
}

export async function updatePatient(
  id: number,
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  await assertAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { name, username, age, phone, password } = parsed.data;

  if (await usernameTaken(username, id)) {
    return { ok: false, error: "El nombre de usuario ya existe" };
  }

  const updated = await db
    .update(users)
    .set({ name, username, age: age || null, phone: phone || null })
    .where(and(eq(users.id, id), eq(users.role, "patient")))
    .returning({ id: users.id });

  if (updated.length === 0) {
    return { ok: false, error: "Paciente no encontrado" };
  }

  if (password) {
    await db
      .update(users)
      .set({ password: bcrypt.hashSync(password, 10) })
      .where(eq(users.id, id));
  }

  const patient = await getPatient(id);
  revalidatePath("/admin");
  return { ok: true, data: patient! };
}

export async function updateClinicalRecord(
  patientId: number,
  data: ClinicalData,
): Promise<ActionResult> {
  await assertAdmin();
  await db
    .insert(clinicalRecords)
    .values({ patientId, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: clinicalRecords.patientId,
      set: { data, updatedAt: new Date() },
    });
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

export async function deletePatient(id: number): Promise<ActionResult> {
  await assertAdmin();

  // Clean up storage objects before the DB cascade removes their rows.
  const [contentRows, uploadRows] = await Promise.all([
    db
      .select({ storagePath: content.storagePath })
      .from(content)
      .where(eq(content.patientId, id)),
    db
      .select({ storagePath: patientUploads.storagePath })
      .from(patientUploads)
      .where(eq(patientUploads.patientId, id)),
  ]);

  await Promise.allSettled([
    ...contentRows
      .filter((r) => r.storagePath)
      .map((r) => removeObject(BUCKET_CONTENT, r.storagePath!)),
    ...uploadRows.map((r) => removeObject(BUCKET_UPLOADS, r.storagePath)),
  ]);

  const deleted = await db
    .delete(users)
    .where(and(eq(users.id, id), eq(users.role, "patient")))
    .returning({ id: users.id });

  if (deleted.length === 0) {
    return { ok: false, error: "Paciente no encontrado" };
  }

  revalidatePath("/admin");
  return { ok: true, data: undefined };
}
