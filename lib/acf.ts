/* ACF product fields via the wp/v2 REST endpoint. The theme stores dimensions
   in ACF (custom_height/width/depth) and a spec-sheet PDF — none of which the
   Store API carries. The endpoint's `acf` array is EMPTY until the field group
   is set to "Show in REST API" in WP admin (ACF → Field Groups → Settings);
   this module returns null until then and the PDP simply omits the section. */

import type { DimensionItem } from "@/components/commerce/DimensionSet";

const WP_API_BASE = "https://mcdermotts.ie/wp-json/wp/v2";
const REVALIDATE_SECONDS = 3600;

export interface AcfProductFields {
  dimensions: DimensionItem[];
  specSheetUrl?: string;
}

/* ACF text values arrive as the theme prints them ("82", "82cm", "82 cm").
   Numeric values get the cm unit; anything else renders verbatim. */
export function normalizeDimension(label: string, raw: unknown): DimensionItem | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const value = String(raw).trim();
  if (!value) return null;
  const numeric = value.match(/^(\d+(?:\.\d+)?)\s*cm$/i)?.[1] ?? value;
  if (/^\d+(\.\d+)?$/.test(numeric)) {
    return { label, value: numeric, unit: "cm" };
  }
  return { label, value };
}

export async function getAcfProductFields(slug: string): Promise<AcfProductFields | null> {
  try {
    const url = new URL(`${WP_API_BASE}/product`);
    url.searchParams.set("slug", slug);
    url.searchParams.set("_fields", "acf,slug");
    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const posts = (await res.json()) as { acf?: Record<string, unknown> | unknown[] }[];
    const acf = posts[0]?.acf;
    /* Not exposed yet (empty array) or no fields set. */
    if (!acf || Array.isArray(acf)) return null;

    const dimensions = [
      normalizeDimension("Height", acf.custom_height),
      normalizeDimension("Width", acf.custom_width),
      normalizeDimension("Depth", acf.custom_depth),
    ].filter((d): d is DimensionItem => d !== null);

    const specSheetUrl =
      typeof acf.spec_sheet === "string" && acf.spec_sheet.startsWith("http")
        ? acf.spec_sheet
        : undefined;

    if (dimensions.length === 0 && !specSheetUrl) return null;
    return { dimensions, specSheetUrl };
  } catch {
    return null;
  }
}
