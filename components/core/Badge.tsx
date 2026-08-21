import type { ReactNode } from "react";

/** Small uppercase pill. The `sale` tone uses the dedicated badge-sale tokens (red). */
export interface BadgeProps {
  children?: ReactNode;
  tone?: "sale" | "quiet" | "outline";
  className?: string;
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  sale: "bg-[var(--badge-sale-bg)] text-[var(--badge-sale-fg)]",
  quiet: "bg-ink text-linen",
  outline: "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--border-strong)]",
};

export function Badge({ children = "Sale", tone = "sale", className }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-[5px] text-[length:var(--fs-micro)] leading-none font-bold uppercase tracking-eyebrow ${tones[tone]}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </span>
  );
}
