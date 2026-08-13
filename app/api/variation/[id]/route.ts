import { NextResponse } from "next/server";
import { formatPrice, getProductById } from "@/lib/store-api";

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
  image: { src: string; alt: string; thumb: string } | null;
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
  const payload: VariationPayload = {
    id: product.id,
    priceMinorUnits: prices.price,
    price: formatPrice(prices.price, prices),
    oldPrice: onSale ? formatPrice(prices.regular_price, prices) : null,
    onSale,
    inStock: product.is_in_stock,
    stockText:
      product.stock_availability.text || (product.is_in_stock ? "In stock" : "Out of stock"),
    image: image ? { src: image.src, alt: image.alt, thumb: image.thumbnail } : null,
  };

  return NextResponse.json(payload, {
    headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
