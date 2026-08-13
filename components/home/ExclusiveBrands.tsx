/* Block 04 — exclusive brands band. Dark block, one claim, one CTA. Evergreen. */

import { Button } from "@/components/core/Button";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { homepage } from "@/lib/homepage-data";

export function ExclusiveBrands() {
  return (
    <SectionBlock id="mcd-04-brands" tone="dark">
      <Reveal>
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="Exclusive to McDermott's"
          title={
            <>
              Ireland&rsquo;s only dedicated <span className="text-gold">Fama</span> &amp;{" "}
              <span className="text-gold">XOOON</span> showrooms
            </>
          }
          standfirst="Two full showrooms given over to two remarkable brands — in Castlebar and Ennis, and nowhere else in the country. They keep good company."
        />
      </Reveal>
      <Reveal order={2}>
        <ul className="mx-auto flex max-w-[var(--container-narrow)] list-none flex-wrap justify-center gap-x-6 gap-y-3 p-0">
          {homepage.brands.map((b) => (
            <li
              key={b}
              className="text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-on-dark-muted"
            >
              {b}
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="flex justify-center">
        <Button variant="onDark" href="#mcd-06-showrooms">
          Plan your visit
        </Button>
      </div>
    </SectionBlock>
  );
}
