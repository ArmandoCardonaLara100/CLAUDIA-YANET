"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useRealtimeReady } from "@/components/providers/realtime-provider";

/** Raw row shapes as delivered by Supabase Realtime (snake_case columns). */
export type RawContent = {
  id: number;
  patient_id: number;
  type: "file" | "link" | "video";
  title: string;
  url: string | null;
  storage_path: string | null;
  original_name: string | null;
  created_at: string;
};

export type RawUpload = {
  id: number;
  patient_id: number;
  storage_path: string;
  original_name: string;
  created_at: string;
};

export type RawUser = {
  id: number;
  username: string;
  name: string;
  age: string | null;
  phone: string | null;
  role: "admin" | "patient";
  created_at: string;
};

export type RawClinical = {
  id: number;
  patient_id: number;
  data: unknown;
  updated_at: string;
};

export type RawReview = {
  id: number;
  patient_id: number;
  rating: number;
  comment: string;
  display_name: string;
  approved: boolean;
  created_at: string;
};

type Handlers<T> = {
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (oldRow: { id: number; patient_id?: number }) => void;
};

/**
 * Subscribe to Postgres changes on a table via Supabase Realtime.
 * No-ops when the browser Supabase client isn't configured.
 * Handlers are kept in a ref so the subscription isn't torn down on every render.
 */
export function useRealtime<T>(table: string, handlers: Handlers<T>) {
  const ref = useRef(handlers);
  const ready = useRealtimeReady();

  // Keep the latest handlers without re-subscribing on every render.
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!ready) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel(`rt:${table}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          if (payload.eventType === "INSERT") {
            ref.current.onInsert?.(payload.new as T);
          } else if (payload.eventType === "UPDATE") {
            ref.current.onUpdate?.(payload.new as T);
          } else if (payload.eventType === "DELETE") {
            ref.current.onDelete?.(
              payload.old as { id: number; patient_id?: number },
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, ready]);
}
