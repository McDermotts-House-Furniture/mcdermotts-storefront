/* Block 07 — trust. One review quote plus three pillars. */

import { ReviewQuote } from "@/components/brand/ReviewQuote";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function Trust() {
  return (
    <SectionBlock id="mcd-07-trust" tone="linen">
      <Reveal>
        <ReviewQuote
          linkLabel="Read our Google reviews"
          linkHref="https://mcdermotts.ie/reviews"
          source="Verified Google review — Castlebar"
          quote="McDermott's is by far the very best place to go for furniture for any room in your house. In terms of selection, service and quality, McDermott's outshine their competitors."
        />
      </Reveal>
      <Reveal order={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[var(--grid-gap)]">
          {homepage.pillars.map((p) => (
            <TrustPillar key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
      </Reveal>
    </SectionBlock>
  );
}
