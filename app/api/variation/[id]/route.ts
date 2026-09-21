import { NextResponse } from "next/server";
import { formatPrice, getProductById, type StoreApiPrices } from "@/lib/store-api";
import { describeStock, getStockInfo } from "@/lib/wc-admin";

/* One variation, trimmed for the product page. The upstream fetch is ISR-cached
   (1h), so repeated selections of the same combination cost nothing — this is
   what keeps 240-variation Orla Kiely sofas cheap: the client resolves the
   variation id locally and asks for exactly one. */

export interface VariationPayload {
  id: number;
  priceMinorUnits: string;
  price: string;
  oldPrice: string | null;
  onSale: boolean;
  inStock: boolean;
  stockText: string;
  /** False when `stockText` is just the generic non-stock line rather than
      a real, tracked reading — the product page skips showing this text a
      second time when the delivery-notice stack already says the same
      thing (Declan, 2026-09-06). */
  managed: boolean;
  image: { src: string; alt: string; thumb: string } | null;
  /** The raw formatting rules behind `price` above — lets the client derive
      a DELTA between two variations' `priceMinorUnits` (the picker popup's
      "+€xx" step-2/3 pricing, Declan 2026-09-05: "show the additional cost,
      not the new total cost") using the exact same `formatPrice` the server
      used for `price` itself, rather than re-deriving or hardcoding EUR
      formatting on the client. */
  currency: Pick<
    StoreApiPrices,
    | "currency_minor_unit"
    | "currency_decimal_separator"
    | "currency_thousand_separator"
    | "currency_prefix"
    | "currency_suffix"
  >;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const product = await getProductById(Number(id));
  if (!product || product.type !== "variation") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { prices } = product;
  const onSale = product.on_sale && prices.regular_price !== prices.price;
  const image = product.images[0];
  /* The Store API's own is_in_stock/stock_availability can't tell "genuinely
     tracked and in stock" apart from "stock never tracked at all" — both
     read as a plain "in stock" with no text (Declan, 2026-09-06). The
     authenticated wc/v3 lookup is nested under the PARENT product for a
     variation, hence `product.parent` here rather than `product.id` twice. */
  const stock = describeStock(await getStockInfo(product.parent, product.id));
  const payload: VariationPayload = {
    id: product.id,
    priceMinorUnits: prices.price,
    price: formatPrice(prices.price, prices),
    oldPrice: onSale ? formatPrice(prices.regular_price, prices) : null,
    onSale,
    inStock: stock.inStock,
    stockText: stock.text,
    managed: stock.managed,
    image: image ? { src: image.src, alt: image.alt, thumb: image.thumbnail } : null,
    currency: {
      currency_minor_unit: prices.currency_minor_unit,
      currency_decimal_separator: prices.currency_decimal_separator,
      currency_thousand_separator: prices.currency_thousand_separator,
      currency_prefix: prices.currency_prefix,
      currency_suffix: prices.currency_suffix,
    },
  };

  return NextResponse.json(payload, {
    headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
