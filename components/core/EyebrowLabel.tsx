import type { ReactNode } from "react";

/** Small uppercase gold label that sits above a section title or card heading. */
export interface EyebrowLabelProps {
  children?: ReactNode;
  /** `dark` uses brand gold for dark blocks; `light` uses the deeper readable gold. */
  tone?: "light" | "dark";
  as?: "p" | "span" | "div";
  className?: string;
}

export function EyebrowLabel({
  children,
  tone = "light",
  as: Tag = "p",
  className,
}: EyebrowLabelProps) {
  return (
    <Tag
      className={`m-0 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow ${
        tone === "dark" ? "text-gold" : "text-gold-deep"
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </Tag>
  );
}
