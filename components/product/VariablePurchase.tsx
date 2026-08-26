"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BuyControls } from "@/components/commerce/BuyControls";
import { Price } from "@/components/commerce/Price";
import { ProductGallery, type GalleryImage } from "@/components/commerce/ProductGallery";
import { ProductStage } from "@/components/commerce/ProductStage";
import type { VariationPayload } from "@/app/api/variation/[id]/route";
import {
  isCompleteSelection,
  matchVariation,
  type Selection,
  type VariationRef,
} from "@/lib/variations";

export interface PurchaseAttribute {
  name: string;
  taxonomy?: string | null;
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
  /** Red price + Sale badge — computed server-side from isPermanentlyLow,
      constant across every variation (the tag is per-product, not
      per-variation). */
  onSale: boolean;
  /** Woo's default_attributes — preselects the form like the live site. */
  initialSelection?: Selection;
  /** Curated per-term swatch images (rtwpvs plugin, parsed server-side). */
  swatchImages?: Record<string, Record<string, string>>;
  /** Server-rendered nodes (brand eyebrow, H1, rating / short description / crews line / range + accordions). */
  infoHeader: ReactNode;
  shortDescription?: ReactNode;
  /** DimensionSet + spec-sheet link, rendered after the description (kit order). */
  dimensions?: ReactNode;
  /** Tag-driven DeliveryNotice stack (lib/merchandising), rendered above the buy controls. */
  deliveryNotices?: ReactNode;
  footNote?: ReactNode;
  detailExtras?: ReactNode;
}

/* First variation that pins this attribute to this term — its image stands in
   as the term's swatch. */
function candidateVariationId(
  variations: VariationRef[],
  attribute: string,
  termSlug: string,
): number | null {
  return (
    variations.find((v) =>
      v.attributes.some((a) => a.name === attribute && a.value === termSlug),
    )?.id ?? null
  );
}

