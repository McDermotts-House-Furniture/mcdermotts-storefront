import type { Metadata } from "next";
import { ShowroomCard } from "@/components/cards/ShowroomCard";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { SectionHeading } from "@/components/core/SectionHeading";
import { TextLink } from "@/components/core/TextLink";
import { findUs } from "@/lib/find-us-data";

/* Real page, copied from the live /about/find-us/ (Declan, 2026-08-27) —
   this used to just be a homepage anchor (#mcd-06-showrooms); every "Find
   us" link on the site now points here instead. See lib/find-us-data.ts for
   the content itself. */

export const metadata: Metadata = {
  title: `${findUs.title} — McDermott's House Furnishers`,
  description: findUs.standfirst,
};

export default function FindUsPage() {
  return (
    <main>
      <div
        className="mx-auto w-full max-w-[var(--container-wide)]"
        /* Top halved (Declan, 2026-08-27) — bottom and the sides keep the
           standard --section-pad-y/--section-pad-x; calc() against the token
           rather than a hardcoded value so it stays in step if that token
           ever changes. */
        style={{
          paddingTop: "calc(var(--section-pad-y) / 2)",
          paddingBottom: "var(--section-pad-y)",
          paddingLeft: "var(--section-pad-x)",
          paddingRight: "var(--section-pad-x)",
        }}
      >
        <Breadcrumbs className="mb-8" items={[{ label: "Home", href: "/" }, { label: "Find Us" }]} />
        <SectionHeading level="h1" eyebrow={findUs.eyebrow} title={findUs.title} standfirst={findUs.standfirst} />

        <div
          className="mt-[var(--section-gap-title)] grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[var(--grid-gap)]"
        >
          {findUs.showrooms.map((s) => (
            <ShowroomCard
              key={s.name}
              eyebrow={s.eyebrow}
              name={s.name}
              description={s.description}
              videoSrc={s.videoSrc}
              address={s.address}
              hours={[...s.hours]}
              note={"note" in s ? s.note : undefined}
              parking={s.parking}
              directionsHref={s.directions}
              phone={s.phone}
              phoneHref={s.phoneHref}
            />
          ))}
        </div>

        <p className="mt-10 max-w-[var(--measure-body)] text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink-soft">
          Can&apos;t make it in? Email us at{" "}
          <TextLink href="mailto:sales@mcdermotts.ie" arrow={false} className="inline">
            sales@mcdermotts.ie
          </TextLink>{" "}
          — nationwide delivery &amp; assembly available.
        </p>
      </div>
    </main>
  );
}
