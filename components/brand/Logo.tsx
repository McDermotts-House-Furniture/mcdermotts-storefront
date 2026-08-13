import Image from "next/image";
import Link from "next/link";

/* Aspect ratio of the supplied wordmark (viewBox 636.12 × 116.2). */
const LOGO_RATIO = 116.2 / 636.12;

/** The McDermott's House Furnishers wordmark. Supplied SVG only — never redrawn or reconstructed. */
export interface LogoProps {
  /** `onDark` inverts the black wordmark to read on dark blocks. */
  tone?: "ink" | "onDark";
  /** Rendered width in px; height follows the wordmark's aspect ratio. */
  width?: number;
  href?: string;
  className?: string;
}

export function Logo({ tone = "ink", width = 260, href, className }: LogoProps) {
  const img = (
    <Image
      src="/mcdermotts-logo.svg"
      alt="McDermott's House Furnishers"
      width={width}
      height={Math.round(width * LOGO_RATIO)}
      unoptimized
      className={`block h-auto${tone === "onDark" ? " invert" : ""}`}
    />
  );
  if (href) {
    const cls = `inline-block${className ? ` ${className}` : ""}`;
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls}>
          {img}
        </Link>
      );
    }
    return (
      <a href={href} className={cls}>
        {img}
      </a>
    );
  }
  return <span className={`inline-block${className ? ` ${className}` : ""}`}>{img}</span>;
}
