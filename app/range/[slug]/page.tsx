import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { RangeEnquiryForm } from "@/components/commerce/RangeEnquiryForm";
import { ShowroomStatusLine } from "@/components/commerce/ShowroomStatusLine";
import { SlidingGallery } from "@/components/commerce/SlidingGallery";
import { SpecList } from "@/components/commerce/SpecList";
import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { COLLECTIONS } from "@/lib/collection-data";
import { getLandingPage, getLandingSlugs, isRangeLive, type LandingBlock, type LandingPage } from "@/lib/landing-data";
import { formatPrice, getProducts, isPermanentlyLow } from "@/lib/store-api";

/* Where a not-live range's traffic goes (spec §5: "search engines and old
   bookmarks are the harder case... sending that traffic to the collection
   the range belonged to keeps the customer moving"). Picks the first tagged
   collection the range would have appeared in; falls back to the hub. */
function fallbackCollectionSlugFor(tags: string[]): string {
  const match = COLLECTIONS.find((c) => c.tags.length > 0 && c.tags.every((t) => tags.includes(t)));
  return match?.slug ?? "full-collection";
}

/* Marketing landing template — the prototype twin of the Flatsome pages the
   marketing team builds per range (mack-sofa-range, xtra-life-plus-1600…).
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
    <SectionBlock
      tone="stone"
      /* Tighter top and bottom (Declan, 2026-08-26) — this block wasn't
         even on the "tight" preset (clamp 56-112px, more than every
         neighbour), so it was the single biggest contributor to how far
         apart Closer Detail and Request a Quote read on either side of it. */
      style={{ paddingTop: "20px", paddingBottom: "20px" }}
    >
      <Reveal>
        <SectionHeading title={block.title} standfirst={block.standfirst} />
      </Reveal>
      <Reveal order={2}>
        {/* mt-4, not --section-gap-title — same fix as elsewhere on this
            page: the block's own top padding is trimmed to 20px, so the
            wider gap read as "Buy online" belonging to Closer Detail above
            it rather than its own product grid (Declan, 2026-08-26). */}
        <ul
          /* auto-fill, not auto-fit (Declan, 2026-08-27) — auto-fit collapses
             the empty tracks a short row leaves behind and lets the real
             items stretch to fill the freed space, which is exactly wrong
             for a range with a single purchasable product (Colo): that one
             card would grow to the full row width instead of staying the
             same size it'd be sitting among three or four others. auto-fill
             keeps those tracks around unfilled, so a card is always sized
             off minmax(240px, 1fr) against the grid, never against how many
             siblings happen to be in it. */
          className="mt-4 grid list-none grid-cols-2 p-0 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
          style={{ gap: "var(--grid-gap)" }}
        >
          {products.map((p) => {
            /* Sale styling (badge + red price) is tag/category-driven, not
               on_sale — a product not tagged permanently-low always reads
               as on sale (Declan, 2026-08-27). Whether there's an actual
               struck-through old price to show stays data-driven; you can't
               show a discount that doesn't exist. */
            const onSale = !isPermanentlyLow(p);
            const hasMarkdown = p.on_sale && p.prices.regular_price !== p.prices.price;
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
                  oldPrice={hasMarkdown ? formatPrice(p.prices.regular_price, p.prices) : undefined}
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

function renderBlock(block: LandingBlock, index: number, isFirst: boolean, page: LandingPage) {
  switch (block.type) {
    case "editorial":
      return (
        <SectionBlock
          key={index}
          tone="linen"
          tight
          /* The very first block on the page also gets a reduced top
             padding (Declan, 2026-08-26) — SectionBlock's own tight preset
             (clamp 40-72px) is the right gap between two content blocks,
             but it left too much space between the compact status-line
             divider above and the actual first paragraph. A `style`
             override, not a competing className: two py-* utility classes
             have equal specificity, so the later one in the stylesheet
             wins, not the later one in the class list — unreliable. Inline
             style always wins. Bottom padding trimmed unconditionally too,
             for the gap to the gallery ("A closer look") below it. */
          style={{ paddingTop: isFirst ? "20px" : undefined, paddingBottom: "20px" }}
        >
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
        <SectionBlock
          key={index}
          tone="linen"
          tight
          /* Reduced top AND bottom padding (Declan, 2026-08-26): this block
             sits between the gallery above and Detail below, and both of
             those gaps read as too loose — SectionBlock's own tight preset
             padding stacks on both sides of every boundary (padding doesn't
             collapse like margin does), so trimming just this one block
             tightens both neighbouring gaps at once. */
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Reveal>
            <SectionHeading title={block.title} />
          </Reveal>
          {/* mt-2, not --section-gap-title (28-48px) — that gap is right
              between two distinct blocks, but reads as too loose between a
              block's own heading and its own content directly beneath it.
              Tightened once already to mt-4, then further to mt-2
              (Declan, 2026-08-26). */}
          <Reveal order={2}>
            <ul className="mt-2 grid list-none grid-cols-1 gap-[var(--grid-gap)] p-0 sm:grid-cols-2 lg:grid-cols-4">
              {block.items.map((item) => (
                <li key={item.title}>
                  <TrustPillar title={item.title} body={item.body} />
                </li>
              ))}
            </ul>
          </Reveal>
          {/* Right where the copy usually references it ("Check the
              specifications sheet…"), not buried elsewhere on the page.
              A bordered pill with an icon, not a plain text link (Declan,
              2026-08-26: "more obvious, but not obtrusive") — visually
              distinct enough to actually notice at a glance, but a quiet
              outlined chip rather than a solid Button, so it doesn't
              compete with the real call to action further down the page
              ("Get a quote"). */}
          {page.specSheetUrl && (
            <Reveal order={3}>
              <a
                href={page.specSheetUrl}
                className="mt-4 inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-full border border-hairline bg-white px-5 text-[length:var(--fs-small)] font-bold text-ink no-underline transition-colors duration-[var(--dur-base)] hover:border-ink hover:bg-stone"
              >
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
                </svg>
                See the specifications sheet (PDF)
              </a>
            </Reveal>
          )}
        </SectionBlock>
      );
    case "specs":
      return (
        <SectionBlock key={index} tone="linen" tight style={{ paddingTop: "20px", paddingBottom: "20px" }}>
          <Reveal>
            <SectionHeading title={block.title} />
            {/* mt-4, not --section-gap-title — same fix as Key Features and
                the gallery: the block's own top padding is trimmed to 20px,
                so the wider gap was reading as "Closer Detail" belonging to
                Key Features above it rather than its own content
                (Declan, 2026-08-26). */}
            <SpecList className="mt-4 max-w-[var(--container-narrow)]" items={block.items} />
          </Reveal>
        </SectionBlock>
      );
    case "gallery":
      return (
        <SectionBlock
          key={index}
          tone="stone"
          tight
          /* Top trimmed to close the gap up to whatever sits above it
             (editorial copy, or a video block — order varies per range);
             bottom already trimmed for the gap down to Key Features
             (Declan, 2026-08-26). */
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Reveal>
            {block.title && <SectionHeading title={block.title} />}
            {/* mt-4, not --section-gap-title — same reasoning as Key
                Features below: with the block's own top padding trimmed to
                20px, the wider title-to-content gap was making "A closer
                look" read as closer to the paragraph above it than to its
                own gallery (Declan, 2026-08-26). */}
            <div className={block.title ? "mt-4" : undefined}>
              <SlidingGallery images={block.images} />
            </div>
          </Reveal>
        </SectionBlock>
      );
    case "video":
      return (
        <SectionBlock
          key={index}
          tone="stone"
          tight
          /* Same "stone" tone as the gallery block (Declan, 2026-08-27: real
             showroom footage, same idea as the photo gallery, just moving)
             so the two flow as one visual section wherever they end up
             adjacent, rather than reading as separate ones. Padding matches
             the rhythm of its neighbours either side. */
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Reveal>
            {block.title && <SectionHeading title={block.title} />}
            <div className={block.title ? "mt-4" : undefined}>
              {/* youtube-nocookie.com, not youtube.com — doesn't set
                  tracking cookies until the visitor actually presses play. */}
              <div className="mx-auto aspect-video w-full max-w-[var(--container-narrow)] overflow-hidden rounded-md bg-ink">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
                  title={block.caption ?? `${page.title} in the McDermott's showroom`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              {block.caption && (
                <p className="mt-3 text-[length:var(--fs-micro)] text-ink-soft">{block.caption}</p>
              )}
            </div>
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
    case "quoteForm":
      return (
        <SectionBlock key={index} tone="stone" tight style={{ paddingTop: "20px" }}>
          <Reveal>
            <SectionHeading title={block.title} standfirst={block.standfirst} />
          </Reveal>
          <Reveal order={2}>
            <RangeEnquiryForm
              rangeName={page.title}
              tags={page.tags}
              pageUrl={`/range/${page.slug}`}
              showroomStatus={page.showroomStatus}
              className="mt-4 max-w-[var(--container-narrow)]"
            />
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
      {/* Hero — mobile confirmed good (Declan, 2026-08-25), kept as-is: full-
          bleed image on top, no overlay, text below. Desktop goes side by
          side instead of stacked — stacking put the title too far down the
          screen under a full-width image. Text left, image right, in a
          bounded column so a ~1000px source image isn't upscaled soft. */}
      <section className="lg:hidden">
        <div className="relative aspect-[var(--ratio-hero)] w-full overflow-hidden bg-stone">
          <Image src={page.heroImage} alt={page.heroAlt} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto mt-6 w-full max-w-[var(--container-narrow)]" style={{ padding: "0 var(--section-pad-x)" }}>
          <Breadcrumbs className="mb-6" items={[{ label: "Home", href: "/" }, { label: page.title }]} />
          <EyebrowLabel>{page.eyebrow}</EyebrowLabel>
          <h1 className="m-0 mt-2 text-[length:var(--fs-hero)] font-bold uppercase leading-[var(--lh-tight)] tracking-hero text-ink">
            {page.title}
          </h1>
          <p className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] text-ink-soft">
            {page.standfirst}
          </p>
        </div>
      </section>

      {/* --container-wide, not --container-max: SiteHeader's nav bar runs at
          --container-wide (1440px), so --container-max (1280px) here was
          sitting visibly inset from the header above it — not actually a
          "smaller image", a container mismatch. */}
      <section
        className="mx-auto hidden w-full max-w-[var(--container-wide)] lg:block"
        /* Top halved too (Declan, 2026-08-27: "reduce the gap between the
           bottom of the header, and the breadcrumbs") — same fix as the
           category/collection/product pages, applied here since this
           desktop hero has its own breadcrumb right under the header too. */
        style={{
          paddingTop: "calc(var(--section-pad-y-tight) / 2)",
          paddingBottom: "24px",
          paddingLeft: "var(--section-pad-x)",
          paddingRight: "var(--section-pad-x)",
        }}
      >
        <div className="grid items-center gap-[var(--grid-gap)] lg:grid-cols-2 lg:gap-16">
          {/* Text first in markup = left column; image second = right. */}
          <div>
            <Breadcrumbs className="mb-6" items={[{ label: "Home", href: "/" }, { label: page.title }]} />
            <EyebrowLabel>{page.eyebrow}</EyebrowLabel>
            <h1 className="m-0 mt-2 text-[length:var(--fs-hero)] font-bold uppercase leading-[var(--lh-tight)] tracking-hero text-ink">
              {page.title}
            </h1>
            <p className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] text-ink-soft">
              {page.standfirst}
            </p>
          </div>
          <div className="relative aspect-[var(--ratio-hero)] overflow-hidden rounded-md bg-stone">
            <Image
              src={page.heroImage}
              alt={page.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Compact showroom status — "high and small" (spec §5): directly under
          the hero so it stays above the fold without pushing the photography
          down, purely factual, no softening. The fuller showroom section
          with hours/phone/directions lives in the "showroom" block below,
          where there's room to frame it properly. */}
      <div
        className="mx-auto mb-10 w-full max-w-[var(--container-wide)] border-b border-hairline pt-3 pb-3"
        style={{ paddingLeft: "var(--section-pad-x)", paddingRight: "var(--section-pad-x)" }}
      >
        <ShowroomStatusLine status={page.showroomStatus} />
      </div>

      {/* Pulls the block stack up slightly, into the mb-10 above (real
          margin, sitting outside the border) — not onto the bordered box
          itself. A negative margin directly against the border (tried
          first) let the next block's opaque background paint straight over
          the hairline; margins collapse safely, painted boxes don't.
          SectionBlock's own top padding is generous by design for
          block-to-block spacing everywhere else, so this is scoped to just
          this one gap rather than shrinking that padding globally. */}
      <div className="-mt-8">{page.blocks.map((block, i) => renderBlock(block, i, i === 0, page))}</div>
    </main>
  );
}
