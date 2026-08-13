/* Throwaway T3 spot-check page — every ported DS component in its main states.
   Not linked from anywhere; delete before final deploy or leave (prototype). */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { SectionHeading } from "@/components/core/SectionHeading";
import { TextLink } from "@/components/core/TextLink";

import { DepartmentTile } from "@/components/cards/DepartmentTile";
import { EditorialCard } from "@/components/cards/EditorialCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { ShowroomCard } from "@/components/cards/ShowroomCard";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { TypographicTile } from "@/components/cards/TypographicTile";

import { Logo } from "@/components/brand/Logo";
import { ReviewQuote } from "@/components/brand/ReviewQuote";
import { StarRating } from "@/components/brand/StarRating";

import { Input } from "@/components/forms/Input";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";

import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";

export const metadata: Metadata = {
  title: "Component states — dev",
  robots: { index: false },
};

const img = {
  sofas:
    "https://mcdermotts.ie/wp-content/uploads/2026/06/Selene-Sofa-Range-by-Fama-at-McDermotts-Ennis-And-Castlebar-10.jpg",
  bedroom:
    "https://mcdermotts.ie/wp-content/uploads/2025/03/Casera-Bedframe-Lifestyle-Images-4.webp",
  dining:
    "https://mcdermotts.ie/wp-content/uploads/2025/10/Sloane-Extending-Dining-Table-at-McDermotts-Furniture-7.jpg",
  living:
    "https://mcdermotts.ie/wp-content/uploads/2025/09/Pavon-Barnwood-Extending-Dining-Table-at-McDermotts-Furniture-1.jpg",
  mattresses:
    "https://mcdermotts.ie/wp-content/uploads/2025/12/King-Koil-Spinal-Therapy-1800-by-King-Koil-at-McDermotts-Furniture-Ennis-Castlebar-1024x576.jpg",
};

function Spec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 border-b border-hairline pb-2 text-[length:var(--fs-micro)] uppercase tracking-eyebrow text-ink-soft">
        {title}
      </p>
      {children}
    </div>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 border-b-4 border-ink pb-3 text-[length:var(--fs-h2)] font-bold uppercase tracking-heading">
      {children}
    </h2>
  );
}

const DarkSwatch = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-start gap-6 rounded-md bg-dark p-8">{children}</div>
);

