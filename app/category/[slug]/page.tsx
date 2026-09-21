import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Pagination } from "@/components/category/Pagination";
import { SortSelect } from "@/components/category/SortSelect";
import { SubcategoryNav } from "@/components/category/SubcategoryNav";
import { SectionHeading } from "@/components/core/SectionHeading";
import { optionsNoteFor } from "@/lib/merchandising";
import {
  formatPrice,
  getCategories,
  getCategoryBySlug,
  getChildCategories,
  getProducts,
  isPermanentlyLow,
  type ProductSort,
  type StoreApiProduct,
} from "@/lib/store-api";

const PER_PAGE = 24;

/* The parent department pages that get a subcategory strip (Declan,
   2026-08-27: "all sofas, mattresses, bedroom furniture, living room,
   dining room, and accessories") — deliberately not every category page,
   and a different set from generateStaticParams' pre-render list below
   (that one includes garden-furniture and latest-arrivals; this one
   doesn't, and adds all-accessories, which isn't pre-rendered at all). */
const SUBCATEGORY_PARENT_SLUGS = new Set([
  "all-sofas",
  "all-mattresses",
  "bedroom-furniture",
  "living-room-furniture",
  "dining-room-furniture",
  "all-accessories",
]);

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

/* Pre-render the six department categories plus Latest Arrivals; the remaining
   164 categories render on demand and are then cached by ISR. */
export function generateStaticParams() {
  return [
    "all-sofas",
    "all-mattresses",
    "bedroom-furniture",
    "dining-room-furniture",
    "living-room-furniture",
    "garden-furniture",
    "latest-arrivals",
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Shop ${category.name} at McDermott's — delivered and assembled nationwide by our own crews.`,
  };
}

/* Default is "popularity" (Declan, 2026-08-27) — his own manually-set menu
   order, not "newest". Anything else not recognised also falls back to it,
   same as the old "newest" fallback did. */
function parseSort(raw: string | undefined): ProductSort {
  if (raw === "popularity" || raw === "newest" || raw === "price-asc" || raw === "price-desc") return raw;
  return "popularity";
}

/* The struck-through old price is on_sale-driven — you can't strike
   through a discount that doesn't exist in the data. isPermanentlyLow
   (passed as `onSale` on the ProductCard call below) only ever narrows
   this further, excluding a permanently-low product from sale styling
   even when it happens to carry one; ProductCard itself now also requires
   this `oldPrice` to actually be set before it'll show red or a Sale
   badge at all (Declan, 2026-09-06: "it is only ever a sale price if
   there is a higher price, and a lower price... when there is only one
   price just keep it black") — isPermanentlyLow alone is no longer
   enough. */
function cardPrices(product: StoreApiProduct): { price: string; oldPrice?: string } {
  const { prices } = product;
  if (product.on_sale && prices.regular_price !== prices.price) {
    return {
      price: formatPrice(prices.price, prices),
      oldPrice: formatPrice(prices.regular_price, prices),
    };
  }
  return { price: formatPrice(prices.price, prices) };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const sort = parseSort(sp.sort);
  const page = Math.max(1, Number(sp.page) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const showSubcategories = SUBCATEGORY_PARENT_SLUGS.has(slug);
  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({ category: category.id, page, perPage: PER_PAGE, sort }),
    showSubcategories ? getCategories() : Promise.resolve([]),
  ]);
  const subcategories = showSubcategories ? getChildCategories(categories, category.id) : [];

  return (
    <main
      /* --container-wide, matching the sofa collection pages (Declan,
         2026-08-27: "same sizing of images, as well as being 3 columns
         wide, as the sofa collection pages") — grid-cols-3 alone isn't
         enough for the cards to actually come out the same size; they also
         need the same container width to divide up. */
      className="mx-auto w-full max-w-[var(--container-wide)]"
      /* Top halved (Declan, 2026-08-27: "reduce the gap between the bottom
         of the header, and the breadcrumbs") — the previous attempt at this
         (halving SiteHeader's own bottom padding) barely moved the visible
         gap, since almost all of it is this page's own top padding, not the
         header's. Bottom and the sides keep --section-pad-y-tight/
         --section-pad-x as before. */
      style={{
        paddingTop: "calc(var(--section-pad-y-tight) / 2)",
        paddingBottom: "var(--section-pad-y-tight)",
        paddingLeft: "var(--section-pad-x)",
        paddingRight: "var(--section-pad-x)",
      }}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft"
      >
        <Link href="/" className="text-inherit no-underline hover:underline">
          Home
        </Link>
        <span aria-hidden> · </span>
        <span aria-current="page">{category.name}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          level="h1"
          title={category.name}
          standfirst={`${total} ${total === 1 ? "piece" : "pieces"}`}
        />
        <SortSelect current={sort} />
      </div>

      <SubcategoryNav
        items={subcategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }))}
      />

      {products.length === 0 ? (
        <div className="mt-[var(--section-gap-title)] rounded-md border border-hairline bg-white p-12 text-center">
          <p className="font-bold uppercase tracking-heading">Nothing here right now</p>
          <p className="mt-2 text-ink-soft">
            Stock moves quickly — try another department, or visit us in Castlebar or Ennis.
          </p>
        </div>
      ) : (
        <ul
          /* Same fluid-then-3-columns shape as the sofa collection pages
             (Declan, 2026-08-27) — grid-cols-2 stays as the mobile base
             (unchanged, wasn't asked for); sm:/lg: now match collection
             pages exactly (220px minmax, pinned to 3 at lg) rather than
             this page's own previous 240px/no-pin rule. */
          className="mt-[var(--section-gap-title)] grid list-none grid-cols-2 p-0 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:grid-cols-3"
          style={{ gap: "var(--grid-gap)" }}
        >
          {products.map((product, i) => (
            <li key={product.id}>
              <ProductCard
                brand={product.brands?.[0]?.name}
                title={product.name}
                href={`/product/${product.slug}`}
                image={product.images[0]?.src}
                alt={product.images[0]?.alt || product.name}
                onSale={!isPermanentlyLow(product)}
                eager={i < 3 && page === 1}
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                optionsNote={optionsNoteFor(product)}
                {...cardPrices(product)}
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        basePath={`/category/${slug}`}
        page={page}
        totalPages={totalPages}
        sort={sort}
      />
    </main>
  );
}
