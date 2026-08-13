/* Authenticated wc/v3 reads (read-only key from env, server only). The Store
   API deliberately omits some catalogue admin data — currently we need it for
   variable products' default_attributes, which Woo uses to preselect the
   product form. Returns null without env keys or on any failure. */

import type { Selection } from "@/lib/variations";

const WC_API_BASE = "https://mcdermotts.ie/wp-json/wc/v3";
const REVALIDATE_SECONDS = 3600;

export async function getDefaultAttributes(productId: number): Promise<Selection | null> {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) return null;

  try {
    const url = new URL(`${WC_API_BASE}/products/${productId}`);
    url.searchParams.set("_fields", "default_attributes");
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      default_attributes?: { name: string; option: string }[];
    };
    if (!data.default_attributes?.length) return null;
    return Object.fromEntries(data.default_attributes.map((a) => [a.name, a.option]));
  } catch {
    return null;
  }
}
