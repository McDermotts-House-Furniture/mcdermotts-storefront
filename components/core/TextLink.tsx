import Link from "next/link";
import type { ReactNode } from "react";

/** Underlined inline link with an optional arrow; used for "Browse everything"-style exits. */
export interface TextLinkProps {
  href?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  /** Trailing → that nudges right on hover. */
  arrow?: boolean;
  className?: string;
}

export function TextLink({
  href = "#",
  children,
  tone = "light",
  arrow = true,
  className,
}: TextLinkProps) {
  const dark = tone === "dark";
  const cls = [
    "group inline-flex items-center gap-2 border-b pb-[3px] text-[length:var(--fs-small)] font-bold no-underline transition-[color,border-color] duration-[var(--dur-base)] ease-out",
    dark
      ? "border-on-dark-border text-on-dark hover:border-current hover:text-gold"
      : "border-hairline text-ink hover:border-current hover:text-gold-deep",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      {arrow ? (
        <span
          aria-hidden="true"
          className="transition-transform duration-[var(--dur-base)] ease-out group-hover:translate-x-[3px]"
        >
          &rarr;
        </span>
      ) : null}
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}
