import type { ReactNode } from "react";
import { EyebrowLabel } from "./EyebrowLabel";

/**
 * Eyebrow + uppercase section title + optional standfirst.
 * One H1 per page (hero); every other section is H2.
 */
export interface SectionHeadingProps {
  eyebrow?: string;
  title?: ReactNode;
  standfirst?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  level?: "h1" | "h2";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  standfirst,
  tone = "light",
  align = "left",
  level = "h2",
  className,
}: SectionHeadingProps) {
  const H = level;
  const dark = tone === "dark";
  const centred = align === "center";
  return (
    <div
      className={[
        "flex flex-col gap-3",
        centred ? "mx-auto max-w-[var(--measure-lead)] items-center text-center" : "items-start text-left",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <EyebrowLabel tone={tone}>{eyebrow}</EyebrowLabel> : null}
      <H
        className={[
          "m-0 font-bold uppercase",
          level === "h1"
            ? "text-[length:var(--fs-hero)] leading-[var(--lh-tight)] tracking-hero"
            : "text-[length:var(--fs-h2)] leading-[var(--lh-heading)] tracking-heading",
          dark ? "text-on-dark" : "text-ink",
        ].join(" ")}
      >
        {title}
      </H>
      {standfirst ? (
        <p
          className={`m-0 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] ${
            dark ? "text-on-dark-muted" : "text-ink-soft"
          }`}
        >
          {standfirst}
        </p>
      ) : null}
    </div>
  );
}
