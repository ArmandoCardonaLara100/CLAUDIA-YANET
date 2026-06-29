"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { assertAdmin, assertSession, sessionUserId } from "@/lib/dal";
import { getMyReview } from "@/lib/queries";
import { anonymizeName } from "@/lib/types";
import type { ActionResult, ReviewDTO } from "@/lib/types";

const submitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Cuéntale a Claudia un poco más").max(1000),
});

/** Patients submit exactly one review of their therapist; pending admin approval. */
export async function submitReview(
  input: unknown,
): Promise<ActionResult<ReviewDTO>> {
  const session = await assertSession();
  if (session.user.role !== "patient") {
    return { ok: false, error: "Solo los pacientes pueden dejar una reseña" };
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const patientId = sessionUserId(session);
  if (await getMyReview(patientId)) {
    return { ok: false, error: "Ya enviaste tu reseña" };
  }

  const inserted = await db
    .insert(reviews)
    .values({
      patientId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      displayName: anonymizeName(session.user.name ?? "Paciente"),
    })
    .onConflictDoNothing({ target: reviews.patientId })
    .returning();

  const r = inserted[0];
  if (!r) return { ok: false, error: "Ya enviaste tu reseña" };

  revalidatePath("/admin");
  revalidatePath("/patient");
  return {
    ok: true,
    data: {
      id: r.id,
      patientId: r.patientId,
      rating: r.rating,
      comment: r.comment,
      displayName: r.displayName,
      approved: r.approved,
      createdAt: r.createdAt.toISOString(),
    },
  };
}

export async function approveReview(id: number): Promise<ActionResult> {
  await assertAdmin();
  await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

/** Used both to reject a pending review and to remove an already-published one. */
export async function deleteReview(id: number): Promise<ActionResult> {
  await assertAdmin();
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin");
  revalidatePath("/patient");
  revalidatePath("/");
  return { ok: true, data: undefined };
}
