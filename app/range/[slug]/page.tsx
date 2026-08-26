import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { ShowroomStatusLine } from "@/components/commerce/ShowroomStatusLine";
import { SpecList } from "@/components/commerce/SpecList";
import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { COLLECTIONS } from "@/lib/collection-data";
import { getLandingPage, getLandingSlugs, isRangeLive, type LandingBlock } from "@/lib/landing-data";
import { formatPrice, getProducts } from "@/lib/store-api";

/* Where a not-live range's traffic goes (spec §5: "search engines and old
   bookmarks are the harder case... sending that traffic to the collection
   the range belonged to keeps the customer moving"). Picks the first tagged
   collection the range would have appeared in; falls back to the hub. */
function fallbackCollectionSlugFor(tags: string[]): string {
  const match = COLLECTIONS.find((c) => c.tags.length > 0 && c.tags.every((t) => tags.includes(t)));
  return match?.slug ?? "full-collection";
}

/* Marketing landing template — the prototype twin of the Flatsome pages the
   marketing team builds per range (henrik-sofa-range, xtra-life-plus-1600…).
   Content comes from lib/landing-data.ts, whose block model is the Sanity
   schema this flow would use in production. */

interface LandingProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LandingProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  return { title: page.title, description: page.standfirst };
}

async function ProductsBlock({
  block,
}: {
  block: Extract<LandingBlock, { type: "products" }>;
}) {
  const { products } = await getProducts({ search: block.search, perPage: 8 });
  if (products.length === 0) return null;
  return (
    <SectionBlock tone="stone">
      <Reveal>
        <SectionHeading title={block.title} standfirst={block.standfirst} />
      </Reveal>
      <Reveal order={2}>
        <ul
          className="mt-[var(--section-gap-title)] grid list-none grid-cols-2 p-0 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
          style={{ gap: "var(--grid-gap)" }}
        >
          {products.map((p) => {
            const onSale = p.on_sale && p.prices.regular_price !== p.prices.price;
            return (
              <li key={p.id}>
                <ProductCard
                  brand={p.brands?.[0]?.name}
                  title={p.name}
                  href={`/product/${p.slug}`}
                  image={p.images[0]?.src}
                  alt={p.images[0]?.alt || p.name}
                  onSale={onSale}
                  price={formatPrice(p.prices.price, p.prices)}
                  oldPrice={onSale ? formatPrice(p.prices.regular_price, p.prices) : undefined}
                  sizes="(max-width: 767px) 50vw, 25vw"
                />
              </li>
            );
          })}
        </ul>
      </Reveal>
    </SectionBlock>
  );
}

function renderBlock(block: LandingBlock, index: number) {
  switch (block.type) {
    case "editorial":
      return (
        <SectionBlock key={index} tone="linen" tight>
          <Reveal>
            {block.title && <SectionHeading title={block.title} />}
            {block.paragraphs.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)]"
              >
                {p}
              </p>
            ))}
          </Reveal>
        </SectionBlock>
      );
    case "features":
      return (
        <SectionBlock key={index} tone="linen" tight>
          <Reveal>
            <SectionHeading title={block.title} />
          </Reveal>
          <Reveal order={2}>
            <ul className="mt-[var(--section-gap-title)] grid list-none grid-cols-1 gap-[var(--grid-gap)] p-0 sm:grid-cols-2 lg:grid-cols-4">
              {block.items.map((item) => (
                <li key={item.title}>
                  <TrustPillar title={item.title} body={item.body} />
                </li>
              ))}
            </ul>
          </Reveal>
        </SectionBlock>
      );
    case "specs":
      return (
        <SectionBlock key={index} tone="linen" tight>
          <Reveal>
            <SectionHeading title={block.title} />
            <SpecList className="mt-[var(--section-gap-title)] max-w-[var(--container-narrow)]" items={block.items} />
          </Reveal>
        </SectionBlock>
      );
    case "products":
      return <ProductsBlock key={index} block={block} />;
    case "showroom":
      return (
        <SectionBlock key={index} tone="stone" tight>
          <Reveal>
            <SectionHeading
              title={block.title}
              standfirst={block.body}
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/#mcd-06-showrooms">Plan your visit</Button>
              <Button href="tel:0949022500" variant="secondary">
                Call 094 90 22500
              </Button>
            </div>
          </Reveal>
        </SectionBlock>
      );
    case "callCta":
      return (
        <SectionBlock key={index} tone="dark">
          <Reveal>
            <SectionHeading tone="dark" title={block.title} standfirst={block.body} />
            <div className="mt-8">
              <Button variant="onDark" href="tel:0949022500">
                Call 094 90 22500
              </Button>
            </div>
          </Reveal>
        </SectionBlock>
      );
  }
}

export default async function LandingPageRoute({ params }: LandingProps) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();
  /* Publishing rule (spec §5): both showrooms "not on display" means the
     range comes off the site — not a 404 (that loses a page with real
     search-ranking history), a redirect to the collection it belonged to. */
  if (!isRangeLive(page)) redirect(`/collection/${fallbackCollectionSlugFor(page.tags)}`);

  return (
    <main>
      {/* Hero — full-bleed photography behind the left scrim, per the DS hero. */}
      <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-darker">
        <Image
          src={page.heroImage}
          alt={page.heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
        <div
          className="relative mx-auto w-full max-w-[var(--container-max)]"
          style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
        >
          <Breadcrumbs
            className="mb-6 text-on-dark-muted"
            items={[{ label: "Home", href: "/" }, { label: page.title }]}
          />
          <EyebrowLabel tone="dark">{page.eyebrow}</EyebrowLabel>
          <h1 className="m-0 mt-2 max-w-[16ch] text-[length:var(--fs-hero)] font-bold uppercase leading-[var(--lh-tight)] tracking-hero text-white">
            {page.title}
          </h1>
          <p className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] text-on-dark">
            {page.standfirst}
          </p>
        </div>
      </section>

      {/* Compact showroom status — "high and small" (spec §5): directly under
          the hero so it stays above the fold without pushing the photography
          down, purely factual, no softening. The fuller showroom section
          with hours/phone/directions lives in the "showroom" block below,
          where there's room to frame it properly. */}
      <div
        className="mx-auto w-full max-w-[var(--container-max)] border-b border-hairline pt-5 pb-5"
        style={{ paddingLeft: "var(--section-pad-x)", paddingRight: "var(--section-pad-x)" }}
      >
        <ShowroomStatusLine status={page.showroomStatus} />
      </div>

      {page.blocks.map(renderBlock)}
    </main>
  );
}
