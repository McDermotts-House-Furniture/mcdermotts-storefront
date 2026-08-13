/* Read-only client for the public WooCommerce Store API on mcdermotts.ie.
   All page code goes through this module — no direct fetches elsewhere.
   Writes (cart, checkout) are deliberately absent: the prototype's cart is
   client-side (see CONTEXT.md decisions 1–2). */

const STORE_API_BASE = "https://mcdermotts.ie/wp-json/wc/store/v1";
const REVALIDATE_SECONDS = 3600;

export interface StoreApiPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
  price_range?: { min_amount: string; max_amount: string } | null;
}

export interface StoreApiImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface StoreApiTermRef {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface StoreApiAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface StoreApiProduct {
  id: number;
  name: string;
  slug: string;
  type: string; // "simple" | "variable" | ...
  sku: string;
  summary: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  is_in_stock: boolean;
  stock_availability: { text: string; class: string };
  average_rating: string;
  review_count: number;
  prices: StoreApiPrices;
  images: StoreApiImage[];
  categories: StoreApiTermRef[];
  brands?: StoreApiTermRef[];
  attributes: StoreApiAttribute[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
}

export interface StoreApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: StoreApiImage | null;
}

export type ProductSort = "newest" | "price-asc" | "price-desc";

export function sortToParams(sort: ProductSort): { orderby: string; order?: string } {
  switch (sort) {
    case "newest":
      return { orderby: "date" };
    case "price-asc":
      return { orderby: "price", order: "asc" };
    case "price-desc":
      return { orderby: "price", order: "desc" };
  }
}

export interface ProductsQuery {
  category?: number;
  page?: number;
  perPage?: number;
  sort?: ProductSort;
}

export function buildProductsUrl(query: ProductsQuery): string {
  const url = new URL(`${STORE_API_BASE}/products`);
  if (query.category !== undefined) url.searchParams.set("category", String(query.category));
  if (query.page !== undefined) url.searchParams.set("page", String(query.page));
  if (query.perPage !== undefined) url.searchParams.set("per_page", String(query.perPage));
  if (query.sort !== undefined) {
    const { orderby, order } = sortToParams(query.sort);
    url.searchParams.set("orderby", orderby);
    if (order) url.searchParams.set("order", order);
  }
  return url.toString();
}

/* Prices arrive as strings in minor units ("33500" + minor_unit 2 → €335.00). */
export function formatPrice(
  minorUnits: string,
  prices: Pick<
    StoreApiPrices,
    | "currency_minor_unit"
    | "currency_prefix"
    | "currency_suffix"
    | "currency_decimal_separator"
    | "currency_thousand_separator"
  >,
): string {
  const digits = prices.currency_minor_unit;
  const value = BigInt(minorUnits || "0");
  const divisor = BigInt(10 ** digits);
  const whole = (value / divisor).toString();
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, prices.currency_thousand_separator);
  const fraction =
    digits > 0
      ? prices.currency_decimal_separator +
        (value % divisor).toString().padStart(digits, "0")
      : "";
  return `${prices.currency_prefix}${grouped}${fraction}${prices.currency_suffix}`;
}

async function storeApiFetch(url: string): Promise<Response> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Store API ${res.status} for ${url}`);
  }
  return res;
}

export interface ProductsPage {
  products: StoreApiProduct[];
  total: number;
  totalPages: number;
}

export async function getProducts(query: ProductsQuery = {}): Promise<ProductsPage> {
  const res = await storeApiFetch(buildProductsUrl(query));
  const products = (await res.json()) as StoreApiProduct[];
  return {
    products,
    total: Number(res.headers.get("x-wp-total") ?? products.length),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getProductById(id: number): Promise<StoreApiProduct | null> {
  const res = await fetch(`${STORE_API_BASE}/products/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Store API ${res.status} for product ${id}`);
  return (await res.json()) as StoreApiProduct;
}

export async function getProductBySlug(slug: string): Promise<StoreApiProduct | null> {
  const url = new URL(`${STORE_API_BASE}/products`);
  url.searchParams.set("slug", slug);
  const res = await storeApiFetch(url.toString());
  const products = (await res.json()) as StoreApiProduct[];
  return products[0] ?? null;
}

export async function getCategories(): Promise<StoreApiCategory[]> {
  /* 171 categories on the live site; fetch all in one page. */
  const url = new URL(`${STORE_API_BASE}/products/categories`);
  url.searchParams.set("per_page", "100");
  const first = await storeApiFetch(url.toString());
  const totalPages = Number(first.headers.get("x-wp-totalpages") ?? 1);
  const categories = (await first.json()) as StoreApiCategory[];
  for (let page = 2; page <= totalPages; page++) {
    url.searchParams.set("page", String(page));
    const res = await storeApiFetch(url.toString());
    categories.push(...((await res.json()) as StoreApiCategory[]));
  }
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<StoreApiCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}
