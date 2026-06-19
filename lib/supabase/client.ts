"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Browser Supabase client (anon key). Used for Realtime subscriptions and
 * direct-to-storage uploads via signed upload URLs.
 *
 * Returns null when the public env vars are missing so the app still runs
 * locally without a configured Supabase project (realtime simply no-ops).
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    client = null;
    return client;
  }

  client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
