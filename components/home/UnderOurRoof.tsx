/* Block 08 — everything else under our roof. Four typographic tiles, no photography. */

import { TypographicTile } from "@/components/cards/TypographicTile";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function UnderOurRoof() {
  return (
    <SectionBlock id="mcd-08-under-our-roof" tone="stone">
      <Reveal>
        <SectionHeading eyebrow="More from McDermott's" title="Everything else under our roof" />
      </Reveal>
      <Reveal order={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[var(--grid-gap)]">
          {homepage.tiles.map((t) => (
            <TypographicTile key={t.title} title={t.title} reason={t.reason} cta={t.cta} href={t.href} />
          ))}
        </div>
      </Reveal>
    </SectionBlock>
  );
}
