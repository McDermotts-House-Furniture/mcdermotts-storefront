"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface SlidingGalleryImage {
  src: string;
  alt: string;
}

/* Plain inline SVG, not an icon font/library — the DS uses none. Shared by
   the strip's controls and the lightbox's, so the glyph is drawn once. */
function ArrowGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="M19 12H5M11 18l-6-6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* Horizontal scroll-snap strip for range-page photo galleries (some ranges
   run 30-40 images — a grid gets very long, this never grows past one row),
   with a full-screen lightbox. Native scrollbar hidden, replaced with edge
   fades and round arrow buttons shown at every size (Declan wanted them on
   touch too, not only trackpad/mouse). Touch swipe/drag still works
   underneath; the arrows are a second way in, not the only one.

   Reset to a simpler version once already (Declan, 2026-08-26) — a first
   attempt at syncing the strip to the lightbox (auto-centring, history/
   back-button integration, focus return, swipe-to-navigate, neighbour
   preloading, all at once) made the two feel more broken together, not
   less, despite each piece working in isolation. Kept from that attempt:
   the intrinsic-sized (non-`fill`) lightbox image, which fixed a real,
   separate bug — a fixed-box `object-contain` frame around a square photo
   left a padded "dead zone" where clicking didn't close the lightbox even
   though nothing was visibly there. And the strip's own arrow buttons still
   fade (opacity transition, not conditional unmounting — they stay mounted
   so the fade has something to animate) when the lightbox opens, and fade
   back in when it closes.

   The strip now scrolls the currently-open image to the centre on every
   step, keyboard and click alike (Declan, 2026-08-26) — both already call
   the same step()/setOpenIndex, so one effect keyed on openIndex covers
   both for free. Clamped by the browser's own scroll bounds at either end,
   not special-cased. */