export function VariablePurchase({
  productId,
  slug,
  name,
  images,
  attributes,
  variations,
  basePrice,
  onSale,
  initialSelection,
  swatchImages: pluginSwatches,
  infoHeader,
  shortDescription,
  dimensions,
  deliveryNotices,
  footNote,
  detailExtras,
}: VariablePurchaseProps) {
  const [selection, setSelection] = useState<Selection>(() => initialSelection ?? {});
  /* One cache for every variation payload — swatch candidates and the resolved
     selection share it. Missing key = not loaded; null = fetch failed. */
  const [payloads, setPayloads] = useState<Record<number, VariationPayload | null>>({});

  const complete = isCompleteSelection(selection, attributes.map((a) => ({ ...a, has_variations: true })));
  const resolvedId = complete ? matchVariation(selection, variations) : null;

  /* Term → candidate variation id per attribute (from the parent's map — free). */
  const swatchCandidates = useMemo(() => {
    const perAttribute = new Map<string, Map<string, number>>();
    for (const attr of attributes) {
      const termMap = new Map<string, number>();
      for (const term of attr.terms) {
        const id = candidateVariationId(variations, attr.name, term.slug);
        if (id !== null) termMap.set(term.slug, id);
      }
      perAttribute.set(attr.name, termMap);
    }
    return perAttribute;
  }, [attributes, variations]);

  /* Fetch whatever ids we need but don't have: swatch candidates once on mount,
     plus the currently resolved selection. O(terms + 1), never O(variations);
     every response is served from the route handler's 1h cache. */
  useEffect(() => {
    const wanted = new Set<number>();
    for (const termMap of swatchCandidates.values()) {
      for (const id of termMap.values()) wanted.add(id);
    }
    if (resolvedId !== null) wanted.add(resolvedId);
    const missing = [...wanted].filter((id) => !(id in payloads));
    if (missing.length === 0) return;

    const controller = new AbortController();
    for (const id of missing) {
      fetch(`/api/variation/${id}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: VariationPayload | null) => {
          if (!controller.signal.aborted) setPayloads((p) => ({ ...p, [id]: data }));
        })
        .catch(() => {
          if (!controller.signal.aborted) setPayloads((p) => ({ ...p, [id]: null }));
        });
    }
    return () => controller.abort();
  }, [swatchCandidates, resolvedId, payloads]);

  const variation = resolvedId !== null ? (payloads[resolvedId] ?? null) : null;
  const loading = resolvedId !== null && !(resolvedId in payloads);
  const failed = resolvedId !== null && resolvedId in payloads && payloads[resolvedId] === null;

  /* Curated plugin swatches win outright when they cover every term — they're
     purpose-made texture crops. Otherwise an attribute earns variation-image
     swatches only when every term resolved an image and the images actually
     differ — a shared photo means the attribute isn't visual (foot options on
     a sofa) and gets text chips instead. */
  function swatchImages(attr: PurchaseAttribute): Map<string, string> | null {
    const plugin = attr.taxonomy ? pluginSwatches?.[attr.taxonomy] : undefined;
    if (plugin && attr.terms.every((t) => plugin[t.slug])) {
      return new Map(attr.terms.map((t) => [t.slug, plugin[t.slug]]));
    }
    const termMap = swatchCandidates.get(attr.name);
    if (!termMap || termMap.size < attr.terms.length) return null;
    const images = new Map<string, string>();
    for (const term of attr.terms) {
      const id = termMap.get(term.slug);
      if (id === undefined || !(id in payloads)) return null; // still loading
      const thumb = payloads[id]?.image?.thumb || payloads[id]?.image?.src;
      if (!thumb) return null;
      images.set(term.slug, thumb);
    }
    return new Set(images.values()).size > 1 ? images : null;
  }

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

  const chipBase =
    "flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-sm border transition-colors duration-[var(--dur-base)]";

  return (
    <ProductStage
      media={
        <ProductGallery key={variation?.image?.src ?? "base"} images={galleryImages} name={name} />
      }
    >
      {infoHeader}

      <Price
        className="mt-5"
        current={variation ? variation.price : basePrice.current}
        old={variation?.oldPrice ?? undefined}
        from={!variation && basePrice.isRange}
        onSale={onSale}
      />

      <p className="mt-2 text-[length:var(--fs-small)] text-ink-soft" aria-live="polite">
        {variation
          ? variation.stockText
          : complete && resolvedId === null
            ? "That combination isn't available — try different options."
            : "Choose your options to check availability."}
      </p>

      {shortDescription}
      {dimensions}

      <div className="mt-8 grid gap-5">
        {attributes.map((attr) => {
          const swatches = swatchImages(attr);
          const selectedTerm = attr.terms.find((t) => t.slug === selection[attr.name]);
          return (
            <fieldset key={attr.name} className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft">
                {attr.name}
                {selectedTerm && <span className="text-ink"> · {selectedTerm.name}</span>}
              </legend>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={attr.name}>
                {attr.terms.map((term) => {
                  const selected = selection[attr.name] === term.slug;
                  const swatch = swatches?.get(term.slug);
                  /* Selected state must read at a glance: image tiles take a
                     2px ink ring offset from the tile (focus keeps its gold
                     ring); text chips fill with ink, per the DS's secondary
                     hover treatment. */
                  const stateClasses = swatch
                    ? selected
                      ? "border-strong bg-white outline-2 outline-offset-2 outline-ink"
                      : "border-hairline bg-white hover:border-strong"
                    : selected
                      ? "border-strong bg-ink text-linen"
                      : "border-hairline bg-white hover:border-strong";
                  return (
                    <button
                      key={term.slug}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={term.name}
                      onClick={() => setSelection((s) => ({ ...s, [attr.name]: term.slug }))}
                      className={`${chipBase} ${stateClasses} ${swatch ? "h-14 w-14 overflow-hidden p-0" : "px-4"}`}
                    >
                      {swatch ? (
                        <Image
                          src={swatch}
                          alt={term.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-button">
                          {term.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {deliveryNotices}

      <div className="mt-8">
        <BuyControls
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
          name={name}
          price={variation ? variation.price : basePrice.current}
          oldPrice={variation?.oldPrice ?? undefined}
        />
      </div>

      {footNote}
      {detailExtras}
    </ProductStage>
  );
}
