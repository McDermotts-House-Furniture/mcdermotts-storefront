"use client";

import Image from "next/image";
import { useEffect } from "react";

export interface ModalOption {
  slug: string;
  name: string;
  swatch?: string;
  /** Formatted price string — an absolute price ("€2,940.00") on the first
      tier, or an additional-cost delta ("+€150.00", "+€0.00") on every tier
      after it (Declan, 2026-09-05: "show the additional cost, not the new
      total cost"). Undefined while whatever it depends on is still
      loading (shown as a placeholder, never a wrong number). */
  price?: string;
  selected: boolean;
}

function ArrowGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="M19 12H5M11 18l-6-6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const overlayButtonCls =
  "absolute top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised hover:bg-surface-page";

/* One tier at a time, its options priced (Declan, 2026-09-05: "opens a
   popup where the sole purpose... is to show the variant choices, and the
   price associated with each" — replacing the inline swatch rows entirely
   for a multi-tier product; a single-tier one has nothing to step through,
   so it keeps the plain inline row instead). Picking an option is the only
   action here — the parent advances to the next tier (or closes, on the
   last one), so this component owns no selection state of its own, just
   which tier it's showing and what to draw for it.

   Same dialog pattern as SlidingGallery's lightbox (scroll-locked body,
   Escape to close, click-the-backdrop to close, stopPropagation on the
   sheet itself) — the one other overlay in this codebase, kept consistent
   rather than inventing a second convention. */
export function VariationPickerModal({
  attrName,
  stepIndex,
  stepCount,
  options,
  image,
  onPick,
  onBack,
  onClose,
}: {
  attrName: string;
  stepIndex: number;
  stepCount: number;
  options: ModalOption[];
  /** The current selection's representative photo — the same deterministic
      pick (lib/variations.ts) the main page's own gallery uses, so it's
      already live-updating as tiers are picked in here, no separate state.
      Undefined whenever that photo hasn't resolved yet for this branch —
      the image frame itself stays put either way (Declan, 2026-09-06: "the
      same physical position always"), it just sits empty rather than
      showing a placeholder or a broken box. */
  image?: { src: string; alt: string };
  onPick: (slug: string) => void;
  onBack?: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Choose ${attrName}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        /* h-[85vh], not max-h — a sheet sized to its own content means a
           2-option step (short list) makes the whole sheet shorter than a
           9-option one, and since it's anchored to the bottom of the
           screen on mobile (centred on desktop), a shorter sheet's TOP
           edge — where the image lives — lands in a different spot on
           screen for every step (Declan, 2026-09-06: "the image still
           moves around between the different steps... keep it stuck to
           one place"). A fixed height keeps the sheet — and the image
           pinned to its top — in exactly the same place regardless of step;
           a short list just leaves blank space below it instead of
           shrinking the sheet, exactly as asked. The list still scrolls
           internally on a step with too many options to fit, same as
           before. */
        className="flex h-[85vh] w-full flex-col rounded-t-lg bg-white sm:max-w-md sm:rounded-lg"
      >
        {/* Fixed size and position regardless of state (Declan, 2026-09-06:
             "the image should stay the same size... and in the same
             physical position always — at the top of the screen") — this
             box is always here, at h-[280px] (25% up from the 224px it
             opened at), whether or not a photo has resolved yet; only the
             photo inside it is conditional. h-[280px], not a percentage/vh
             height paired with the aspect-ratio class — the same skew this
             session already found and fixed on the mobile gallery (Declan,
             2026-09-03: "is that image box not square? ... it wasn't"):
             pairing aspect-ratio with a height constraint on a plain block
             only clamps the height and leaves the width at 100%, so the
             box stops being square. An explicit, fixed height with the
             ratio computing width FROM it is unambiguous — a true square,
             centred since it's narrower than the sheet around it.
             flex-none so it never gets squeezed by the options list
             claiming space below it. bg-stone, not bg-white, when there's
             no photo yet — an honest empty frame (the same treatment
             ProductGallery itself uses when a product has no photography
             at all), not a blank white box that reads as broken. Close and
             Back live on the image itself, not a separate header row — the
             one thing that's genuinely always in the same spot no matter
             what's loaded, which is the whole point of asking for it. */}
        <div
          className={`relative mx-auto aspect-[var(--ratio-product)] h-[280px] flex-none overflow-hidden rounded-t-lg ${image ? "bg-white" : "bg-stone"}`}
        >
          {image && (
            <Image key={image.src} src={image.src} alt={image.alt} fill sizes="280px" className="object-cover" priority />
          )}
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Back to the previous option" className={`${overlayButtonCls} left-3`}>
              <ArrowGlyph direction="left" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className={`${overlayButtonCls} right-3`}>
            <CloseGlyph />
          </button>
        </div>

        <div className="border-b border-hairline px-5 py-4 text-center">
          <p className="m-0 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft">
            Step {stepIndex + 1} of {stepCount}
          </p>
          <p className="m-0 text-[length:var(--fs-h4)] font-bold uppercase tracking-heading text-ink">{attrName}</p>
        </div>

        {/* min-h-0: a flex item's default min-height is auto (its content's
            natural size), not 0 — without this, overflow-y-auto can't
            actually kick in within a height-capped flex column (the same
            class of bug this session already ran into with min-w-0 on
            horizontal rows), so a long option list would just push the
            whole sheet past max-h-[85vh] instead of scrolling internally. */}
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-0">
          {options.map((opt) => (
            <li key={opt.slug} className="border-b border-hairline last:border-b-0">
              <button
                type="button"
                onClick={() => onPick(opt.slug)}
                aria-current={opt.selected}
                className={`flex min-h-[var(--tap-min)] w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-[var(--dur-base)] hover:bg-surface-page ${
                  opt.selected ? "bg-surface-page" : "bg-white"
                }`}
              >
                {opt.swatch && (
                  <Image
                    src={opt.swatch}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 flex-none rounded-sm object-cover"
                  />
                )}
                <span className="min-w-0 flex-1 text-[length:var(--fs-body)] font-bold text-ink">{opt.name}</span>
                <span className="flex-none text-[length:var(--fs-small)] text-ink-soft">{opt.price ?? "…"}</span>
                {opt.selected && (
                  <span aria-hidden className="flex-none text-[length:var(--fs-lead)] text-gold-deep">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
