import type { CSSProperties, ReactNode } from "react";

/**
 * Full-bleed section wrapper with a centred container.
 * Alternate tones to pace the page: linen → linen → dark → linen → stone.
 */
export interface SectionBlockProps {
  tone?: "linen" | "stone" | "white" | "dark" | "darkest";
  /** Block id, e.g. "mcd-02-departments". */
  id?: string;
  /** Shorter vertical padding. */
  tight?: boolean;
  width?: "default" | "narrow" | "wide";
  children?: ReactNode;
  className?: string;
  /** Inline overrides (e.g. a one-off tighter paddingTop) — a `py-*` class
      here wouldn't reliably beat the base py- utility's own specificity, so
      this exists for the rare case that genuinely needs one. */
  style?: CSSProperties;
}

/* linen/stone both resolve to the page's own bg-surface-page (2026-08-27
   test: currently Linen, was Stone — see globals.css) — "white" is the
   card-surface token instead, not literal white, so it moves with the same
   test. */
const tones: Record<NonNullable<SectionBlockProps["tone"]>, string> = {
  linen: "bg-surface-page text-ink",
  stone: "bg-surface-page text-ink",
  white: "bg-surface-card text-ink",
  dark: "bg-dark text-on-dark",
  darkest: "bg-darker text-on-dark",
};

const widths: Record<NonNullable<SectionBlockProps["width"]>, string> = {
  default: "max-w-[var(--container-max)]",
  narrow: "max-w-[var(--container-narrow)]",
  wide: "max-w-[var(--container-wide)]",
};

export function SectionBlock({
  tone = "linen",
  id,
  tight = false,
  width = "default",
  children,
  className,
  style,
}: SectionBlockProps) {
  return (
    <section
      id={id}
      className={`${tones[tone]} px-[var(--section-pad-x)] ${
        tight ? "py-[var(--section-pad-y-tight)]" : "py-[var(--section-pad-y)]"
      }${className ? ` ${className}` : ""}`}
      style={style}
    >
      <div className={`mx-auto flex flex-col gap-[var(--section-gap-title)] ${widths[width]}`}>
        {children}
      </div>
    </section>
  );
}
