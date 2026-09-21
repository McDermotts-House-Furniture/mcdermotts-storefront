import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/brand/StarRating";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { ProductCard } from "@/components/cards/ProductCard";
import { Accordion } from "@/components/commerce/Accordion";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { BuyControls } from "@/components/commerce/BuyControls";
import { DeliveryNotice } from "@/components/commerce/DeliveryNotice";
import { DimensionSet, type DimensionItem } from "@/components/commerce/DimensionSet";
import { Price } from "@/components/commerce/Price";
import { ProductEnquiryForm } from "@/components/commerce/ProductEnquiryForm";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductStage } from "@/components/commerce/ProductStage";
import { RangeLink } from "@/components/commerce/RangeLink";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { TextLink } from "@/components/core/TextLink";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { VariablePurchase } from "@/components/product/VariablePurchase";
import { getAcfProductFields } from "@/lib/acf";
import { resolveModelRef } from "@/lib/wp-content";
import { decodeEntities } from "@/lib/html";
import { getSwatchImages } from "@/lib/swatches";
import { describeStock, getDefaultAttributes, getStockInfo } from "@/lib/wc-admin";
import { homepage } from "@/lib/homepage-data";
import { deliveryNoticesFor, optionsNoteFor, rangeLinksFor } from "@/lib/merchandising";
import { sanitizeProductHtml } from "@/lib/sanitize";
import {
  formatPrice,
  getProductBySlug,
  getProducts,
  isPermanentlyLow,
  type StoreApiProduct,
} from "@/lib/store-api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/* The 90-night mattress trial only applies to King Koil mattresses — and even
   there, Dromoland Castle is excluded (hotel-spec model, sold on its own terms).
   Everywhere else the third trust pillar becomes the Google rating instead. */
const GOOGLE_RATING_PILLAR = {
  title: "4.8 stars on Google",
  body: "Rated 4.8 out of 5 across 200+ reviews from customers in Mayo, Clare and beyond.",
};
/* Matches all three sizes: dromoland-castle-{double,king,superking}-mattress-by-king-koil. */
const isDromolandCastle = (slug: string) => slug.startsWith("dromoland-castle-");

