import { SpecList } from "@/components/commerce/SpecList";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { LandingBlocks } from "@/components/landing/LandingBlocks";
import { LandingHero } from "@/components/landing/LandingHero";
import type { ModelDoc } from "@/lib/wp-content";

/* Sofa-model and mattress pages share one shape: hero, the type-specific
   "At a glance" facts (fabrics/configurations for sofas, firmness/sizes for
   mattresses — assembled in lib/wp-content), then the shared block library. */
export function ModelPageView({
  model,
  indexHref,
  indexLabel,
}: {
  model: ModelDoc;
  indexHref: string;
  indexLabel: string;
}) {
  return (
    <main>
      <LandingHero
        eyebrow={model.eyebrow}
        title={model.title}
        standfirst={model.standfirst}
        heroImage={model.heroImage}
        heroAlt={model.heroAlt}
        brandLogo={model.brand?.logo}
        crumbs={[
          { label: "Home", href: "/" },
          { label: indexLabel, href: indexHref },
          { label: model.title },
        ]}
      />
      {model.facts.length > 0 && (
        <SectionBlock tone="linen" tight>
          <Reveal>
            <SectionHeading title="At a glance" />
            <SpecList
              className="mt-[var(--section-gap-title)] max-w-[var(--container-narrow)]"
              items={model.facts}
            />
          </Reveal>
        </SectionBlock>
      )}
      <LandingBlocks blocks={model.blocks} />
    </main>
  );
}
