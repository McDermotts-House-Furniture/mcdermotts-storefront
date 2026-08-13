"use client";

import Image from "next/image";
import { useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
  thumb?: string;
}

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-hairline bg-white text-ink-soft">
        Photography to follow
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white">
        <Image
          src={current.src}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex list-none flex-wrap gap-3 p-0">
          {images.slice(0, 6).map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${name}`}
                aria-current={i === active}
                className={`relative block h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-sm border transition-colors duration-[var(--dur-base)] ${
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
  );
}
