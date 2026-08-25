import { ProductCard } from "@/components/cards/ProductCard";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { SpecList } from "@/components/commerce/SpecList";
import { Button } from "@/components/core/Button";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import type { LandingBlock } from "@/lib/landing-data";
import { formatPrice, getProducts } from "@/lib/store-api";

/* Block renderer shared by every CMS-authored page type — landing pages
   (/range), sofa models (/sofas) and mattresses (/mattresses). Extracted
   verbatim from the /range/[slug] template; the block model is
   lib/landing-data.ts's union, which the WP flexible-content layouts mirror
   (see wp-plugin/mcdermotts-content). */

async function ProductsBlock({
  block,
}: {
  block: Extract<LandingBlock, { type: "products" }>;
}) {
  /* CMS pages pick products by id; the search string is the fallback. */
  const query = block.ids?.length
    ? { include: block.ids, perPage: 8 }
    : block.search
      ? { search: block.search, perPage: 8 }
      : null;
  if (!query) return null;
  const { products } = await getProducts(query);
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
            <SectionHeading title={block.title} standfirst={block.body} />
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

export function LandingBlocks({ blocks }: { blocks: LandingBlock[] }) {
  return <>{blocks.map(renderBlock)}</>;
}
