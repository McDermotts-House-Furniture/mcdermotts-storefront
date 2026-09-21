"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { BuyControls } from "@/components/commerce/BuyControls";
import { Price } from "@/components/commerce/Price";
import { ProductGallery, type GalleryImage } from "@/components/commerce/ProductGallery";
import { ProductStage } from "@/components/commerce/ProductStage";
import { VariationPickerModal, type ModalOption } from "@/components/product/VariationPickerModal";
import type { VariationPayload } from "@/app/api/variation/[id]/route";
import { formatPrice } from "@/lib/store-api";
import {
  isCompleteSelection,
  matchVariation,
  priorSelection,
  reachableCandidates,
  representativeVariationId,
  subtreeVariations,
  PREFETCH_CAP,
  SUBTREE_CAP,
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

  /* First not-yet-chosen attribute — drives the UI lock/nudge below, and
     marks where the "confirmed" selection stops. */
  const nextIndex = attributes.findIndex((a) => !selection[a.name]);
  const nextAttr = nextIndex === -1 ? undefined : attributes[nextIndex];

  /* The confirmed, contiguous run of the selection — attribute 0 through
     whichever one precedes the first gap, or everything once complete.
     Deliberately excludes anything the selection object still holds for
     attributes at or after that gap: attribute 0 is never locked (see the
     fieldsets below), so re-picking it after filling in 1 through 3 is
     always possible, and those later values would be stale leftovers, not
     real confirmed choices. One rule for every level, not a level-one
     special case — "the branch" is simply whatever's actually been
     confirmed, however deep that goes (Declan, 2026-09-02: "generalise the
     rule to every level rather than tacking on a second case"). */
  const effectiveSelection = priorSelection(attributes, nextIndex === -1 ? attributes.length : nextIndex, selection);
  const hasSelection = Object.keys(effectiveSelection).length > 0;

  /* Every variation compatible with the branch confirmed so far — narrows
     at every level, not just the first (Declan, 2026-09-02: "after every
     selection at any level, immediately display one representative image
     from the subtree that selection narrows to"). Capped so a wide branch
     doesn't cost a request per leaf combination; Declan's own example (one
     colour's 16 combinations under 6 colours × 8 cushions × 2 feet) clears
     this outright. */
  const subtree = hasSelection ? subtreeVariations(effectiveSelection, variations) : [];
  const withinCap = subtree.length <= SUBTREE_CAP;

  /* The one photo that has to be right the instant any level is picked —
     fetched on its own, at the browser's normal priority (not the
     background branch's low priority below), so it's never stuck behind a
     queue of images the shopper hasn't asked to see yet. Once the
     selection is complete this is just `resolvedId` — the same, already
     well-tested exact match used for price/stock — rather than a second
     way of arriving at the same answer. Otherwise deterministic
     (lib/variations.ts): returning to a branch already visited resolves to
     the exact same id, and since `payloads` never forgets an id it's
     already fetched, that's an instant repaint, not a refetch. */
  const representativeId = !hasSelection
    ? undefined
    : complete
      ? (resolvedId ?? undefined)
      : representativeVariationId(effectiveSelection, variations, initialSelection);

  useEffect(() => {
    if (representativeId === undefined || representativeId in payloads) return;
    const controller = new AbortController();
    fetch(`/api/variation/${representativeId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VariationPayload | null) => {
        if (!controller.signal.aborted)
          setPayloads((p) => (representativeId in p ? p : { ...p, [representativeId]: data }));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setPayloads((p) => (representativeId in p ? p : { ...p, [representativeId]: null }));
      });
    return () => controller.abort();
  }, [representativeId, payloads]);

  /* Everything else in the branch, in the background — every remaining leaf
     combination when the subtree clears the cap, or (before anything is
     picked at all) just the first level's own picture, which is all page
     load needs (Declan, 2026-09-02: "on page load, fetch only the images
     needed to render the first level of options. Nothing deeper."). Past
     the cap, falls back to the immediate next level's own picture instead
     of every leaf underneath it — "fetch its first level and load the rest
     on demand." */
  let backgroundIds: number[];
  if (!hasSelection) {
    backgroundIds = attributes[0]
      ? [...reachableCandidates(attributes[0], {}, variations).values()].slice(0, PREFETCH_CAP)
      : [];
  } else if (withinCap) {
    backgroundIds = subtree.map((v) => v.id).filter((id) => id !== representativeId);
  } else {
    backgroundIds = nextAttr
      ? [...reachableCandidates(nextAttr, effectiveSelection, variations).values()].slice(0, PREFETCH_CAP)
      : [];
  }

  /* Keyed only on the confirmed branch, not the raw selection — picking
     anything deeper inside the same branch needs no further fetching, it's
     already covered (Declan, 2026-09-02: "subsequent selections within
     that subtree need no further fetching"). Switching to a different
     option at any level — or backing all the way out — changes this key,
     so cleanup aborts whatever was still in flight for the old branch
     before the new one starts ("switching branch" and "abort in-flight
     prefetches" are the same event here). `priority: "low"` keeps this off
     the critical path; `payloads` caches by variation id, so a branch
     visited once is instant on every later visit. */
  const branchKey = Object.entries(effectiveSelection)
    .map(([attrName, value]) => `${attrName}=${value}`)
    .join("&");

  useEffect(() => {
    const missing = backgroundIds.filter((id) => !(id in payloads));
    if (missing.length === 0) return;
    const controller = new AbortController();
    for (const id of missing) {
      fetch(`/api/variation/${id}`, { signal: controller.signal, priority: "low" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: VariationPayload | null) => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: data }));
        })
        .catch(() => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: null }));
        });
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchKey, payloads]);

  /* The actual pixels for that background set, warmed the moment each JSON
     payload resolves — deduped by URL (several combinations can legitimately
     share one image, e.g. a shared dimension diagram) and rendered at
     thumbnail size, matching the swatch tiles exactly so the real ones hit
     a warm cache instead of re-requesting. */
  const prefetchImageUrls = [
    ...new Set(backgroundIds.map((id) => payloads[id]?.image?.thumb).filter((url): url is string => Boolean(url))),
  ];

  const variation = resolvedId !== null ? (payloads[resolvedId] ?? null) : null;
  const loading = resolvedId !== null && !(resolvedId in payloads);
  const failed = resolvedId !== null && resolvedId in payloads && payloads[resolvedId] === null;

  /* Which variation currently backs the main photo — tracked by id, not
     just its src, so a new (narrower) selection can check whether that
     exact variation is still a member of the new subtree before touching
     anything (Declan, 2026-09-02: "if the currently displayed image is
     still valid under the new selection, keep it rather than swapping to
     another... switching for no visible reason reads as a glitch").
     Adjusted during render, not an effect, so a genuine swap lands in the
     same commit the old image stops being valid — no frame in between
     where stale state is what's on screen. Only clears once nothing at all
     is confirmed (Clear selection, or never picked) — a real change of
     picture, not a loading blip or a cosmetic deeper pick. */
  const [lastVariationId, setLastVariationId] = useState<number | undefined>(undefined);
  const subtreeIds = new Set(subtree.map((v) => v.id));
  const stillValid = hasSelection && lastVariationId !== undefined && subtreeIds.has(lastVariationId);
  if (!hasSelection) {
    if (lastVariationId !== undefined) setLastVariationId(undefined);
  } else if (!stillValid && representativeId !== undefined && representativeId !== lastVariationId) {
    if (payloads[representativeId]?.image) setLastVariationId(representativeId);
  }

  const lastPayload = lastVariationId !== undefined ? payloads[lastVariationId] : undefined;
  const lastVariationImage: GalleryImage | null = lastPayload?.image
    ? { src: lastPayload.image.src, alt: lastPayload.image.alt || name, thumb: lastPayload.image.thumb }
    : null;

  /* Curated plugin swatches win outright when they cover every term — they're
     purpose-made texture crops. Otherwise an attribute earns variation-image
     swatches only when every term resolved an image and the images actually
     differ — a shared photo means the attribute isn't visual (foot options on
     a sofa) and gets text chips instead. */
  function swatchImages(attr: PurchaseAttribute, index: number): Map<string, string> | null {
    const plugin = attr.taxonomy ? pluginSwatches?.[attr.taxonomy] : undefined;
    if (plugin && attr.terms.every((t) => plugin[t.slug])) {
      return new Map(attr.terms.map((t) => [t.slug, plugin[t.slug]]));
    }
    const termMap = reachableCandidates(attr, priorSelection(attributes, index, selection), variations);
    if (termMap.size < attr.terms.length) return null;
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

  /* "+€xxx" (or "+€0") for `term` in this attribute at this tier, relative
     to that SAME tier's own first term — the natural "included" choice —
     both resolved via the exact same deterministic representativeVariationId
     pick used everywhere else on this page. Undefined until both ends of
     that subtraction have actually loaded (never guesses, never shows a
     wrong number); a genuinely cheaper later option floors at €0 rather
     than going negative — "additional cost" has nothing negative to show.
     Shared by the modal's tiers after the first (below) and the desktop
     inline swatch rows further down, which show it on EVERY tier including
     the first (Declan, 2026-09-07: "incorporate the (+€xxx) for any option
     that has an additional payment from the base option"). */
  function deltaPriceLabel(attr: PurchaseAttribute, index: number, term: { slug: string }): string | undefined {
    const prior = priorSelection(attributes, index, selection);
    const baseTerm = attr.terms[0];
    if (!baseTerm) return undefined;
    const baseId = representativeVariationId({ ...prior, [attr.name]: baseTerm.slug }, variations, initialSelection);
    const id = representativeVariationId({ ...prior, [attr.name]: term.slug }, variations, initialSelection);
    const basePayload = baseId !== undefined ? payloads[baseId] : undefined;
    const payload = id !== undefined ? payloads[id] : undefined;
    if (!basePayload || !payload) return undefined;
    const zero = BigInt(0);
    const deltaMinor = BigInt(payload.priceMinorUnits || "0") - BigInt(basePayload.priceMinorUnits || "0");
    return `+${formatPrice((deltaMinor > zero ? deltaMinor : zero).toString(), payload.currency)}`;
  }

  const variantLabel = attributes
    .map((a) => a.terms.find((t) => t.slug === selection[a.name])?.name)
    .filter(Boolean)
    .join(" · ");

  /* Same "first not-yet-chosen attribute" as `nextAttr` above, reused for the
     UI nudge — gated on more than one attribute existing at all, unlike
     `nextAttr` itself: a single-attribute product still has a level worth
     prefetching, but nothing to visually sequence or push toward. */
  const nextAttrName = attributes.length > 1 ? nextAttr?.name : undefined;

  /* More than one tier gets a step-by-step popup instead of the inline rows
     (Declan, 2026-09-05: "when someone clicks a variation option, it opens
     a popup where the sole purpose... is to show the variant choices, and
     the price associated with each, but only when there is more than 1
     tier"). A single attribute has nothing to step through — picking it IS
     resolving the product — so it keeps the plain inline row below. */
  const useVariationModal = attributes.length > 1;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const modalAttr = useVariationModal && modalOpen ? attributes[modalStep] : undefined;

  /* Fetches prices for whichever tier the popup is actually showing right
     now — not necessarily `nextAttr`: stepping back inside the popup to
     revisit an earlier, already-answered tier is a real path (Declan asked
     for "every remaining tier, one after another", which implies moving
     both ways), and the background subtree prefetch above only ever
     targets the next UNANSWERED tier. Normal priority, not "low" — this is
     exactly what the shopper is looking at on screen right now, not a
     speculative branch they haven't opened. */
  useEffect(() => {
    if (!modalAttr) return;
    const prior = priorSelection(attributes, modalStep, selection);
    const candidates = reachableCandidates(modalAttr, prior, variations);
    const ids = modalAttr.terms
      .map((t) => candidates.get(t.slug))
      .filter((id): id is number => id !== undefined && !(id in payloads));
    if (ids.length === 0) return;
    const controller = new AbortController();
    for (const id of ids) {
      fetch(`/api/variation/${id}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: VariationPayload | null) => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: data }));
        })
        .catch(() => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: null }));
        });
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalAttr, modalStep, selection, payloads]);

  /* Every tier's own price data, eagerly — not just the next unanswered one
     or whichever step the mobile popup happens to be on above. The desktop
     inline rows restored below show every tier's swatches (and their own
     (+€xxx) deltas) at once, so every tier's prices need to be ready at
     once too (Declan, 2026-09-07: "change the desktop version... back to
     the original way... incorporate the (+€xxx) for any option"). Only
     runs at all for multi-tier products — a single tier has nothing beyond
     what the effects above already cover. */
  useEffect(() => {
    if (!useVariationModal) return;
    const ids = new Set<number>();
    attributes.forEach((attr, index) => {
      const prior = priorSelection(attributes, index, selection);
      for (const id of reachableCandidates(attr, prior, variations).values()) ids.add(id);
    });
    const missing = [...ids].filter((id) => !(id in payloads));
    if (missing.length === 0) return;
    const controller = new AbortController();
    for (const id of missing) {
      fetch(`/api/variation/${id}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: VariationPayload | null) => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: data }));
        })
        .catch(() => {
          if (!controller.signal.aborted) setPayloads((p) => (id in p ? p : { ...p, [id]: null }));
        });
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useVariationModal, selection, payloads]);

  /* One priced option per term of whichever tier the popup is on — the
     representative variation for "everything confirmed so far, plus this
     one term" is the exact same deterministic pick the main photo itself
     uses (lib/variations.ts), just evaluated once per option instead of
     once for the current selection.

     Only the FIRST tier shows an absolute price (Declan, 2026-09-05:
     "dont show prices on the second or third options... show the
     additional cost, not the new total cost"). Every later tier instead
     shows what THIS option adds on top of that tier's own first option —
     the natural "included" choice — as "+€xx", so the first option always
     reads "+€0" and a genuinely pricier one reads its real upcharge. Both
     ends of that subtraction have to be loaded before a delta is shown at
     all (the modal's own "…" placeholder covers the gap), and a negative
     result (a later option that's actually cheaper) is floored at €0 —
     "additional cost" has nothing negative to show. */
  const modalOptions: ModalOption[] = modalAttr
    ? (() => {
        const prior = priorSelection(attributes, modalStep, selection);
        const swatches = swatchImages(modalAttr, modalStep);
        return modalAttr.terms.map((term) => {
          const id = representativeVariationId({ ...prior, [modalAttr.name]: term.slug }, variations, initialSelection);
          const payload = id !== undefined ? payloads[id] : undefined;
          const price = modalStep === 0 ? payload?.price : deltaPriceLabel(modalAttr, modalStep, term);
          return {
            slug: term.slug,
            name: term.name,
            swatch: swatches?.get(term.slug),
            price,
            selected: selection[modalAttr.name] === term.slug,
          };
        });
      })()
    : [];

  const openVariationModal = () => {
    setModalStep(nextIndex === -1 ? 0 : nextIndex);
    setModalOpen(true);
  };

  /* Picking an option advances to the next tier automatically ("every
     remaining tier, one after another") — a short delay so the tap's own
     selected state is visible for a beat before the screen changes,
     rather than an instant, jarring swap. The last tier closes the popup
     instead of advancing: the combination is complete, there's nothing
     further to show. */
  const pickModalOption = (slug: string) => {
    if (!modalAttr) return;
    setSelection((s) => ({ ...s, [modalAttr.name]: slug }));
    setTimeout(() => {
      if (modalStep < attributes.length - 1) setModalStep((s) => s + 1);
      else setModalOpen(false);
    }, 180);
  };

  const unready = !complete
    ? nextAttrName
      ? `Choose a ${nextAttrName}`
      : "Choose your options"
    : resolvedId === null
      ? "Combination unavailable"
      : failed
        ? "Unavailable right now"
        : loading || !variation
          ? "Checking availability"
          : undefined;

  const galleryImages = lastVariationImage ? [lastVariationImage, ...images] : images;

  /* touch-action: manipulation on the swatches themselves — removes the
     ~300ms tap-vs-double-tap-zoom wait and, combined with the row's own
     pan-x above, gives the browser nothing ambiguous left to resolve
     before committing to a tap. */
  const chipBase =
    "flex min-h-[var(--tap-min)] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-sm border transition-colors duration-[var(--dur-base)]";

  /* One attribute's swatch/chip row — the inline layout every multi-tier
     product used before the step-by-step popup replaced it, restored here
     for desktop only (Declan, 2026-09-07: "change the desktop version...
     to the original way that it was, but keep the mobile as the new
     version"); a single-tier product keeps using this on every breakpoint,
     since it never went through the popup in the first place. `locked`
     greys the whole row out and disables it until every earlier tier has
     an answer — the same progressive-disclosure rule this had before the
     popup replaced it (first tier always open, each next one gated on the
     last). `showPrice` prints each option's own (+€xxx) — or "+€0" for
     that tier's own first option — underneath its swatch/chip, via the
     same deltaPriceLabel the popup's later steps use. */
  function renderAttributeFieldset(
    attr: PurchaseAttribute,
    index: number,
    opts: { locked?: boolean; showPrice?: boolean } = {},
  ) {
    const { locked = false, showPrice = false } = opts;
    const swatches = swatchImages(attr, index);
    const selectedTerm = attr.terms.find((t) => t.slug === selection[attr.name]);
    return (
      <fieldset
        key={attr.name}
        disabled={locked}
        className={`m-0 min-w-0 border-0 p-0 transition-opacity duration-[var(--dur-base)] ${locked ? "pointer-events-none opacity-40" : ""}`}
      >
        <legend className="mb-2 p-0 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft">
          {attr.name}
          {selectedTerm && <span className="text-ink"> · {selectedTerm.name}</span>}
        </legend>
        {/* A wrapped row costs a full row of vertical height for every
            extra line (Declan, 2026-09-02: "a wrapped row of eight swatches
            costs a full row of vertical height") — on mobile (single-tier
            products only, here) the row scrolls horizontally instead, with
            the next swatch left visibly cut off at the edge as its own
            "there's more" affordance. Reverts to the normal wrapping row at
            lg — more width there, nothing to solve. touch-action: pan-x
            tells the browser up front that only horizontal swipes belong to
            this row (Declan, 2026-09-05: iOS Safari's gesture recognizer
            can otherwise swallow the first tap on a freshly-scrollable
            row). */}
        <div
          className="flex flex-nowrap gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [touch-action:pan-x] lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
          role="radiogroup"
          aria-label={attr.name}
        >
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
              <div key={term.slug} className="flex shrink-0 flex-col items-center gap-1">
                <button
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
                {showPrice && (
                  <span className="text-[length:var(--fs-micro)] text-ink-soft">
                    {deltaPriceLabel(attr, index, term) ?? "…"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <>
      {prefetchImageUrls.length > 0 && (
        /* Warms the browser's cache for the rest of the branch before the
           shopper taps any further into it — invisible (display:none
           doesn't stop the fetch, only lazy-loading based on viewport
           proximity would) and `loading="eager"` so it starts immediately
           rather than waiting to scroll near, `fetchPriority="low"` so it
           never competes with the representative photo (or the resolved
           one) actually on screen. Same width/height as the real swatch
           tile below, so next/image resolves to the exact same request —
           the real one lands on a warm cache instead of re-fetching. */
        <div aria-hidden className="hidden">
          {prefetchImageUrls.map((url) => (
            <Image key={url} src={url} alt="" width={56} height={56} loading="eager" fetchPriority="low" />
          ))}
        </div>
      )}
      <ProductStage
        media={<ProductGallery images={galleryImages} name={name} />}
      >
        {/* Block order (Declan, 2026-09-02): "gallery, brand line, product
            name, price and sale badge, stock status, variation options, add
            to cart, then the description and specs" on mobile — desktop
            keeps its existing order (description/specs before the swatch
            picker). Same children, same DOM, just re-stacked per breakpoint
            via CSS `order` on this flex column — nothing duplicated, so
            state (the swatch picker, the form) only exists once. */}
        <div key="info-header-wrap" className="order-1 min-w-0">
          {infoHeader}
        </div>

      <Price
        key="price"
        className="order-2 mt-5 min-w-0"
        current={variation ? variation.price : basePrice.current}
        old={variation?.oldPrice ?? undefined}
        from={!variation && basePrice.isRange}
        onSale={onSale}
      />

      {/* Skipped outright when the resolved variation isn't a managed,
          really-tracked stock reading (Declan, 2026-09-06) — the delivery
          notice stack below already says the same "non-stock order" thing
          for the whole product, tag-driven or not, so repeating it here
          would just be the same sentence twice on one page. */}
      {(!variation || variation.managed) && (
        <p key="availability" className="order-3 mt-2 min-w-0 text-[length:var(--fs-small)] text-ink-soft" aria-live="polite">
          {variation
            ? variation.stockText
            : complete && resolvedId === null
              ? "That combination isn't available — try different options."
              : nextAttrName
                ? `Choose a ${nextAttrName} to continue.`
                : "Choose your options to check availability."}
        </p>
      )}

      <div key="short-description-wrap" className="order-8 min-w-0 lg:order-4">
        {shortDescription}
      </div>
      <div key="dimensions-wrap" className="order-9 min-w-0 lg:order-5">
        {dimensions}
      </div>

      {/* Attributes, delivery notices and buy controls share one wrapper so
          they move together under the mobile block-order above. (Declan,
          2026-09-06: the sticky collapsing gallery summary that used to
          live here — pinned to the top of the screen as this section
          scrolled by — was glitching and rubberbanding on scroll and has
          been removed outright; the OTHER mobile summary bar, the fixed
          one pinned to the BOTTOM of the screen showing price and Add to
          Cart, is StickyBuyBar via BuyControls below and is untouched.) */}
      <div key="mobile-purchase-group" className="order-5 min-w-0 lg:order-6">
      {/* min-w-0: a grid item's default min-width is auto (its content's
          natural size), not 0 — without this, the horizontal-scroll row a
          few levels down (many fixed-width, shrink-0 swatches) forces this
          whole track, and the page along with it, wider than the viewport
          instead of actually clipping/scrolling (Declan, 2026-09-02: "they
          go too far to the right of the page, extending the page into
          blank space" — the same overflow was also what made everything
          else read as pushed to the left edge and swallowed the taps on
          the first row's own swatches). */}
      <div key="attributes" className="mt-8 grid min-w-0 gap-5">
        {Object.keys(selection).length > 0 && (
          /* Only shown once something's actually picked — nothing to clear
             on a fresh page load, and initialSelection (Woo's own default
             attributes) counts as a real choice here too: the customer sees
             it pre-filled, so they should be able to clear it same as
             anything they picked themselves. */
          <button
            type="button"
            onClick={() => setSelection({})}
            className="-mb-1 justify-self-end text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft underline decoration-hairline underline-offset-4 transition-colors duration-[var(--dur-base)] hover:text-ink hover:decoration-ink"
          >
            Clear selection
          </button>
        )}
        {useVariationModal ? (
          <>
            {/* Desktop: the original inline swatch rows, restored (Declan,
                2026-09-07: "change the desktop version of the variable
                product option choosing function to the original way that
                it was, but keep the mobile as the new version") — one
                fieldset per tier, all shown at once, each option priced
                with its own (+€xxx) underneath, later tiers greyed out and
                disabled until every earlier one has an answer. */}
            <div className="hidden min-w-0 gap-5 lg:grid">
              {attributes.map((attr, index) =>
                renderAttributeFieldset(attr, index, {
                  locked: nextIndex !== -1 && index > nextIndex,
                  showPrice: true,
                }),
              )}
            </div>
            {/* Mobile: the step-by-step popup (Declan, 2026-09-05), kept
                exactly as it was — reads as one more row in the purchase
                area, same visual weight as a RangeLink/DeliveryNotice card,
                not a form control; its whole job is "open the thing that
                actually picks this." */}
            <button
              type="button"
              onClick={openVariationModal}
              /* min-w-0: this button is a grid item in the attributes grid
                 above, whose own default min-width is auto (its content's
                 natural size), not 0 — without it, an unbreakable line of
                 text can grow the grid column (and the page) to fit itself
                 regardless of what the text itself is allowed to do (Declan,
                 2026-09-05: "the page is extending... the text stays... on
                 one line"). items-start, not items-center: once the label
                 wraps to more than one line the arrow should sit level with
                 the first line, not drift down to the vertical middle of a
                 now-taller box. lg:hidden — desktop uses the fieldsets
                 above instead. */
              className="flex min-h-[var(--tap-min)] w-full min-w-0 items-start justify-between gap-4 rounded-md border border-hairline bg-white px-4 py-3.5 text-left transition-colors duration-[var(--dur-base)] hover:border-strong lg:hidden"
            >
              <span className="min-w-0">
                <span className="block text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft">
                  {complete ? "Your selection" : "Choose your options"}
                </span>
                {/* No truncate — the whole selection should be readable, not
                    clipped with an ellipsis (Declan, 2026-09-06: "make me able
                    to see the full text of selections... make the box bigger
                    in height to fit the text if necessary"). min-w-0 above
                    already stops this from widening the page; without
                    truncate's own white-space:nowrap, a long label just wraps
                    onto more lines instead, and the button (min-h, not a
                    fixed h) grows to fit them. */}
                <span className="mt-0.5 block text-[length:var(--fs-body)] text-ink">
                  {variantLabel || (nextAttrName ? `Start with a ${nextAttrName}` : "Tap to select")}
                </span>
              </span>
              <span aria-hidden className="flex-none text-[length:var(--fs-lead)] text-gold-deep">
                →
              </span>
            </button>
          </>
        ) : (
          attributes.map((attr, index) => renderAttributeFieldset(attr, index))
        )}
      </div>

      {modalOpen && modalAttr && (
        <VariationPickerModal
          attrName={modalAttr.name}
          stepIndex={modalStep}
          stepCount={attributes.length}
          options={modalOptions}
          /* Before anything's picked (or its representative photo hasn't
             resolved yet), the popup falls back to the product's own first
             gallery photo — its "lifestyle-1" shot, always a styled room
             photo for this catalogue, never a plain cutout (Declan,
             2026-09-06: "the first image shown when choose your options is
             selected should always be lifestyle-1") — rather than the
             empty frame from before. Once a real branch is picked,
             `lastVariationImage` takes over as usual. */
          image={lastVariationImage ?? (images[0] ? { src: images[0].src, alt: images[0].alt || name } : undefined)}
          onPick={pickModalOption}
          onBack={modalStep > 0 ? () => setModalStep((s) => s - 1) : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}

        <div key="delivery-notices-wrap">
          {deliveryNotices}
        </div>

        <div key="buy-controls" className="mt-8">
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
      </div>

      <div key="foot-note-wrap" className="order-10 min-w-0">
        {footNote}
      </div>
      <div key="detail-extras-wrap" className="order-11 min-w-0">
        {detailExtras}
      </div>
      </ProductStage>
    </>
  );
}
