"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star display (e.g. "4.5" renders 4 full + 1 half-toned star). */
export function StarRating({
  value,
  size = "size-4",
  className,
}: {
  value: number;
  size?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size,
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-amber-400/30",
          )}
        />
      ))}
    </div>
  );
}

/** Interactive 1-5 star picker (click to set, hover to preview). */
export function StarRatingInput({
  value,
  onChange,
  size = "size-7",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              size,
              i <= shown
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-amber-400/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
