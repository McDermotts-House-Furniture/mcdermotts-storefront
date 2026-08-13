import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/brand/StarRating";
import { TrustPillar } from "@/components/cards/TrustPillar";
import { ProductCard } from "@/components/cards/ProductCard";
import { Badge } from "@/components/core/Badge";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { SectionHeading } from "@/components/core/SectionHeading";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";
import { homepage } from "@/lib/homepage-data";
import { sanitizeProductHtml } from "@/lib/sanitize";
import {
  formatPrice,
  getProductBySlug,
  getProducts,
  type StoreApiProduct,
} from "@/lib/store-api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const brand = product.brands?.[0]?.name;
  const price = displayPrice(product);
  const isVariable = product.type === "variable";
  const variationAttributes = product.attributes.filter((a) => a.has_variations);
  const rating = Number(product.average_rating);
  const primaryCategory = product.categories[0];

  const related = primaryCategory
    ? (await getProducts({ category: primaryCategory.id, perPage: 5 })).products
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  return (
    <main
      className="mx-auto w-full max-w-[var(--container-max)]"
      style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft"
      >
        <Link href="/" className="text-inherit no-underline hover:underline">
          Home
        </Link>
        {primaryCategory && (
          <>
            <span aria-hidden> · </span>
            <Link
              href={`/category/${primaryCategory.slug}`}
              className="text-inherit no-underline hover:underline"
            >
              {primaryCategory.name}
            </Link>
          </>
        )}
        <span aria-hidden> · </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-[var(--grid-gap)] lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={product.images.map((img) => ({
            src: img.src,
            alt: img.alt || product.name,
            thumb: img.thumbnail,
          }))}
          name={product.name}
        />

        <div>
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

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            {price.isRange && (
              <span className="text-[length:var(--fs-small)] text-ink-soft">From</span>
            )}
            <span className="text-[length:var(--fs-h3)] font-bold">{price.current}</span>
            {price.old && (
              <>
                <s className="text-ink-soft">{price.old}</s>
                <Badge>Sale</Badge>
              </>
            )}
          </div>

          <p className="mt-2 text-[length:var(--fs-small)] text-ink-soft">
            {product.stock_availability.text ||
              (product.is_in_stock ? "In stock" : "Out of stock")}
          </p>

          {product.short_description && (
            <div
              className="mt-6 max-w-[var(--measure-body)] [&_img]:hidden [&_p]:mt-2"
              dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.short_description) }}
            />
          )}

          {isVariable && variationAttributes.length > 0 && (
            <div className="mt-8 grid max-w-md gap-4">
              {variationAttributes.map((attr) => (
                <label key={attr.id} className="grid gap-1">
                  <span className="text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft">
                    {attr.name}
                  </span>
                  <select
                    disabled
                    className="min-h-[var(--tap-min)] rounded-sm border border-hairline bg-white px-3 py-2 opacity-45"
                  >
                    <option>Choose in store</option>
                    {attr.terms.map((t) => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
              ))}
              <p className="text-[length:var(--fs-small)] text-ink-soft">
                Options configurable in-store — full online configuration coming.
              </p>
            </div>
          )}

          <div className="mt-8">
            <AddToCart
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceMinorUnits: product.prices.price,
                image: product.images[0]?.src ?? "",
                imageAlt: product.images[0]?.alt || product.name,
              }}
              inStock={product.is_in_stock}
            />
          </div>

          <p className="mt-6 max-w-[var(--measure-body)] text-[length:var(--fs-small)] text-ink-soft">
            Delivered and assembled by our own crews — one contribution fee, no surprise
            charges on the day.
          </p>
        </div>
      </div>

      {product.description && (
        <section className="mt-16 border-t border-hairline pt-10">
          <SectionHeading title="About this piece" />
          <div
            className="mt-[var(--section-gap-title)] max-w-[var(--measure-body)] [&_h2]:mt-6 [&_h2]:text-[length:var(--fs-h4)] [&_h2]:font-bold [&_h2]:uppercase [&_h3]:mt-4 [&_h3]:font-bold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.description) }}
          />
        </section>
      )}

      <section className="mt-16 border-t border-hairline pt-10">
        <ul className="grid list-none grid-cols-1 gap-[var(--grid-gap)] p-0 md:grid-cols-3">
          {homepage.pillars.map((pillar) => (
            <li key={pillar.title}>
              <TrustPillar title={pillar.title} body={pillar.body} />
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && primaryCategory && (
        <section className="mt-16">
          <SectionHeading
            title={`More ${primaryCategory.name}`}
            standfirst="From the same department, in stock now."
          />
          <ul
            className="mt-[var(--section-gap-title)] grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] p-0"
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
                    onSale={p.on_sale}
                    price={rel.current}
                    oldPrice={rel.old}
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
