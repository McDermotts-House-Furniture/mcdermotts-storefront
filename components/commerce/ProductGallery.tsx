"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
  thumb?: string;
}

/* Product gallery. Desktop (lg+): one 1:1 frame with a thumbnail strip beneath.
   Mobile: full-width scroll-snap carousel with a dot row and an "n / total"
   counter — no thumbnails, no arrows. Both variants render; CSS picks one. */
function ArrowGlyph({ direction, size = 14 }: { direction: "left" | "right"; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="M19 12H5M11 18l-6-6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

/* Crossfades the stage photo instead of hard-swapping it (Declan,
   2026-09-01: picking a new variation swatch showed "a white background for
   a split second" mid-load). A plain src swap on a keyed <Image> tears the
   old one down immediately and leaves nothing on screen until the new file
   arrives over the network; here the last successfully loaded photo stays
   fully opaque the whole time, and the next one loads invisibly on top of
   it, only fading in once it's actually decoded — so there's never a blank
   frame to see, whichever direction the swap goes. */
function StageImage({ src, alt }: { src: string; alt: string }) {
  const [shown, setShown] = useState({ src, alt });
  const [incoming, setIncoming] = useState<{ src: string; alt: string } | null>(null);
  const [incomingLoaded, setIncomingLoaded] = useState(false);

  if (src !== shown.src && incoming?.src !== src) {
    // Adjusting state during render (not an effect) — the new layer starts
    // loading in the very same commit the src prop changes, not one paint
    // later, so a fast (cached) load never has a visible gap to land in.
    setIncoming({ src, alt });
    setIncomingLoaded(false);
  }

  useEffect(() => {
    if (!incomingLoaded || !incoming) return;
    // Matches the opacity transition's duration below — once the fade has
    // actually finished, the incoming layer becomes the resting image and
    // the old one underneath it can be dropped, keeping this to at most two
    // <Image> elements no matter how many times the selection changes.
    // --dur-fast (140ms), not --dur-base — Declan, 2026-09-01: the crossfade
    // itself read as too slow, wanted quicker.
    const timer = setTimeout(() => {
      setShown(incoming);
      setIncoming(null);
    }, 140);
    return () => clearTimeout(timer);
  }, [incoming, incomingLoaded]);

  return (
    <>
      <Image key={shown.src} src={shown.src} alt={shown.alt} fill priority sizes="50vw" className="object-cover" />
      {incoming && (
        <Image
          key={incoming.src}
          src={incoming.src}
          alt={incoming.alt}
          fill
          sizes="50vw"
          className="object-cover transition-opacity duration-[var(--dur-fast)] ease-out"
          style={{ opacity: incomingLoaded ? 1 : 0 }}
          onLoad={() => setIncomingLoaded(true)}
        />
      )}
    </>
  );
}

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const thumbStripRef = useRef<HTMLUListElement>(null);
  /* Whether there's more to scroll to on the right — this is what makes 5+
     thumbnails actually LOOK like a slider (Declan, 2026-08-27: "there is
     no slider appearing there at all" — all 10 thumbnails were genuinely
     rendered and scrollable, just with zero visual sign of it). No left
     equivalent (Declan, 2026-08-27: "the gradient on every left side image
     looks a bit silly") — the strip always auto-scrolls the active
     thumbnail back to the first position (see the effect below), so
     there's conceptually never anything meaningful "before" the current
     view the way there's always something "ahead"; a left fade/arrow just
     doesn't fit that model.
     atEnd's initial value is images.length <= 4, not a blind guess —
     unlike a strip with unknown/variable content (SlidingGallery,
     SubcategoryNav), the image count alone already says for certain
     whether this one will overflow, so the very first paint (server-
     rendered, before the effect below ever runs) gets it right instead of
     showing no affordance for a beat and then correcting itself. */
  const [atEnd, setAtEnd] = useState(images.length <= 4);

  const updateEdges = () => {
    const el = thumbStripRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    /* 4px tolerance, not 2 — the calc() basis on each thumbnail can land on
       a fractional pixel, and "the last thumbnail is fully visible but atEnd
       never quite triggers" is exactly the kind of near-miss that leaves
       the fade sitting over a thumbnail that's already fully in view. */
    setAtEnd(el.scrollLeft >= maxScroll - 4);
  };

  /* A plain desktop mouse (no touchpad, no touch screen) has no default way
     to move a horizontal-only overflow-x-auto strip — a vertical wheel
     doesn't translate to horizontal scroll on its own (same gap found and
     fixed on SubcategoryNav, 2026-08-27; fixed here from the start rather
     than waiting to hit it again). Native listener + { passive: false },
     not React's onWheel — wheel handlers React attaches are passive by
     default, so preventDefault() inside one is silently ignored. */
  useEffect(() => {
    const el = thumbStripRef.current;
    if (!el) return;
    updateEdges();
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", updateEdges);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const scrollThumbs = (direction: 1 | -1) => {
    const el = thumbStripRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  /* Clamped, not wrapped — matches SlidingGallery's own lightbox: "next"
     past the last image doesn't silently jump back to the first with no
     arrow to say so. */
  const step = (direction: 1 | -1) => {
    setActive((i) => Math.min(Math.max(i + direction, 0), images.length - 1));
  };

  /* Keeps the thumbnail strip scrolled so the image on display is always
     the first (leftmost) thumbnail (Declan, 2026-08-27: "the thumbnail row
     moves across so that the large image on display is always the first
     image in the thumbnail gallery") — runs on every change to `active`,
     whichever way it changed (the new arrows on the large image below, or
     clicking a thumbnail directly): one rule, not two separate behaviours
     for two ways of navigating. scrollTo clamps on its own near the end of
     the list — if there aren't enough remaining thumbnails to fill the row
     after the active one, it just shows as many as exist rather than
     forcing empty space, no special-casing needed. */
  useEffect(() => {
    const el = thumbStripRef.current;
    const activeItem = el?.children[active] as HTMLElement | undefined;
    if (!el || !activeItem) return;
    el.scrollTo({ left: activeItem.offsetLeft, behavior: "smooth" });
  }, [active]);

  /* Jumps back to the first thumbnail whenever the leading image itself
     changes — i.e. a new variation was picked (VariablePurchase prepends its
     photo to `images`) — the same way a fresh set of thumbnails used to
     force via a remount-on-key from the parent. Doing it here, during
     render rather than an effect, means the correction lands in the same
     commit as the new `images` prop: `current` below is never computed
     against a stale `active` index into the new array, so there's no frame
     where the wrong photo (or a stale "first thumbnail") is what's on
     screen (Declan, 2026-09-01). */
  const [leadSrc, setLeadSrc] = useState(images[0]?.src);
  if (images[0]?.src !== leadSrc) {
    setLeadSrc(images[0]?.src);
    if (active !== 0) setActive(0);
  }

  if (images.length === 0) {
    /* No photography supplied — an honest empty frame, not a promise. */
    return <div aria-hidden className="aspect-[var(--ratio-product)] rounded-md border border-hairline bg-stone" />;
  }

  const current = images[active] ?? images[0];

  return (
    <div>
      {/* Desktop: frame + thumbnails */}
      <div className="hidden flex-col gap-3 lg:flex">
        <div className="relative aspect-[var(--ratio-product)] overflow-hidden rounded-md bg-white">
          <StageImage src={current.src} alt={current.alt || name} />
          {/* Slide buttons live on the large image itself, not just the
              thumbnail strip (Declan, 2026-08-27: "the slider may need to
              become the large image, with the slide buttons on the large
              image"). Clamped at the ends, same as SlidingGallery's own
              lightbox — hidden rather than disabled, so there's nothing to
              click that visibly does nothing. */}
          {active > 0 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised hover:bg-surface-page"
            >
              <ArrowGlyph direction="left" size={18} />
            </button>
          )}
          {active < images.length - 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised hover:bg-surface-page"
            >
              <ArrowGlyph direction="right" size={18} />
            </button>
          )}
        </div>
        {images.length > 1 && (
          /* 4 across, sized to the frame above, not a fixed pixel size
             (Declan, 2026-08-27: "make 4 images equal the width of the
             large image, and when there are more than 4... a 4 column
             slider") — this row is already the same width as the frame
             above (both are full-width children of the same flex column),
             so 4 columns here IS 4 columns matching that width. flex +
             overflow-x-auto, not grid: with ≤4 images they exactly fill the
             row and nothing scrolls; a 5th+ overflows and slides instead of
             wrapping to a second row. All images shown, not capped — the
             slider is what a longer list is for. */
          <div className="relative">
            <ul
              ref={thumbStripRef}
              onScroll={updateEdges}
              className="m-0 flex list-none gap-3 overflow-x-auto p-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <li key={img.src} className="basis-[calc((100%-36px)/4)] flex-none">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1} of ${name}`}
                    aria-current={i === active}
                    className={`relative block aspect-square w-full cursor-pointer overflow-hidden rounded-sm border bg-white transition-colors duration-[var(--dur-base)] ${
                      i === active ? "border-strong" : "border-hairline hover:border-strong"
                    }`}
                  >
                    <Image src={img.thumb ?? img.src} alt="" fill sizes="25vw" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
            {!atEnd && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface-page to-transparent"
              />
            )}
            {!atEnd && (
              <button
                type="button"
                aria-label="Show more images"
                onClick={() => scrollThumbs(1)}
                className="absolute top-1/2 right-1 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-raised hover:bg-surface-page"
              >
                <ArrowGlyph direction="right" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile: scroll-snap carousel + dots + counter */}
      <div className="flex flex-col gap-3 lg:hidden">
        <ul
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="m-0 flex list-none snap-x snap-mandatory overflow-x-auto rounded-md p-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]"
        >
          {images.map((img, i) => (
            <li key={img.src} className="w-full flex-none snap-center">
              {/* h-[40vh], not the ~55vh the plain aspect-ratio alone works
                  out to on a typical phone (Declan, 2026-09-02: "the
                  variation swatches sit far enough down the page that the
                  gallery has scrolled out of view"). Height drives width
                  here (via aspect-ratio), not the other way round: with
                  max-h-[40vh] on a plain (non-replaced) block whose width
                  was auto-filling the viewport, the browser clamped only
                  the height and left the width at 100%, so the box stopped
                  being square and sat flush left of its own emptied space
                  (Declan, 2026-09-03: "images are still on the left...
                  is that image box not square?" — correct catch, it
                  wasn't). Explicit height + aspect-ratio computing width
                  from it is unambiguous — a true square, sized down from
                  the height, centred with mx-auto since it's now narrower
                  than the slide it sits in. */}
              <div className="relative mx-auto aspect-[var(--ratio-product)] h-[40vh] overflow-hidden bg-white">
                <Image
                  src={img.src}
                  alt={img.alt || name}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
        {images.length > 1 && (
          <>
            <div className="flex justify-center gap-2" aria-hidden>
              {images.map((img, i) => (
                <span
                  key={img.src}
                  className={`h-1.5 rounded-full transition-all duration-[var(--dur-base)] ${
                    i === slide ? "w-[18px] bg-ink" : "w-1.5 bg-hairline"
                  }`}
                />
              ))}
            </div>
            <p className="m-0 text-center text-[length:var(--fs-micro)] uppercase tracking-eyebrow text-ink-soft">
              {slide + 1} / {images.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
