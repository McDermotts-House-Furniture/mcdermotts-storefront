import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { EyebrowLabel } from "../core/EyebrowLabel";
import { TextLink } from "../core/TextLink";

/** Blog/edit card. `featured` is the big two-column treatment for the single lead story. */
export interface EditorialCardProps {
  /** e.g. "Colour Story · No. 01" or "New this week". */
  eyebrow?: string;
  title?: ReactNode;
  excerpt?: string;
  href?: string;
  image?: string;
  alt?: string;
  /** Big side-by-side layout on a white card. One per page. */
  featured?: boolean;
  /** Optional text-link label, e.g. "Read it now". */
  cta?: string;
  /** next/image responsive sizes hint. */
  sizes?: string;
  className?: string;
}

function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function EditorialCard({
  eyebrow,
  title,
  excerpt,
  href = "#",
  image,
  alt = "",
  featured = false,
  cta,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
}: EditorialCardProps) {
  return (
    <article
      className={[
        "grid overflow-hidden rounded-md",
        featured
          ? "items-center gap-10 bg-white shadow-card md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          : "gap-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardLink
        href={href}
        className="group block aspect-[var(--ratio-editorial)] overflow-hidden bg-stone"
      >
        {image ? (
          <div className="relative h-full w-full">
            <Image
              src={image}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-[var(--dur-slow)] ease-out group-hover:scale-[1.035]"
            />
          </div>
        ) : null}
      </CardLink>
      <div className={`flex flex-col gap-3${featured ? " p-8 md:pl-0" : ""}`}>
        {eyebrow ? <EyebrowLabel>{eyebrow}</EyebrowLabel> : null}
        <h3
          className={`m-0 font-bold leading-[var(--lh-heading)] ${
            featured ? "text-[length:var(--fs-h2)]" : "text-[length:var(--fs-h4)]"
          }`}
        >
          <CardLink href={href} className="text-ink no-underline">
            {title}
          </CardLink>
        </h3>
        {excerpt ? (
          <p className="m-0 max-w-[var(--measure-body)] text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft">
            {excerpt}
          </p>
        ) : null}
        {cta ? (
          <div className="mt-2">
            <TextLink href={href}>{cta}</TextLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
