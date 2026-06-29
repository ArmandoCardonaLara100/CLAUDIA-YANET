import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";
import type { ReviewDTO } from "@/lib/types";
import { formatLongDate } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";

export function ReviewsSection({ reviews }: { reviews: ReviewDTO[] }) {
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section id="reviews" className="bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-280 px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-primary mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(61,139,110,0.18)] bg-[#E8F3EE] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <MessageSquareHeart className="size-3.5" />
            Reseñas
          </span>
          <h2 className="font-heading text-foreground text-3xl font-bold">
            Lo que dicen mis pacientes
          </h2>

          {reviews.length > 0 ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              <StarRating value={average} size="size-5" />
              <span className="text-foreground font-semibold">
                {average.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-sm">
                · {reviews.length}{" "}
                {reviews.length === 1 ? "reseña" : "reseñas"}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground mx-auto mt-3 max-w-140">
              Aún no hay reseñas publicadas. ¡Sé el primero en compartir tu
              experiencia desde el portal de pacientes!
            </p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-background flex flex-col rounded-2xl border border-[rgba(61,139,110,0.10)] p-6"
              >
                <StarRating value={r.rating} />
                <p className="text-foreground mt-3 flex-1 text-sm leading-relaxed">
                  “{r.comment}”
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-foreground text-sm font-semibold">
                    {r.displayName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatLongDate(r.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="text-muted-foreground mt-10 text-center text-sm">
          ¿Ya eres mi paciente?{" "}
          <Link href="/login" className="text-primary font-semibold underline">
            Inicia sesión en el portal
          </Link>{" "}
          para dejar tu propia reseña.
        </p>
      </div>
    </section>
  );
}
