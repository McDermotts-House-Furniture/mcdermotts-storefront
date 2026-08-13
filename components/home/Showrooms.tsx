/* Block 06 — showrooms. The only place opening hours appear on the page. */

import { ShowroomCard } from "@/components/cards/ShowroomCard";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function Showrooms() {
  return (
    <SectionBlock id="mcd-06-showrooms" tone="stone">
      <Reveal>
        <SectionHeading eyebrow="Showrooms" title="Visit us in Castlebar or Ennis" />
      </Reveal>
      <Reveal order={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[var(--grid-gap)]">
          {homepage.showrooms.map((s) => (
            <ShowroomCard
              key={s.name}
              eyebrow={s.eyebrow}
              name={s.name}
              address={s.address}
              hours={[...s.hours]}
              note={"note" in s ? s.note : undefined}
              phone={s.phone}
              directionsHref={s.directions}
            />
          ))}
        </div>
      </Reveal>
    </SectionBlock>
  );
}
