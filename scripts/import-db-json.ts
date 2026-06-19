/**
 * One-time migration of the legacy PsiConnect data (../server/db.json) into
 * Supabase Postgres + Storage.
 *
 *   npm run import
 *
 * Idempotent: existing rows (by id) and storage objects are upserted/skipped,
 * so it's safe to re-run. bcrypt password hashes carry over verbatim, so the
 * original logins (e.g. Claudia / Clau123) keep working.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  clinicalRecords,
  content,
  patientUploads,
  users,
} from "../lib/db/schema";
import { parseClinical } from "../lib/types";

const DB_JSON = resolve(process.cwd(), "../server/db.json");
const UPLOADS_DIR = resolve(process.cwd(), "../server/uploads");

const BUCKET_CONTENT = "content";
const BUCKET_UPLOADS = "patient-uploads";

type LegacyUser = {
  id: number;
  username: string;
  password: string;
  role: "admin" | "patient";
  name: string;
  age: string | number | null;
  phone: string | null;
  created_at: string;
};
type LegacyClinical = { id: number; patient_id: number; text: string; updated_at: string };
type LegacyContent = {
  id: number;
  patient_id: number;
  uploaded_by: number | null;
  type: "file" | "link" | "video";
  title: string;
  url: string | null;
  filename: string | null;
  original_name: string | null;
  created_at: string;
};
type LegacyUpload = {
  id: number;
  patient_id: number;
  filename: string;
  original_name: string;
  created_at: string;
};
type LegacyDB = {
  users: LegacyUser[];
  clinical_records: LegacyClinical[];
  content: LegacyContent[];
  patient_uploads: LegacyUpload[];
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  if (!existsSync(DB_JSON)) {
    throw new Error(`Could not find legacy DB at ${DB_JSON}`);
  }
  const data = JSON.parse(readFileSync(DB_JSON, "utf-8")) as LegacyDB;

  const client = postgres(
    process.env.DIRECT_URL ?? requireEnv("DATABASE_URL"),
    { prepare: false },
  );
  const db = drizzle(client);

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );

  // ── Users ──
  for (const u of data.users) {
    await db
      .insert(users)
      .values({
        id: u.id,
        username: u.username,
        password: u.password,
        role: u.role,
        name: u.name,
        age: u.age == null ? null : String(u.age),
        phone: u.phone,
        createdAt: new Date(u.created_at),
      })
      .onConflictDoNothing();
  }
  console.log(`✓ users: ${data.users.length}`);

  // ── Clinical records ──
  for (const c of data.clinical_records) {
    await db
      .insert(clinicalRecords)
      .values({
        id: c.id,
        patientId: c.patient_id,
        data: parseClinical(c.text),
        updatedAt: new Date(c.updated_at),
      })
      .onConflictDoNothing();
  }
  console.log(`✓ clinical_records: ${data.clinical_records.length}`);

  // ── Content (uploads any legacy files to the `content` bucket) ──
  for (const item of data.content) {
    let storagePath: string | null = null;
    if (item.filename) {
      storagePath = await uploadLegacyFile(
        supabase,
        BUCKET_CONTENT,
        item.patient_id,
        item.filename,
      );
    }
    await db
      .insert(content)
      .values({
        id: item.id,
        patientId: item.patient_id,
        uploadedBy: item.uploaded_by,
        type: item.type,
        title: item.title,
        url: item.url,
        storagePath,
        originalName: item.original_name,
        createdAt: new Date(item.created_at),
      })
      .onConflictDoNothing();
  }
  console.log(`✓ content: ${data.content.length}`);

  // ── Patient uploads ──
  for (const up of data.patient_uploads) {
    const storagePath = await uploadLegacyFile(
      supabase,
      BUCKET_UPLOADS,
      up.patient_id,
      up.filename,
    );
    if (!storagePath) continue;
    await db
      .insert(patientUploads)
      .values({
        id: up.id,
        patientId: up.patient_id,
        storagePath,
        originalName: up.original_name,
        createdAt: new Date(up.created_at),
      })
      .onConflictDoNothing();
  }
  console.log(`✓ patient_uploads: ${data.patient_uploads.length}`);

  // ── Bump identity sequences past the imported explicit ids ──
  for (const table of [
    "users",
    "clinical_records",
    "content",
    "patient_uploads",
  ]) {
    await db.execute(
      sql`select setval(pg_get_serial_sequence(${`public.${table}`}, 'id'),
        greatest((select coalesce(max(id), 0) from ${sql.raw(`public.${table}`)}), 1))`,
    );
  }
  console.log("✓ sequences reset");

  await client.end();
  console.log("\n✅ Import complete.");
}

async function uploadLegacyFile(
  supabase: SupabaseClient,
  bucket: string,
  patientId: number,
  filename: string,
): Promise<string | null> {
  const filePath = resolve(UPLOADS_DIR, filename);
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ missing file, skipping: ${filename}`);
    return null;
  }
  const buffer = readFileSync(filePath);
  const objectPath = `${patientId}/${randomUUID()}${extname(filename)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, buffer, { upsert: true });
  if (error) {
    console.warn(`  ⚠ upload failed for ${filename}: ${error.message}`);
    return null;
  }
  return objectPath;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
