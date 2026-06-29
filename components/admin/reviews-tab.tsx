"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Check, Loader2, MessageSquareHeart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { approveReview, deleteReview } from "@/app/actions/reviews";
import { formatDateTime } from "@/lib/format";
import type { ReviewDTO } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

export function ReviewsTab({
  reviews,
  setReviews,
}: {
  reviews: ReviewDTO[];
  setReviews: Dispatch<SetStateAction<ReviewDTO[]>>;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    setBusyId(id);
    const res = await approveReview(id);
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r)),
    );
    toast.success("Reseña publicada");
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    const res = await deleteReview(id);
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reseña eliminada");
  }

  if (reviews.length === 0) {
    return (
      <div className="text-muted-foreground py-16 text-center">
        <MessageSquareHeart className="mx-auto mb-2 size-12 opacity-40" />
        <p>No hay reseñas todavía</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <StarRating value={r.rating} />
              {r.approved ? (
                <Badge className="bg-primary text-primary-foreground">
                  Publicada
                </Badge>
              ) : (
                <Badge variant="outline">Pendiente</Badge>
              )}
            </div>
            <p className="text-foreground text-sm leading-relaxed">
              “{r.comment}”
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{r.displayName}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(r.createdAt)}
                </p>
              </div>
              <div className="flex gap-1">
                {!r.approved && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-primary"
                    disabled={busyId === r.id}
                    onClick={() => handleApprove(r.id)}
                    title="Aprobar y publicar"
                  >
                    {busyId === r.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  disabled={busyId === r.id}
                  onClick={() => handleDelete(r.id)}
                  title={r.approved ? "Eliminar" : "Rechazar"}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
