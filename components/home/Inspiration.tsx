/* Block 05 — inspiration. One featured story plus two smaller cards. Never an archive. */

import { EditorialCard } from "@/components/cards/EditorialCard";
import { SectionHeading } from "@/components/core/SectionHeading";
import { TextLink } from "@/components/core/TextLink";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function Inspiration() {
  return (
    <SectionBlock id="mcd-05-inspiration" tone="linen">
      <Reveal>
        <SectionHeading eyebrow="The McDermott's edit" title="Inspiration" />
      </Reveal>
      <Reveal order={2}>
        <EditorialCard
          featured
          eyebrow="Colour Story · No. 01"
          title="Terra Tales"
          cta="Read it now"
          excerpt="Clay, ochre and burnt sienna, and how far to take them before a room starts shouting. Shot across both showrooms."
          href="https://mcdermotts.ie/blog/"
          image={homepage.img.dining}
          alt="Warm terracotta and oak styling in the Castlebar showroom"
        />
      </Reveal>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[var(--grid-gap)]">
        <EditorialCard
          eyebrow="Buying guide"
          title="How to Choose a Dining Table That Fits Your Life (and Your Room)"
          href="https://mcdermotts.ie/how-to-choose-a-dining-table/"
          image={homepage.img.living}
          alt="Pavon barnwood extending dining table"
        />
        <EditorialCard
          eyebrow="Previously"
          title="Corner Sofa vs 3+2: Which Is Right for Your Room?"
          href="https://mcdermotts.ie/corner-sofa-vs-3-plus-2/"
          image={homepage.img.sofas}
          alt="Corner sofa arrangement in the Ennis showroom"
        />
      </div>
      <div>
        <TextLink href="https://mcdermotts.ie/blog/">Read all our guides &amp; stories</TextLink>
      </div>
    </SectionBlock>
  );
}
