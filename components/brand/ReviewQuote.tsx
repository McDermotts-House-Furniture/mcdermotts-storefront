import type { ReactNode } from "react";
import { TextLink } from "../core/TextLink";
import { StarRating } from "./StarRating";

/** One verified review quote with stars, source line and a link to the full reviews. */
export interface ReviewQuoteProps {
  /** Customer's words. Typos tidied, meaning untouched. */
  quote?: ReactNode;
  /** e.g. "Verified Google review — Castlebar". */
  source?: string;
  rating?: number;
  linkLabel?: string;
  linkHref?: string;
  tone?: "light" | "dark";
  size?: "lg" | "md";
  className?: string;
}

export function ReviewQuote({
  quote,
  source,
  rating = 5,
  linkLabel,
  linkHref,
  tone = "light",
  size = "lg",
  className,
}: ReviewQuoteProps) {
  const dark = tone === "dark";
  return (
    <figure
      className={`m-0 flex flex-col items-start gap-4${className ? ` ${className}` : ""}`}
    >
      <StarRating rating={rating} tone={tone} />
      <blockquote
        className={`m-0 max-w-[var(--measure-lead)] leading-[var(--lh-lead)] ${
          size === "lg" ? "text-[length:var(--fs-lead)]" : "text-[length:var(--fs-body)]"
        } ${dark ? "text-on-dark" : "text-ink"}`}
      >
        {quote}
      </blockquote>
      <figcaption
        className={`text-[length:var(--fs-micro)] uppercase tracking-eyebrow ${
          dark ? "text-on-dark-muted" : "text-ink-soft"
        }`}
      >
        {source}
      </figcaption>
      {linkLabel ? (
        <TextLink href={linkHref || "#"} tone={tone}>
          {linkLabel}
        </TextLink>
      ) : null}
    </figure>
  );
}
