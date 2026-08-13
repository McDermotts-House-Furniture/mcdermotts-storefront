"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/core/Badge";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery, type GalleryImage } from "@/components/product/ProductGallery";
import type { VariationPayload } from "@/app/api/variation/[id]/route";
import {
  isCompleteSelection,
  matchVariation,
  type Selection,
  type VariationRef,
} from "@/lib/variations";

export interface PurchaseAttribute {
  name: string;
  terms: { name: string; slug: string }[];
}

interface VariablePurchaseProps {
  productId: number;
  slug: string;
  name: string;
  images: GalleryImage[];
  attributes: PurchaseAttribute[];
  variations: VariationRef[];
  /** Server-formatted fallback price shown before a selection resolves. */
  basePrice: { current: string; isRange: boolean };
  /** Server-rendered nodes (brand eyebrow, H1, rating / short description / delivery note). */
  infoHeader: ReactNode;
  shortDescription?: ReactNode;
  footNote?: ReactNode;
}

export function VariablePurchase({
  productId,
  slug,
  name,
  images,
  attributes,
  variations,
  basePrice,
  infoHeader,
  shortDescription,
  footNote,
}: VariablePurchaseProps) {
  const [selection, setSelection] = useState<Selection>({});
  /* Last fetch result, keyed by the variation it was for. The displayed
     variation derives from this — a stale key simply reads as "not loaded",
     so the effect never has to reset state synchronously. */
  const [fetched, setFetched] = useState<{
    forId: number;
    data: VariationPayload | null;
  } | null>(null);

  const complete = isCompleteSelection(selection, attributes.map((a) => ({ ...a, has_variations: true })));
  const resolvedId = complete ? matchVariation(selection, variations) : null;

  /* One small fetch per resolved combination — never the whole variation set
     (Orla Kiely sofas run to 240 variations). Cached upstream for an hour. */
  useEffect(() => {
    if (resolvedId === null) return;
    const controller = new AbortController();
    fetch(`/api/variation/${resolvedId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VariationPayload | null) => {
        if (!controller.signal.aborted) setFetched({ forId: resolvedId, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFetched({ forId: resolvedId, data: null });
      });
    return () => controller.abort();
  }, [resolvedId]);

  const variation = fetched?.forId === resolvedId ? fetched.data : null;
  const loading = resolvedId !== null && fetched?.forId !== resolvedId;
  const failed = fetched?.forId === resolvedId && fetched.data === null;

  const variantLabel = attributes
    .map((a) => a.terms.find((t) => t.slug === selection[a.name])?.name)
    .filter(Boolean)
    .join(" · ");

  const unready = !complete
    ? "Choose your options"
    : resolvedId === null
      ? "Combination unavailable"
      : failed
        ? "Unavailable right now"
        : loading || !variation
          ? "Checking availability"
          : undefined;

  const galleryImages = variation?.image
    ? [{ src: variation.image.src, alt: variation.image.alt || name, thumb: variation.image.thumb }, ...images]
    : images;

  return (
    <div className="grid gap-[var(--grid-gap)] lg:grid-cols-2 lg:gap-16">
      <ProductGallery key={variation?.image?.src ?? "base"} images={galleryImages} name={name} />

      <div>
        {infoHeader}

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          {!variation && basePrice.isRange && (
            <span className="text-[length:var(--fs-small)] text-ink-soft">From</span>
          )}
          <span className="text-[length:var(--fs-h3)] font-bold">
            {variation ? variation.price : basePrice.current}
          </span>
          {variation?.oldPrice && (
            <>
              <s className="text-ink-soft">{variation.oldPrice}</s>
              <Badge>Sale</Badge>
            </>
          )}
        </div>

        <p className="mt-2 text-[length:var(--fs-small)] text-ink-soft" aria-live="polite">
          {variation
            ? variation.stockText
            : complete && resolvedId === null
              ? "That combination isn't available — try different options."
              : "Choose your options to check availability."}
        </p>

        {shortDescription}

        <div className="mt-8 grid max-w-md gap-4">
          {attributes.map((attr) => (
            <label key={attr.name} className="grid gap-1">
              <span className="text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft">
                {attr.name}
              </span>
              <select
                value={selection[attr.name] ?? ""}
                onChange={(e) =>
                  setSelection((s) => ({ ...s, [attr.name]: e.target.value }))
                }
                className="min-h-[var(--tap-min)] cursor-pointer rounded-sm border border-hairline bg-white px-3 py-2 text-ink"
              >
                <option value="" disabled>
                  Choose
                </option>
                {attr.terms.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-8">
          <AddToCart
            item={{
              productId,
              variationId: resolvedId ?? undefined,
              variantLabel: variantLabel || undefined,
              slug,
              name,
              priceMinorUnits: variation?.priceMinorUnits ?? "0",
              image: variation?.image?.src ?? images[0]?.src ?? "",
              imageAlt: variation?.image?.alt || images[0]?.alt || name,
            }}
            inStock={variation?.inStock ?? true}
            unready={unready}
          />
        </div>

        {footNote}
      </div>
    </div>
  );
}
