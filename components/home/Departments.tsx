/* Block 02 — departments. Exactly six tiles plus one text link. */

import { DepartmentTile } from "@/components/cards/DepartmentTile";
import { SectionHeading } from "@/components/core/SectionHeading";
import { TextLink } from "@/components/core/TextLink";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function Departments() {
  return (
    <SectionBlock id="mcd-02-departments" tone="linen">
      <Reveal>
        <SectionHeading eyebrow="Departments" title="Shop by department" />
      </Reveal>
      <Reveal order={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[var(--grid-gap)]">
          {homepage.departments.map((d) => (
            <DepartmentTile
              key={d.label}
              label={d.label}
              href={d.href}
              image={d.image}
              alt={d.alt}
              sizes="(min-width: 1280px) 17vw, (min-width: 640px) 33vw, 50vw"
            />
          ))}
        </div>
      </Reveal>
      <div>
        <TextLink href="https://mcdermotts.ie/shop/">Browse everything</TextLink>
      </div>
    </SectionBlock>
  );
}