function pillarsFor(product: StoreApiProduct) {
  const isKingKoil = product.brands?.some((b) => b.slug === "king-koil") ?? false;
  const showMattressTrial = isKingKoil && !isDromolandCastle(product.slug);
  if (showMattressTrial) return homepage.pillars;
  return homepage.pillars.map((p) =>
    p.title === "90-night mattress trial" ? GOOGLE_RATING_PILLAR : p,
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.short_description.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

function displayPrice(product: StoreApiProduct): {
  current: string;
  old?: string;
  isRange: boolean;
} {
  const { prices } = product;
  const range = prices.price_range;
  if (range) {
    return {
      current: `${formatPrice(range.min_amount, prices)} – ${formatPrice(range.max_amount, prices)}`,
      isRange: true,
    };
  }
  if (product.on_sale && prices.regular_price !== prices.price) {
    return {
      current: formatPrice(prices.price, prices),
      old: formatPrice(prices.regular_price, prices),
      isRange: false,
    };
  }
  return { current: formatPrice(prices.price, prices), isRange: false };
}

/* WooCommerce dimensions are usually empty on this catalogue — render only real data. */
function dimensionItems(product: StoreApiProduct): DimensionItem[] {
  const d = product.dimensions;
  if (!d) return [];
  return [
    { label: "Height", value: d.height, unit: "cm" },
    { label: "Width", value: d.width, unit: "cm" },
    { label: "Depth", value: d.length, unit: "cm" },
  ].filter((item) => item.value !== "");
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const brand = product.brands?.[0]?.name;
  const price = displayPrice(product);
  const isVariable = product.type === "variable" && product.variations.length > 0;
  const variationAttributes = product.attributes.filter((a) => a.has_variations);
  const rating = Number(product.average_rating);
  const primaryCategory = product.categories[0];
  const rangeLinks = rangeLinksFor(product);
  const deliveryNotices = deliveryNoticesFor(product);
  /* ACF (theme fields) wins; falls back to Woo's native dimension fields. */
  const acf = await getAcfProductFields(slug);
  const dimensions = acf?.dimensions.length ? acf.dimensions : dimensionItems(product);
  /* Model link (mcdermotts-content plugin): the range story authored once in
     WP, surfaced on every product that belongs to the model. */
  const modelRef = acf?.modelRef ? await resolveModelRef(acf.modelRef) : null;
  const defaultSelection = isVariable ? await getDefaultAttributes(product.id) : null;
  const swatchMap = isVariable ? await getSwatchImages(product.permalink) : null;
  /* Variable products resolve their own per-variation stock inside
     VariablePurchase (one variation at a time, via /api/variation); a
     simple product has just the one to check, here. */
  const stock = isVariable ? null : describeStock(await getStockInfo(product.id));

  const related = primaryCategory
    ? (await getProducts({ category: primaryCategory.id, perPage: 5 })).products
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const galleryImages = product.images.map((img) => ({
    src: img.src,
    alt: img.alt || product.name,
    thumb: img.thumbnail,
  }));

  const infoHeader = (
    /* Explicit Fragment + key (not the <>...</> shorthand, which can't take
       props) — this same element is threaded through both PDP branches
       (straight into ProductStage here, or via VariablePurchase's prop),
       always landing as one of several literal children under
       ProductStage; giving it (and the other shared blocks below) a stable
       key up front avoids "Each child in a list should have a unique key
       prop" (Declan, 2026-09-01) rather than relying on each call site to
       remember to key it. */
    <Fragment key="info-header">
      {brand && <EyebrowLabel>{brand}</EyebrowLabel>}
      <h1
        className="mt-2 uppercase"
        style={{
          fontSize: "var(--fs-h2)",
          fontWeight: 700,
          lineHeight: "var(--lh-heading)",
          letterSpacing: "var(--ls-heading)",
        }}
      >
        {product.name}
      </h1>
      {rating > 0 && product.review_count > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={rating} />
          <span className="text-[length:var(--fs-small)] text-ink-soft">
            {product.review_count} {product.review_count === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}
    </Fragment>
  );

  const shortDescription = product.short_description ? (
    <div
      key="short-description"
      className="mt-6 max-w-[var(--measure-body)] [&_img]:hidden [&_p]:mt-2"
      dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.short_description) }}
    />
  ) : undefined;

  const footNote = (
    <p key="foot-note" className="mt-6 max-w-[var(--measure-body)] text-[length:var(--fs-small)] text-ink-soft">
      Delivered and assembled by our own crews — one contribution fee, no surprise charges
      on the day.
    </p>
  );

  /* Shared by both branches — variable products have dimensions too. */
  const dimensionsNode =
    dimensions.length > 0 || acf?.specSheetUrl ? (
      <div key="dimensions" className="mt-8">
        {dimensions.length > 0 && <DimensionSet items={dimensions} />}
        {acf?.specSheetUrl && (
          <div className="mt-3">
            <TextLink href={acf.specSheetUrl}>See more sizes (PDF)</TextLink>
          </div>
        )}
      </div>
    ) : null;

  /* Delivery notices stack in theme-rule order (tag-driven, lib/merchandising). */
  const deliveryStack = (
    <div key="delivery-stack" className="mt-8 grid gap-5">
      {deliveryNotices.map((notice) => (
        <DeliveryNotice key={notice.title + (notice.body ?? "")} {...notice} />
      ))}
    </div>
  );

  /* RangeLinks + the accordion stack — everything after the buy area (kit order). */
  const detailExtras = (
    <Fragment key="detail-extras">
      {modelRef && (
        <RangeLink
          className="mt-8"
          eyebrow="Part of the range"
          name={modelRef.title}
          reason={modelRef.standfirst ?? "The full range story, in one place."}
          href={modelRef.href}
        />
      )}
      {rangeLinks.map((range) => (
        <RangeLink
          key={range.href}
          className="mt-8"
          name={range.name}
          reason="Everything in the range, in one place."
          href={range.href}
        />
      ))}
      <div className="mt-10">
        {product.description && (
          <Accordion title="About this piece" open>
            <div
              className="[&_h2]:mt-4 [&_h2]:font-bold [&_h2]:uppercase [&_h3]:mt-3 [&_h3]:font-bold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_li]:mt-1 [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.description) }}
            />
          </Accordion>
        )}
        <Accordion title="Delivery & assembly">
          Our own crews deliver and assemble everywhere in Ireland, led by a core team with
          140 years&apos; combined experience. We&apos;ll agree a day with you and take the
          packaging away with us.
        </Accordion>
        <Accordion title="Seeing it in person">
          On the floor in Castlebar and Ennis. Both showrooms open Mon – Sat, 9:30 – 18:00;
          Ennis also opens Sundays and most bank holidays, 12:00 – 17:00.
        </Accordion>
        <Accordion title="Returns">
          Fourteen days to change your mind on anything bought online, unused and in its
          packaging. Made-to-order pieces are the exception — we&apos;ll say so clearly
          before you order.
        </Accordion>
        {/* Every product page, not just range pages — RangeEnquiryForm is
            the full quote form on a range page, this is the lighter version
            (Declan, 2026-08-27: "a query form that sends an email back —
            like the query form in the sofa collection pages but not with so
            much detail... only needed is name, email address, phone number,
            delivery location and a question box"). Client-side only, same
            as every other form on this site so far — confirmed with Declan,
            not wired to a real backend yet. */}
        <Accordion title="Have a question?">
          <p className="m-0">
            Ask us anything about this piece — sizing, fabric, delivery, whatever you need to
            know before you order. Or ring Castlebar direct on{" "}
            <a href="tel:0949022500" className="text-ink underline hover:text-gold-deep">
              094 90 22500
            </a>
            .
          </p>
          <ProductEnquiryForm productName={product.name} pageUrl={`/product/${product.slug}`} className="mt-5" />
        </Accordion>
      </div>
    </Fragment>
  );

  return (
    <main>
      <div
        className="mx-auto w-full max-w-[var(--container-max)]"
        /* Top halved (Declan, 2026-08-27: "reduce the gap between the bottom
           of the header, and the breadcrumbs") — same fix as the category
           page, same reasoning: this page's own top padding, not the
           header's, is what made the gap. Bottom and the sides unchanged. */
        style={{
          paddingTop: "calc(var(--section-pad-y-tight) / 2)",
          paddingBottom: "var(--section-pad-y-tight)",
          paddingLeft: "var(--section-pad-x)",
          paddingRight: "var(--section-pad-x)",
        }}
      >
        {/* Full trail on desktop; mobile drops to just the immediate parent
            category (Declan, 2026-09-02, "Gallery sizing" — every bit of
            height above the gallery counts toward the swatches staying on
            screen) — "Home" and the product name (already the H1 right
            below) add nothing a shopper needs on the way back up. */}
        <Breadcrumbs
          className="mb-8 hidden lg:block"
          items={[
            { label: "Home", href: "/" },
            ...(primaryCategory
              ? [
                  {
                    label: decodeEntities(primaryCategory.name),
                    href: `/category/${primaryCategory.slug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />
        <Breadcrumbs
          className="mb-4 lg:hidden"
          items={[
            primaryCategory
              ? { label: decodeEntities(primaryCategory.name), href: `/category/${primaryCategory.slug}` }
              : { label: "Home", href: "/" },
          ]}
        />

        {isVariable ? (
          <VariablePurchase
            productId={product.id}
            slug={product.slug}
            name={product.name}
            images={galleryImages}
            attributes={variationAttributes.map((a) => ({
              name: a.name,
              taxonomy: a.taxonomy,
              terms: a.terms.map((t) => ({ name: t.name, slug: t.slug })),
            }))}
            swatchImages={swatchMap ?? undefined}
            variations={product.variations}
            basePrice={{ current: price.current, isRange: price.isRange }}
            onSale={!isPermanentlyLow(product)}
            initialSelection={defaultSelection ?? undefined}
            infoHeader={infoHeader}
            shortDescription={shortDescription}
            dimensions={dimensionsNode}
            deliveryNotices={deliveryStack}
            footNote={footNote}
            detailExtras={detailExtras}
          />
        ) : (
          <ProductStage media={<ProductGallery images={galleryImages} name={product.name} />}>
            {infoHeader}
            <Price
              key="price"
              className="mt-5"
              current={price.current}
              old={price.old}
              from={price.isRange}
              onSale={!isPermanentlyLow(product)}
            />
            {/* Skipped when it isn't a managed, really-tracked reading — the
                delivery notice stack below already covers "non-stock order"
                for the whole product, so this line would just repeat it
                (Declan, 2026-09-06). */}
            {stock?.managed && (
              <p key="availability" className="mt-2 text-[length:var(--fs-small)] text-ink-soft">
                {stock.text}
              </p>
            )}
            {shortDescription}
            {dimensionsNode}
            {deliveryStack}
            <div key="buy-controls" className="mt-8">
              <BuyControls
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceMinorUnits: product.prices.price,
                  image: product.images[0]?.src ?? "",
                  imageAlt: product.images[0]?.alt || product.name,
                }}
                inStock={stock?.inStock ?? product.is_in_stock}
                name={product.name}
                price={price.current}
                oldPrice={price.old}
              />
            </div>
            {footNote}
            {detailExtras}
          </ProductStage>
        )}

        <section className="mt-16 border-t border-hairline pt-10">
          <ul className="grid list-none grid-cols-1 gap-[var(--grid-gap)] p-0 md:grid-cols-3">
            {pillarsFor(product).map((pillar) => (
              <li key={pillar.title}>
                <TrustPillar title={pillar.title} body={pillar.body} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {related.length > 0 && primaryCategory && (
        <SectionBlock tone="stone" id="mcd-pdp-related">
          <Reveal>
            <SectionHeading
              eyebrow="Goes with it"
              title={`More ${decodeEntities(primaryCategory.name)}`}
              standfirst="From the same department, on the floor now."
            />
          </Reveal>
          <Reveal order={2}>
            <ul
              className="mt-[var(--section-gap-title)] grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] p-0"
              style={{ gap: "var(--grid-gap)" }}
            >
              {related.map((p) => {
                const rel = displayPrice(p);
                return (
                  <li key={p.id}>
                    <ProductCard
                      brand={p.brands?.[0]?.name}
                      title={p.name}
                      href={`/product/${p.slug}`}
                      image={p.images[0]?.src}
                      alt={p.images[0]?.alt || p.name}
                      onSale={!isPermanentlyLow(p)}
                      price={rel.current}
                      oldPrice={rel.old}
                      optionsNote={optionsNoteFor(p)}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    />
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </SectionBlock>
      )}
    </main>
  );
}