export default function ComponentsPage() {
  return (
    <main className="mx-auto flex max-w-[var(--container-max)] flex-col gap-20 px-[var(--section-pad-x)] py-16">
      <header className="flex flex-col gap-2">
        <EyebrowLabel>Prototype · T3</EyebrowLabel>
        <h1 className="m-0 text-[length:var(--fs-h2)] font-bold uppercase tracking-heading">
          Component states
        </h1>
        <p className="m-0 max-w-[var(--measure-lead)] text-ink-soft">
          Every ported design-system component in its main states, grouped by directory.
        </p>
      </header>

      {/* ------------------------------------------------ core ------- */}
      <section className="flex flex-col gap-10">
        <GroupTitle>core/</GroupTitle>

        <Spec title="Button — variants and sizes">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Shop the Summer Sale</Button>
            <Button variant="secondary">Plan your visit</Button>
            <Button variant="ghost">Browse everything</Button>
            <Button size="sm">Buy a voucher</Button>
            <Button size="lg">Shop the Summer Sale</Button>
            <Button disabled>Out of stock</Button>
          </div>
          <DarkSwatch>
            <Button variant="onDark">Book a visit</Button>
          </DarkSwatch>
          <Button href="/dev/components" variant="secondary" fullWidth>
            Full-width link button
          </Button>
        </Spec>

        <Spec title="Badge — sale, quiet, outline">
          <div className="flex flex-wrap items-center gap-4">
            <Badge>Sale</Badge>
            <Badge tone="quiet">New in</Badge>
            <Badge tone="outline">Ex-display</Badge>
          </div>
        </Spec>

        <Spec title="EyebrowLabel — light and dark tones">
          <EyebrowLabel>Departments · Six of them</EyebrowLabel>
          <DarkSwatch>
            <EyebrowLabel tone="dark">Summer Sale · On now</EyebrowLabel>
          </DarkSwatch>
        </Spec>

        <Spec title="SectionHeading — h2 left, h2 dark centred, h1 hero">
          <SectionHeading
            eyebrow="Departments"
            title="Every room under our roof"
            standfirst="Sofas, mattresses, bedroom, dining, living and garden — all on two floors in Castlebar and Ennis."
          />
          <DarkSwatch>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Summer Sale"
              title="Up to 20% off across every department"
              standfirst="Stated plainly, never shouted. Ends when it ends."
              className="w-full"
            />
          </DarkSwatch>
          <SectionHeading level="h1" title="Comfort, built to last" />
        </Spec>

        <Spec title="TextLink — arrow, plain, dark">
          <div className="flex flex-wrap items-center gap-8">
            <TextLink href="/dev/components">Browse everything</TextLink>
            <TextLink href="tel:0949022500" arrow={false}>
              094 90 22500
            </TextLink>
          </div>
          <DarkSwatch>
            <TextLink href="/dev/components" tone="dark">
              Read the reviews
            </TextLink>
          </DarkSwatch>
        </Spec>
      </section>

      {/* ------------------------------------------------ cards ------ */}
      <section className="flex flex-col gap-10">
        <GroupTitle>cards/</GroupTitle>

        <Spec title="DepartmentTile — 3:4, scrim, hover zoom">
          <div className="grid grid-cols-2 gap-[var(--grid-gap)] md:grid-cols-3">
            <DepartmentTile
              label="Sofas"
              href="/category/sofas"
              image={img.sofas}
              alt="Selene sofa range by Fama in the McDermott's showroom"
              eager
            />
            <DepartmentTile
              label="Bedroom"
              href="/category/bedroom"
              image={img.bedroom}
              alt="Casera bedframe styled with bedside lockers"
            />
            <DepartmentTile
              label="Dining"
              href="/category/dining"
              image={img.dining}
              alt="Sloane extending dining table set with chairs"
            />
          </div>
        </Spec>

        <Spec title="ProductCard — homepage descriptor / category price / category sale">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-3">
            <ProductCard
              brand="Fama"
              title="Axel Modular Sofa"
              descriptor="Reclining, modular, made to order in your fabric"
              href="/product/axel-by-fama"
              image={img.sofas}
              alt="Axel modular sofa by Fama in a showroom setting"
            />
            <ProductCard
              brand="King Koil"
              title="Spinal Therapy 1800"
              price="€1,299"
              href="/product/spinal-therapy-1800"
              image={img.mattresses}
              alt="King Koil mattress dressed on a divan base"
            />
            <ProductCard
              brand="XOOON"
              title="Trenton Sideboard"
              price="€1,199"
              oldPrice="€1,499"
              onSale
              href="/product/trenton-sideboard"
              image={img.living}
              alt="Trenton oak sideboard by XOOON with slatted doors"
            />
          </div>
        </Spec>

        <Spec title="EditorialCard — standard and featured">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2">
            <EditorialCard
              eyebrow="New this week"
              title="Five sofas that seat the whole family"
              excerpt="From modular corners to two-plus-threes — what to look for when everyone wants their own spot."
              href="/dev/components"
              image={img.sofas}
              alt="Selene sofa range by Fama"
            />
            <EditorialCard
              eyebrow="Colour Story · No. 01"
              title="Oak, clay and ochre"
              href="/dev/components"
              image={img.dining}
              alt="Sloane extending dining table"
            />
          </div>
          <EditorialCard
            featured
            eyebrow="From the showroom floor"
            title="How to choose a mattress you'll still love in year eight"
            excerpt="Firmness is personal, support isn't. Our bedding team on what actually matters — and what the 90-night trial is for."
            cta="Read it now"
            href="/dev/components"
            image={img.bedroom}
            alt="Casera bedframe lifestyle shot"
          />
        </Spec>

        <Spec title="ShowroomCard — hours, note, directions, phone">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2">
            <ShowroomCard
              eyebrow="Co. Mayo · Flagship"
              name="Castlebar"
              address="Spencer Street, Castlebar — both sides of the street, with free customer parking behind the stone building."
              hours={[
                { days: "Mon – Sat", time: "9:30 – 18:00" },
                { days: "Sun & Bank Holidays", time: "Closed" },
              ]}
              phone="094 90 22500"
              directionsHref="https://www.google.com/maps/dir//McDermotts+House+Furnishers+Ltd.,+Spencer+St,+Castlebar,+Co.+Mayo"
            />
            <ShowroomCard
              eyebrow="Co. Clare · Our newest showroom"
              name="Ennis"
              address="Station Road, Ennis — parking on the Old Gaol Road side."
              hours={[
                { days: "Mon – Sat", time: "9:30 – 18:00" },
                { days: "Sun & Bank Holidays", time: "12:00 – 17:00" },
              ]}
              note="We open most bank holidays. Check Google or call us before travelling."
              phone="065 68 66233"
              directionsHref="https://www.google.com/maps/place/McDermotts+House+Furnishers+Ennis"
            />
          </div>
        </Spec>

        <Spec title="TypographicTile — light and dark tones">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] sm:grid-cols-2">
            <TypographicTile
              title="Gift vouchers"
              reason="The present for the person who knows exactly what they want."
              cta="Buy a voucher"
              href="/dev/components"
            />
            <TypographicTile
              tone="dark"
              eyebrow="Outlet"
              title="Clearance & outlet"
              reason="Ex-floor models and overstock — reduced hard, ready to go."
              cta="Shop the outlet"
              href="/dev/components"
            />
          </div>
        </Spec>

        <Spec title="TrustPillar — light and dark tones">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-3">
            <TrustPillar
              title="Nationwide delivery & assembly"
              body="Our own crews deliver and assemble everywhere in Ireland — one contribution fee, no surprise charges on the day."
            />
            <TrustPillar
              title="Family-run since 1964"
              body="Three generations on Spencer Street, Castlebar. The same values, the same faces."
            />
            <TrustPillar
              title="90-night mattress trial"
              body="Sleep on it for three months. If it isn't right, we'll work with you to put it right."
            />
          </div>
          <DarkSwatch>
            <TrustPillar
              tone="dark"
              title="90-night mattress trial"
              body="Sleep on it for three months. If it isn't right, we'll work with you to put it right."
              className="max-w-96"
            />
          </DarkSwatch>
        </Spec>
      </section>

      {/* ------------------------------------------------ brand ------ */}
      <section className="flex flex-col gap-10">
        <GroupTitle>brand/</GroupTitle>

        <Spec title="Logo — brand, mono and on dark">
          <Logo href="/" />
          <DarkSwatch>
            <Logo width={220} className="text-on-dark" /> <Logo variant="white" width={220} /> <Logo variant="gold" width={220} />
          </DarkSwatch>
        </Spec>

        <Spec title="StarRating — full, partial, sizes">
          <div className="flex flex-wrap items-center gap-6">
            <StarRating />
            <StarRating rating={4} />
            <StarRating rating={3.5} size={24} />
          </div>
          <DarkSwatch>
            <StarRating tone="dark" />
          </DarkSwatch>
        </Spec>

        <Spec title="ReviewQuote — light lg and dark md">
          <ReviewQuote
            quote="From the minute we walked in we were looked after. Delivery crew were in and out in half an hour and took every scrap of packaging with them."
            source="Verified Google review — Castlebar"
            linkLabel="Read the reviews"
            linkHref="/dev/components"
          />
          <DarkSwatch>
            <ReviewQuote
              tone="dark"
              size="md"
              rating={5}
              quote="The mattress trial is real — we swapped after six weeks, no quibble."
              source="Verified Google review — Ennis"
            />
          </DarkSwatch>
        </Spec>
      </section>

      {/* ------------------------------------------------ forms ------ */}
      <section className="flex flex-col gap-10">
        <GroupTitle>forms/</GroupTitle>

        <Spec title="Input — light with hint, dark">
          <Input
            label="Email address"
            type="email"
            name="spec-email"
            placeholder="you@example.ie"
            hint="We only use this to confirm your delivery day."
            className="max-w-96"
          />
          <DarkSwatch>
            <Input
              tone="dark"
              label="Phone"
              type="tel"
              name="spec-phone"
              required
              className="w-full max-w-96"
            />
          </DarkSwatch>
        </Spec>

        <Spec title="NewsletterSignup — dark (default) and light">
          <DarkSwatch>
            <NewsletterSignup />
          </DarkSwatch>
          <NewsletterSignup tone="light" heading="Hear about new arrivals" />
        </Spec>
      </section>

      {/* ------------------------------------------------ layout ----- */}
      <section className="flex flex-col gap-10">
        <GroupTitle>layout/</GroupTitle>

        <Spec title="SectionBlock — tones (tight, full-bleed inside this page)">
          <div className="flex flex-col overflow-hidden rounded-md border border-hairline">
            <SectionBlock tight tone="linen">
              <p className="m-0">linen — the page surface</p>
            </SectionBlock>
            <SectionBlock tight tone="stone">
              <p className="m-0">stone — the alternate</p>
            </SectionBlock>
            <SectionBlock tight tone="white">
              <p className="m-0">white — card surfaces only</p>
            </SectionBlock>
            <SectionBlock tight tone="dark">
              <p className="m-0">dark — contrast block</p>
            </SectionBlock>
            <SectionBlock tight tone="darkest" width="narrow">
              <p className="m-0">darkest, narrow container</p>
            </SectionBlock>
          </div>
        </Spec>

        <Spec title="Reveal — fade + rise with sibling stagger (scroll down to it)">
          <div className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-3">
            <Reveal>
              <TrustPillar
                title="Order 1"
                body="First sibling — no delay. Fades and rises 18px over 700ms."
              />
            </Reveal>
            <Reveal order={2}>
              <TrustPillar title="Order 2" body="Second sibling — one 90ms stagger step." />
            </Reveal>
            <Reveal order={3}>
              <TrustPillar title="Order 3" body="Third sibling — two stagger steps." />
            </Reveal>
          </div>
        </Spec>
      </section>
    </main>
  );
}
