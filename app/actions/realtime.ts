"use server";

import { SignJWT } from "jose";
import { assertSession, sessionUserId } from "@/lib/dal";

/**
 * Mint a short-lived Supabase-compatible JWT for the current user so that
 * Realtime subscriptions are scoped by RLS to rows the user may see.
 *
 * Claims:
 *  - role: "authenticated" → maps to the Postgres `authenticated` role
 *  - sub:  the user id      → used by RLS policies (auth.jwt() ->> 'sub')
 *  - user_role: admin|patient → used by RLS policies for admin override
 */
export async function getRealtimeToken(): Promise<string | null> {
  const session = await assertSession();

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  const key = new TextEncoder().encode(secret);
  return new SignJWT({
    role: "authenticated",
    user_role: session.user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(sessionUserId(session)))
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}
