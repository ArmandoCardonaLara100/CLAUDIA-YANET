"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getRealtimeToken } from "@/app/actions/realtime";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const RealtimeReadyContext = createContext(false);

/** True once the realtime client has an auth token set (or no client exists). */
export function useRealtimeReady() {
  return useContext(RealtimeReadyContext);
}

const REFRESH_MS = 50 * 60 * 1000; // refresh the 1h token before it expires

export function RealtimeProvider({ children }: { children: ReactNode }) {
  // When there's no configured Supabase client, start "ready" so the UI renders
  // (subscriptions simply no-op); otherwise become ready once auth is applied.
  const [ready, setReady] = useState(() => getSupabaseBrowser() === null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    let cancelled = false;

    async function apply() {
      const token = await getRealtimeToken();
      if (cancelled || !token) return;
      supabase!.realtime.setAuth(token);
      setReady(true);
    }

    apply();
    const interval = setInterval(apply, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <RealtimeReadyContext.Provider value={ready}>
      {children}
    </RealtimeReadyContext.Provider>
  );
}
