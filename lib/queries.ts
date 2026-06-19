import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clinicalRecords, content, patientUploads, users } from "@/lib/db/schema";
import { parseClinical } from "@/lib/types";
import type { ContentDTO, PatientDTO, UploadDTO } from "@/lib/types";

const iso = (d: Date) => d.toISOString();

/** All patients (admin view), with their clinical chart, ordered by name. */
export async function getPatients(): Promise<PatientDTO[]> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      age: users.age,
      phone: users.phone,
      createdAt: users.createdAt,
      clinical: clinicalRecords.data,
    })
    .from(users)
    .leftJoin(clinicalRecords, eq(clinicalRecords.patientId, users.id))
    .where(eq(users.role, "patient"))
    .orderBy(users.name);

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    name: r.name,
    age: r.age,
    phone: r.phone,
    createdAt: iso(r.createdAt),
    clinical: parseClinical(r.clinical),
  }));
}

/** A single patient with clinical chart (admin view). */
export async function getPatient(id: number): Promise<PatientDTO | null> {
  const row = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      age: users.age,
      phone: users.phone,
      createdAt: users.createdAt,
      clinical: clinicalRecords.data,
    })
    .from(users)
    .leftJoin(clinicalRecords, eq(clinicalRecords.patientId, users.id))
    .where(and(eq(users.id, id), eq(users.role, "patient")))
    .limit(1);

  const r = row[0];
  if (!r) return null;
  return {
    id: r.id,
    username: r.username,
    name: r.name,
    age: r.age,
    phone: r.phone,
    createdAt: iso(r.createdAt),
    clinical: parseClinical(r.clinical),
  };
}

/** Content shared with a patient (newest first). */
export async function getContentForPatient(
  patientId: number,
): Promise<ContentDTO[]> {
  const rows = await db
    .select()
    .from(content)
    .where(eq(content.patientId, patientId))
    .orderBy(desc(content.createdAt));

  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    type: r.type,
    title: r.title,
    url: r.url,
    storagePath: r.storagePath,
    originalName: r.originalName,
    createdAt: iso(r.createdAt),
  }));
}

/** All patient uploads grouped-ready (admin view), newest first. */
export async function getAllPatientUploads(): Promise<UploadDTO[]> {
  const rows = await db
    .select({
      id: patientUploads.id,
      patientId: patientUploads.patientId,
      patientName: users.name,
      storagePath: patientUploads.storagePath,
      originalName: patientUploads.originalName,
      createdAt: patientUploads.createdAt,
    })
    .from(patientUploads)
    .leftJoin(users, eq(users.id, patientUploads.patientId))
    .orderBy(desc(patientUploads.createdAt));

  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patientName ?? "Desconocido",
    storagePath: r.storagePath,
    originalName: r.originalName,
    createdAt: iso(r.createdAt),
  }));
}

/** A single patient's own uploads (newest first). */
export async function getMyUploads(patientId: number): Promise<UploadDTO[]> {
  const rows = await db
    .select({
      id: patientUploads.id,
      patientId: patientUploads.patientId,
      patientName: users.name,
      storagePath: patientUploads.storagePath,
      originalName: patientUploads.originalName,
      createdAt: patientUploads.createdAt,
    })
    .from(patientUploads)
    .leftJoin(users, eq(users.id, patientUploads.patientId))
    .where(eq(patientUploads.patientId, patientId))
    .orderBy(desc(patientUploads.createdAt));

  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patientName ?? "Desconocido",
    storagePath: r.storagePath,
    originalName: r.originalName,
    createdAt: iso(r.createdAt),
  }));
}

/** Look up the bucket path + ownership for a content row. */
export async function getContentRow(id: number) {
  return db.query.content.findFirst({ where: eq(content.id, id) });
}

/** Look up the bucket path + ownership for a patient upload row. */
export async function getUploadRow(id: number) {
  return db.query.patientUploads.findFirst({
    where: eq(patientUploads.id, id),
  });
}

/** Used to gate patient access to their own content. */
export async function patientOwnsContent(patientId: number, contentId: number) {
  const row = await db.query.content.findFirst({
    where: and(eq(content.id, contentId), eq(content.patientId, patientId)),
    columns: { id: true },
  });
  return Boolean(row);
}
