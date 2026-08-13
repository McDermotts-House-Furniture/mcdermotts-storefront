"use client";

/* Block 01 — hero. Two copy states: SALE ON and EVERGREEN. The page's only H1. */

import Image from "next/image";
import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { homepage } from "@/lib/homepage-data";
import { useSale } from "./SaleToggle";

const heroCopy = {
  sale: {
    eyebrow: "Now on",
    h1: "Up to 20% off across every department",
    lead: "Sofas, beds, dining and everything in between — reduced online and in both showrooms, delivered and assembled by our own crews.",
    primary: "Shop the Summer Sale",
  },
  evergreen: {
    eyebrow: "Furnishing the West since 1964",
    h1: "Furniture chosen to be lived with",
    lead: "Two showrooms, three generations, and the brands you won't find down the road — delivered and assembled by our own crews.",
    primary: "Shop the collection",
  },
} as const;

export function Hero() {
  const sale = useSale();
  const c = sale ? heroCopy.sale : heroCopy.evergreen;
  return (
    <section
      id="mcd-01-hero"
      className="relative grid min-h-[clamp(460px,62vh,660px)] items-center overflow-hidden bg-dark"
    >
      <Image
        src={homepage.img.hero}
        alt="Alma wing chair by Orla Kiely in the McDermott's showroom"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-[image:var(--scrim-hero)]" />
      <div className="relative mx-auto w-full max-w-[var(--container-max)] px-[var(--section-pad-x)] py-[var(--section-pad-y)]">
        <div className="flex max-w-[720px] flex-col gap-5">
          <EyebrowLabel tone="dark">{c.eyebrow}</EyebrowLabel>
          <h1 className="m-0 text-[length:var(--fs-hero)] leading-[var(--lh-tight)] font-bold tracking-hero uppercase text-white">
            {c.h1}
          </h1>
          <p className="m-0 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] text-on-dark-muted">
            {c.lead}
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <Button href="#mcd-02-departments">{c.primary}</Button>
            <Button variant="onDark" href="#mcd-06-showrooms">
              Visit a showroom
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
