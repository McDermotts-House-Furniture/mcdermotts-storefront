"use client";

/* Block 03 — top picks. Two copy states: SALE ON and EVERGREEN.
   Four static curated cards, descriptors instead of prices (DS rule). */

import { ProductCard } from "@/components/cards/ProductCard";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";
import { useSale } from "./SaleToggle";

const picksCopy = {
  sale: {
    eyebrow: "Summer Sale",
    title: "Selling fast",
    standfirst: "Our bestsellers so far this sale.",
  },
  evergreen: {
    eyebrow: "Top picks",
    title: "What we'd take home",
    standfirst: "Four ranges our own team keeps recommending.",
  },
} as const;

export function TopPicks() {
  const sale = useSale();
  const c = sale ? picksCopy.sale : picksCopy.evergreen;
  return (
    <SectionBlock id="mcd-03-top-picks" tone="linen">
      <Reveal>
        <SectionHeading eyebrow={c.eyebrow} title={c.title} standfirst={c.standfirst} />
      </Reveal>
      <Reveal order={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[var(--grid-gap)]">
          {homepage.picks.map((p, i) => (
            <ProductCard
              key={p.title}
              brand={p.brand}
              title={p.title}
              descriptor={p.descriptor}
              href={p.href}
              image={p.image}
              alt={p.alt}
              onSale={sale && i !== 1}
            />
          ))}
        </div>
      </Reveal>
    </SectionBlock>
  );
}
