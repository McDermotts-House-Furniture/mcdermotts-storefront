import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

/**
 * McDermott's button. Gold primary carries dark text, never white.
 * Renders a link when `href` is set (next/link for internal paths), a <button> otherwise.
 */
export interface ButtonProps {
  /** Visual treatment. `onDark` for use inside dark section blocks. */
  variant?: "primary" | "secondary" | "onDark" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Renders a link when set. Internal paths ("/...") use next/link. */
  href?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  className?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-button whitespace-nowrap no-underline cursor-pointer transition-[background-color,color,border-color] duration-[var(--dur-base)] ease-out";

const sizeText: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-[length:var(--fs-micro)]",
  md: "text-[length:var(--fs-eyebrow)]",
  lg: "text-[length:var(--fs-small)]",
};

/* Ghost buttons carry no box: padding, radius and min-height are dropped. */
const sizeBox: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-9 px-4 py-2.5",
  md: "min-h-[var(--tap-min)] px-[26px] py-3.5",
  lg: "min-h-[var(--tap-min)] px-[34px] py-[18px]",
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "rounded-sm border border-transparent bg-gold text-ink hover:bg-gold-hover",
  secondary:
    "rounded-sm border border-ink bg-transparent text-ink hover:bg-ink hover:text-linen",
  onDark:
    "rounded-sm border border-on-dark-border bg-transparent text-on-dark hover:border-linen hover:bg-[var(--mcd-white-16)]",
  ghost:
    "border-b border-current bg-transparent p-0 text-ink hover:text-gold-deep",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  onClick,
  disabled,
  type = "button",
  fullWidth,
  className,
}: ButtonProps) {
  const cls = [
    base,
    sizeText[size],
    variant === "ghost" ? "" : sizeBox[size],
    variants[variant],
    fullWidth ? "w-full" : "",
    disabled ? "pointer-events-none opacity-45" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls} onClick={onClick}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
