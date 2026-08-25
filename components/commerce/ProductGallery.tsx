"use client";

import Image from "next/image";
import { useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
  thumb?: string;
}

/* Product gallery. Desktop (lg+): one 1:1 frame with a thumbnail strip beneath.
   Mobile: full-width scroll-snap carousel with a dot row and an "n / total"
   counter — no thumbnails, no arrows. Both variants render; CSS picks one. */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);

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
          <Image
            src={current.src}
            alt={current.alt || name}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 && (
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {images.slice(0, 6).map((img, i) => (
              <li key={img.src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1} of ${name}`}
                  aria-current={i === active}
                  className={`relative block h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-sm border bg-white transition-colors duration-[var(--dur-base)] ${
                    i === active ? "border-strong" : "border-hairline hover:border-strong"
                  }`}
                >
                  <Image src={img.thumb ?? img.src} alt="" fill sizes="72px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
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
              <div className="relative aspect-[var(--ratio-product)] overflow-hidden bg-white">
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