export function SlidingGallery({ images }: { images: SlidingGalleryImage[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= maxScroll - 4);
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  /* Clamped, not wrapped — "Next" past the last image doesn't silently jump
     back to the first with no arrow to say so. */
  const step = (direction: 1 | -1) => {
    setOpenIndex((i) => (i === null ? i : Math.min(Math.max(i + direction, 0), images.length - 1)));
  };

  /* Lock page scroll and wire keyboard nav only while the lightbox is open. */
  useEffect(() => {
    if (openIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    /* Compensate for the scrollbar disappearing (Declan, 2026-08-26): just
       setting overflow:hidden makes the page a few pixels wider the instant
       the scrollbar vanishes, shifting everything on screen — including the
       hero image, which is what triggered Next's dev-only "sizes vs actual
       rendered width" warning right at the moment the lightbox opened.
       Padding the body by the scrollbar's own width keeps the page's total
       width constant across the transition, so nothing visibly shifts and
       nothing gets measured mid-shift. */
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  /* Centre whichever image is open — fires for every openIndex change, so
     it's identical whether that change came from a keyboard press or a
     click on the lightbox's own arrows. Instant, not smooth: nobody is
     watching the strip through the dimmed overlay, and an animated scroll
     can't keep up with fast repeated key presses. */
  useEffect(() => {
    if (openIndex === null) return;
    const el = scrollerRef.current;
    const target = el?.children[openIndex];
    target?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
  }, [openIndex]);

  /* Fade + scale in on the initial open only (Declan, 2026-08-26) — not on
     every step, or arrowing through would flash on each image. wasOpenRef
     tracks the null→non-null transition specifically; a double rAF is the
     standard way to guarantee the browser has painted the "entered: false"
     state at least once before flipping to true, so the transition actually
     has something to animate from rather than the two states landing in the
     same frame with nothing visibly moving. */
  const [entered, setEntered] = useState(false);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    const isOpen = openIndex !== null;
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      setEntered(false);
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(raf1);
    }
    if (!isOpen) {
      wasOpenRef.current = false;
      setEntered(false);
    }
  }, [openIndex]);

  /* Deliberate keyboard control of the strip itself, not the accidental
     side effect it had before (Declan, 2026-08-26): a clicked thumbnail
     kept focus after the lightbox closed, and arrow keys were then scrolling
     it via the browser's own native "scroll the focused element's
     container" behaviour — inconsistent, and did nothing at all on a fresh
     page load before anything had been focused. tabIndex + onKeyDown here
     makes it work as soon as the gallery has focus (click anywhere in it,
     including a thumbnail, or Tab to it) rather than only after that one
     specific accidental path. Ignored while the lightbox is open — its own
     window-level listener owns the arrow keys then, for the lightbox's
     navigation, not the strip's. */
  const onStripKeyDown = (e: React.KeyboardEvent) => {
    if (openIndex !== null) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByPage(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByPage(1);
    }
  };

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        onScroll={updateEdges}
        onKeyDown={onStripKeyDown}
        tabIndex={0}
        aria-label="Photo gallery, scrollable with the left and right arrow keys"
        className="m-0 flex list-none snap-x snap-mandatory gap-[var(--grid-gap)] overflow-x-auto p-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <li
            key={img.src}
            className="relative aspect-square w-[220px] flex-none snap-center overflow-hidden rounded-md bg-linen sm:w-[280px] lg:w-[340px] xl:w-[400px]"
          >
            <button
              type="button"
              aria-label={`View larger: ${img.alt}`}
              onClick={() => setOpenIndex(i)}
              className="group absolute inset-0 block cursor-zoom-in"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1280px) 400px, (min-width: 1024px) 340px, (min-width: 640px) 280px, 220px"
                className="object-cover transition-transform duration-[var(--dur-slow)] ease-out group-hover:scale-[1.035]"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* from-surface-page, not from-stone (2026-08-27) — this fades to
          whatever the page background actually is; it went stale the
          moment --surface-page stopped being Stone (#f5f5f3 now), which is
          exactly why it's the token, not the literal colour, here. */}
      {!atStart && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-surface-page from-10% via-surface-page/80 via-40% to-transparent sm:w-28"
        />
      )}
      {!atEnd && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-surface-page from-10% via-surface-page/80 via-40% to-transparent sm:w-28"
        />
      )}

      {!atStart && (
        <button
          type="button"
          aria-label="Scroll gallery left"
          aria-hidden={openIndex !== null}
          tabIndex={openIndex !== null ? -1 : 0}
          onClick={() => scrollByPage(-1)}
          className={`absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised transition-[opacity,background-color] duration-[var(--dur-base)] hover:bg-stone ${
            openIndex !== null ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <ArrowGlyph direction="left" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label="Scroll gallery right"
          aria-hidden={openIndex !== null}
          tabIndex={openIndex !== null ? -1 : 0}
          onClick={() => scrollByPage(1)}
          className={`absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised transition-[opacity,background-color] duration-[var(--dur-base)] hover:bg-stone ${
            openIndex !== null ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <ArrowGlyph direction="right" />
        </button>
      )}

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[openIndex].alt}
          onClick={() => setOpenIndex(null)}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "var(--mcd-scrim)" }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-on-dark-border text-on-dark transition-colors duration-[var(--dur-base)] hover:bg-[var(--mcd-white-16)]"
          >
            <CloseGlyph />
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark-border text-on-dark transition-colors duration-[var(--dur-base)] hover:bg-[var(--mcd-white-16)]"
            >
              <ArrowGlyph direction="left" />
            </button>
          )}

          {/* Image, progress bars and counter stacked in normal flow, not
              each absolutely positioned off the viewport edge (Declan,
              2026-08-26) — that left the counter sitting wherever the
              viewport's bottom happened to be, often a real gap below the
              actual photo. This wrapper shrinks to the image's own
              rendered size, so what's below it sits right under the photo
              regardless of its aspect ratio. Intrinsic-sized image, not
              `fill` in a fixed box (kept from the reset attempt — a real,
              separate bugfix): a box whose proportions don't match the
              photo left a padded gap where clicking didn't close the
              lightbox even though nothing was visibly there. */}
          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* key={src} (Declan, 2026-08-26 bugfix): without it, the
                strip's own sync effect was visibly moving on every step
                (proof openIndex was updating correctly) while the lightbox
                photo itself stayed on the old image — next/image can fail
                to swap what's actually painted when only the `src` prop
                changes on the same component instance. Keying on the URL
                forces React to treat each step as a fresh element instead
                of trying to update one in place. */}
            <Image
              key={images[openIndex].src}
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              width={1600}
              height={1600}
              priority
              sizes="90vw"
              className={`h-auto max-h-[75vh] w-auto max-w-[90vw] object-contain transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none ${
                entered ? "scale-100" : "scale-95"
              }`}
            />

            {/* One bar per image, filled up to the currently open one — a
                position indicator, not a timer: nothing here auto-advances,
                so each bar fills the instant its image opens rather than
                over some duration. */}
            {images.length > 1 && (
              <div className="flex w-full max-w-[min(90vw,480px)] gap-1">
                {images.map((img, i) => (
                  <div key={img.src} className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--mcd-white-16)]">
                    <div
                      className={`h-full rounded-full bg-on-dark transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
                        i <= openIndex ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="text-[length:var(--fs-micro)] uppercase tracking-eyebrow text-on-dark-muted">
              {openIndex + 1} / {images.length}
            </p>
          </div>

          {openIndex < images.length - 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark-border text-on-dark transition-colors duration-[var(--dur-base)] hover:bg-[var(--mcd-white-16)]"
            >
              <ArrowGlyph direction="right" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
