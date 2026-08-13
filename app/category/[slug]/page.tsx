import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Pagination } from "@/components/category/Pagination";
import { SortSelect } from "@/components/category/SortSelect";
import { SectionHeading } from "@/components/core/SectionHeading";
import {
  formatPrice,
  getCategoryBySlug,
  getProducts,
  type ProductSort,
  type StoreApiProduct,
} from "@/lib/store-api";

const PER_PAGE = 24;

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

function parseSort(raw: string | undefined): ProductSort {
  return raw === "price-asc" || raw === "price-desc" ? raw : "newest";
}

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

  const { products, total, totalPages } = await getProducts({
    category: category.id,
    page,
    perPage: PER_PAGE,
    sort,
  });

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

      {products.length === 0 ? (
        <div className="mt-[var(--section-gap-title)] rounded-md border border-hairline bg-white p-12 text-center">
          <p className="font-bold uppercase tracking-heading">Nothing here right now</p>
          <p className="mt-2 text-ink-soft">
            Stock moves quickly — try another department, or visit us in Castlebar or Ennis.
          </p>
        </div>
      ) : (
        <ul
          className="mt-[var(--section-gap-title)] grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] p-0"
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
                onSale={product.on_sale}
                eager={i < 4 && page === 1}
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
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
