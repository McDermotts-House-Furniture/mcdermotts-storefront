import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "../core/Badge";

/**
 * Product card, purely presentational.
 * Homepage top picks: pass `descriptor`, no price — a short factual line fills the price slot.
 * Category pages: pass pre-formatted `price` (and `oldPrice` + `onSale` while a sale runs).
 */
export interface ProductCardProps {
  /** Shown beside the title, right-aligned, e.g. "Fama". */
  brand?: string;
  title?: string;
  /** Homepage variant: one-line descriptor in place of a price. Verified against the live catalogue. */
  descriptor?: string;
  /** Category variant: formatted current price string, e.g. "€1,299". Takes the descriptor's slot. */
  price?: string;
  /** Formatted pre-sale price, struck through beside `price`. */
  oldPrice?: string;
  /** Product or range page; internal paths ("/...") use next/link. */
  href?: string;
  image?: string;
  alt?: string;
  /** Gold sale badge — only while a sale is running. */
  onSale?: boolean;
  /** Skip lazy-loading for cards above the fold. */
  eager?: boolean;
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

/* Media frame is 1:1, not the DS's 4:5 — the client's product photography is
   square, and a portrait frame crops sofas badly (Conor, 2026-08-14). */
export function ProductCard({
  brand,
  title,
  descriptor,
  price,
  oldPrice,
  href = "#",
  image,
  alt = "",
  onSale = false,
  eager = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  className,
}: ProductCardProps) {
  return (
    <article className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
      <CardLink
        href={href}
        className="group relative block aspect-square overflow-hidden rounded-md bg-stone"
      >
        {image ? (
          <Image
            src={image}
            alt={alt}
            fill
            sizes={sizes}
            priority={eager}
            className="object-cover transition-transform duration-[var(--dur-slow)] ease-out group-hover:scale-[1.035]"
          />
        ) : null}
        {onSale ? (
          <span className="absolute top-3 left-3">
            <Badge>Sale</Badge>
          </span>
        ) : null}
      </CardLink>
      <div className="flex flex-col gap-2">
        {/* Brand moved beside the title instead of stacked above it (Declan,
            2026-08-27: "the sofa range names are too far away from its own
            images... move brand names to the right side under the image if
            you must") — a dedicated brand line, present or not, was adding
            a full line of height above every title, on top of which the
            previous fix (a non-breaking-space placeholder to keep brand and
            non-brand cards aligned) only made permanent. Titles now sit the
            same short distance under the image on every card, brand or not.
            flex-wrap: a long product title (category/related-products use
            this same card with real WooCommerce names, not just short range
            names) drops the brand to its own line underneath rather than
            forcing a collision. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className="m-0 text-[length:var(--fs-h3)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading">
            <CardLink href={href} className="text-ink no-underline">
              {title}
            </CardLink>
          </h3>
          {brand ? (
            <span className="text-[length:var(--fs-micro)] whitespace-nowrap uppercase tracking-eyebrow text-ink-soft">
              {brand}
            </span>
          ) : null}
        </div>
        {price ? (
          <p className="m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)]">
            {/* Red, not text-ink, whenever onSale (Declan, 2026-08-27) —
                driven by lib/store-api's isPermanentlyLow at the call site,
                not raw on_sale; see there for why. */}
            <span className={`font-bold ${onSale ? "text-red" : "text-ink"}`}>{price}</span>
            {oldPrice ? (
              <span className="ml-2 text-ink-soft line-through">{oldPrice}</span>
            ) : null}
          </p>
        ) : (
          <p className="m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft">
            {descriptor}
          </p>
        )}
      </div>
    </article>
  );
}
