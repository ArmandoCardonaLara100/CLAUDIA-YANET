import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Private buckets (created in Supabase; see README / Task 9 setup).
export const BUCKET_CONTENT = "content"; // admin → patient material
export const BUCKET_UPLOADS = "patient-uploads"; // patient → admin deliverables

const SIGNED_URL_TTL = 60; // seconds — short-lived download links

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}

/** Build a namespaced object path: `<patientId>/<uuid><ext>`. */
export function buildObjectPath(patientId: number, originalName: string): string {
  return `${patientId}/${randomUUID()}${extOf(originalName)}`;
}

/**
 * Create a signed upload URL/token so the browser can upload the file bytes
 * directly to Supabase Storage (bypassing Vercel's request-body limit).
 */
export async function createSignedUpload(bucket: string, objectPath: string) {
  const { data, error } = await supabaseAdmin()
    .storage.from(bucket)
    .createSignedUploadUrl(objectPath);
  if (error) throw error;
  return { path: objectPath, token: data.token };
}

/** Short-lived signed download URL for a private object. */
export async function getSignedDownloadUrl(
  bucket: string,
  objectPath: string,
): Promise<string> {
  const { data, error } = await supabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(objectPath, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
}

/** Delete an object (best-effort; ignores "not found"). */
export async function removeObject(
  bucket: string,
  objectPath: string,
): Promise<void> {
  await supabaseAdmin().storage.from(bucket).remove([objectPath]);
}
