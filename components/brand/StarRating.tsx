/** Five gold stars for verified review quotes. Unicode ★ — no icon library needed. */
export interface StarRatingProps {
  rating?: number;
  tone?: "light" | "dark";
  /** Glyph size in px. */
  size?: number;
  /** Accessible label; defaults to "N out of 5". */
  label?: string;
  className?: string;
}

export function StarRating({
  rating = 5,
  tone = "light",
  size = 16,
  label,
  className,
}: StarRatingProps) {
  const filled = Math.round(rating);
  return (
    <p
      aria-label={label || `${rating} out of 5`}
      className={`m-0 inline-flex gap-[2px] leading-none ${
        tone === "dark" ? "text-gold" : "text-gold-deep"
      }${className ? ` ${className}` : ""}`}
      style={{ fontSize: `${size}px` }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden="true" className={i <= filled ? undefined : "opacity-[0.28]"}>
          &#9733;
        </span>
      ))}
    </p>
  );
}
