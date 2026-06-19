import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/** Memoized per-request session read. */
export const getSession = cache(async () => auth());

/* ---- Page guards (redirect on failure) ---- */

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/portal");
  return session;
}

export async function requirePatient(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "patient") redirect("/portal");
  return session;
}

/* ---- Server-action guards (throw on failure) ---- */

export class AuthorizationError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function assertSession(): Promise<Session> {
  const session = await getSession();
  if (!session?.user) throw new AuthorizationError();
  return session;
}

export async function assertAdmin(): Promise<Session> {
  const session = await assertSession();
  if (session.user.role !== "admin") {
    throw new AuthorizationError("Solo para administradores");
  }
  return session;
}

/** Returns the numeric user id from the session (Auth.js stores it as a string). */
export function sessionUserId(session: Session): number {
  return Number(session.user.id);
}
