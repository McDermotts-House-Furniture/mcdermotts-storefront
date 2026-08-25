import type { ReactNode } from "react";

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
}

const tones: Record<NonNullable<SectionBlockProps["tone"]>, string> = {
  linen: "bg-stone text-ink",
  stone: "bg-stone text-ink",
  white: "bg-white text-ink",
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
}: SectionBlockProps) {
  return (
    <section
      id={id}
      className={`${tones[tone]} px-[var(--section-pad-x)] ${
        tight ? "py-[var(--section-pad-y-tight)]" : "py-[var(--section-pad-y)]"
      }${className ? ` ${className}` : ""}`}
    >
      <div className={`mx-auto flex flex-col gap-[var(--section-gap-title)] ${widths[width]}`}>
        {children}
      </div>
    </section>
  );
}
