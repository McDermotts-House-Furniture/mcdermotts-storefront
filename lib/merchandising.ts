/* Tag-driven merchandising, ported from the Flatsome theme's

   short-description template (supplied by Conor, 2026-08-13). The WHEN comes
   from that PHP verbatim — same tag slugs, same rule order, messages stack the
   same way; the HOW is the design system's DeliveryNotice / RangeLink.
   Copy normalised to sentence case (components uppercase their own labels);
   the theme's red "discontinued" styling maps to the gold attention tone —
   this palette has no red. */

import { decodeEntities } from "./html";

import type { DeliveryTone } from "@/components/commerce/DeliveryNotice";
import type { StoreApiProduct } from "@/lib/store-api";

export interface DeliveryMessage {
  tone: DeliveryTone;
  title: string;
  body?: string;
  action?: string;
  actionHref?: string;
}

export interface RangeLinkTarget {
  name: string;
  href: string;
}

const PHONE = { action: "094 90 22500", actionHref: "tel:0949022500" };
const NON_STOCK = "This is a non-stock order.";

interface DeliveryRule extends DeliveryMessage {
  tags: string[];
}

/* Same order as the theme template — stacked output preserves it. */
const DELIVERY_RULES: DeliveryRule[] = [
  {
    tags: ["richmond-interiors", "all-xooon", "xooon-diningchairs", "fresno-by-xooon", "halmstad-by-xooon", "xooon-darwin", "xooon-denmark", "xooon-faneur", "xooon-tables"],
    tone: "lead", title: "Estimated delivery — 5 weeks", body: NON_STOCK,
  },
  { tags: ["harrison", "ma-moran"], tone: "lead", title: "Estimated delivery — 8 weeks", body: NON_STOCK },
  { tags: ["furmanac-bedframes"], tone: "lead", title: "Estimated delivery — 8 weeks", body: NON_STOCK },
  { tags: ["bontempi-tables", "whitemeadow-bedframes"], tone: "lead", title: "Estimated delivery — 10-12 weeks", body: NON_STOCK },
  { tags: ["in-stock"], tone: "stock", title: "In-stock delivery — 0-3 weeks, depending on location" },
  {
    tags: ["ortho-support-1200"],
    tone: "stock", title: "In-stock delivery — 0-3 weeks, depending on location",
    body: "Single, king and superking in stock. Other sizes 6-7 weeks delivery.",
  },
  { tags: ["venjakob-tables"], tone: "lead", title: "Extended delivery — minimum 12 weeks", body: NON_STOCK },
  { tags: ["van-gogh"], tone: "lead", title: "Typical delivery — 8-10 weeks", body: NON_STOCK },
  { tags: ["catalan"], tone: "lead", title: "Typical delivery — 10-12 weeks", body: NON_STOCK },
  { tags: ["cuddlemuffin"], tone: "lead", title: "Typical delivery — 8-10 weeks", body: NON_STOCK },
  { tags: ["whitemeadow-furniture", "orla-kiely"], tone: "lead", title: "Typical delivery — 12 weeks", body: NON_STOCK },
  { tags: ["baker-chairs"], tone: "lead", title: "Typical delivery — 4 weeks", body: NON_STOCK },
  { tags: ["2-3-weeks"], tone: "lead", title: "Typical delivery — 2-3 weeks", body: NON_STOCK },
  { tags: ["2-4-weeks"], tone: "lead", title: "Typical delivery — 2-4 weeks", body: NON_STOCK },
  { tags: ["14-16-weeks"], tone: "lead", title: "Typical delivery — 14-16 weeks", body: NON_STOCK },
  { tags: ["3-4-weeks"], tone: "lead", title: "Typical delivery — 3-4 weeks", body: NON_STOCK },
  { tags: ["4-5-weeks"], tone: "lead", title: "Estimated delivery — 4-5 weeks", body: NON_STOCK },
  { tags: ["4-6-weeks"], tone: "lead", title: "Estimated delivery — 4-6 weeks", body: NON_STOCK },
  { tags: ["5-6-weeks"], tone: "lead", title: "Estimated delivery — 5-6 weeks", body: NON_STOCK },
  { tags: ["6-7-weeks"], tone: "lead", title: "Estimated delivery — 6-7 weeks", body: NON_STOCK },
  { tags: ["7-8-weeks"], tone: "lead", title: "Estimated delivery — 7-8 weeks", body: NON_STOCK },
  { tags: ["8-10-weeks"], tone: "lead", title: "Estimated delivery — 8-10 weeks", body: NON_STOCK },
  { tags: ["10-12-weeks"], tone: "lead", title: "Estimated delivery — 10-12 weeks", body: NON_STOCK },
  { tags: ["12-14-weeks"], tone: "lead", title: "Estimated delivery — 12-14 weeks", body: NON_STOCK },
  { tags: ["extended-delivery-early-2025"], tone: "lead", title: "Extended delivery — early 2025" },
  {
    tags: ["fama-query"],
    tone: "attention", title: "Pricing",
    body: "Fama is a highly bespoke product — contact us for pricing.",
    ...PHONE,
  },
  { tags: ["9-11-weeks"], tone: "lead", title: "Estimated delivery — 9-11 weeks", body: NON_STOCK },
  { tags: ["11-13-weeks"], tone: "lead", title: "Estimated delivery — 11-13 weeks", body: NON_STOCK },
  {
    tags: ["pre-christmas-delivery"],
    tone: "lead", title: "Pre-Christmas delivery",
    body: "Order now for the best chance of arrival before Christmas, depending on distance from our warehouse.",
  },
  { tags: ["april-delivery"], tone: "lead", title: "Estimated delivery — mid to late April", body: NON_STOCK },
  { tags: ["july-delivery"], tone: "lead", title: "Estimated delivery — July", body: NON_STOCK },
  {
    tags: ["cracking-brand-clearance"],
    tone: "stock", title: "In stock — showroom clearance promotion",
    body: "We're making way for an exciting new studio coming in early 2026.",
  },
  { tags: ["13-15-weeks"], tone: "lead", title: "Estimated delivery — 13-15 weeks", body: NON_STOCK },
  { tags: ["15-17-weeks"], tone: "lead", title: "Estimated delivery — 15-17 weeks", body: NON_STOCK },
  { tags: ["16-18-weeks"], tone: "lead", title: "Estimated delivery — 16-18 weeks", body: NON_STOCK },
  { tags: ["richmond-accessories", "coco-maison"], tone: "lead", title: "Estimated delivery — 4-5 weeks" },
  { tags: ["outlet-garden"], tone: "attention", title: "This is a demo model" },
  {
    tags: ["extended-delivery-please-enquire"],
    tone: "attention", title: "Extended delivery",
    body: "Please call us for more information.",
    ...PHONE,
  },
  { tags: ["outlet"], tone: "stock", title: "In stock — 0-3 weeks delivery", body: "This is an outlet product." },
  {
    tags: ["discontinued"],
    tone: "attention", title: "Discontinued range",
    body: "Limited stocks remaining as of 30/06/2026.",
  },
  { tags: ["garden-2025"], tone: "stock", title: "In stock — 0-3 weeks delivery", body: "Nationwide delivery available." },
];

interface RangeRule {
  /** Product tag slug that triggers the link ("category:" prefix = product category, like the theme's ironville rule). */
  term: string;
  name: string;
  /** Internal /category/... route, or the live-site URL where only a tag page exists. */
  href: string;
}

const external = (tagSlug: string) => `https://mcdermotts.ie/product-tag/${tagSlug}/`;

const RANGE_RULES: RangeRule[] = [
  { term: "elgin", name: "Elgin Bedroom", href: "/category/elgin-bedroom" },
  { term: "elgin-dining", name: "Elgin Dining", href: "/category/elgin" },
  { term: "dutch-revival-bedroom", name: "Dutch Revival Bedroom", href: "/category/dutch-revival-bedroom" },
  { term: "dutch-revival-dining", name: "Dutch Revival Living & Dining", href: "/category/dutch-revival" },
  { term: "julie-white", name: "Julie White", href: "/category/julie-white" },
  { term: "lombardi", name: "Lombardi", href: "/category/lombardi" },
  { term: "louis-xvi", name: "Louis XVI", href: "/category/louis-xvi" },
  { term: "louvre", name: "Louvre", href: "/category/louvre" },
  { term: "camille", name: "Camille by Willis & Gambier", href: "/category/camille-willis-and-gambier" },
  { term: "antoinette", name: "Antoinette by Willis & Gambier", href: "/category/antoinette-by-willis-gambier" },
  { term: "holly", name: "Holly", href: "/category/holly" },
  { term: "kingston", name: "Kingston", href: "/category/kingston-bedroom-range" },
  { term: "amelie-by-willis-gambier", name: "Amelie by Willis & Gambier", href: "/category/amelie-by-willis-gambier" },
  { term: "casera-by-willis-gambier", name: "Casera by Willis & Gambier", href: "/category/casera-by-willis-gambier" },
  { term: "etienne-by-willis-gambier", name: "Etienne by Willis & Gambier", href: "/category/etienne-by-willis-gambier" },
  { term: "ivory-by-willis-gambier", name: "Ivory by Willis & Gambier", href: "/category/ivory-by-willis-gambier" },
  { term: "toulon-by-willis-gambier", name: "Toulon by Willis & Gambier", href: "/category/toulon-by-willis-gambier" },
  { term: "trenton-by-xooon", name: "Trenton by XOOON", href: "/category/trenton-by-xooon" },
  { term: "lara-by-gplan", name: "Lara by G Plan", href: external("lara-by-gplan") },
  { term: "hampshire-by-gplan", name: "Hampshire by G Plan", href: "/category/hampshire-by-gplan" },
  { term: "hampshire-bedroom-by-gplan", name: "Hampshire Bedroom by G Plan", href: external("hampshire-bedroom-by-gplan") },
  { term: "luxor-by-richmond-interiors", name: "Luxor by Richmond Interiors", href: external("luxor-by-richmond-interiors") },
  { term: "category:ironville", name: "Ironville by Richmond Interiors", href: "/category/ironville" },
  { term: "twickenham-white", name: "Twickenham White", href: "/category/twickenham-white" },
  { term: "reno-bedroom-range", name: "Reno Bedroom", href: "/category/reno-bedroom-range" },
  { term: "wren-dining-range", name: "Wren Dining Range", href: "/category/wren-dining-range" },
  { term: "sloane-range", name: "Sloane Living & Dining Range", href: external("sloane-range") },
];

export function deliveryNoticesFor(product: StoreApiProduct): DeliveryMessage[] {
  const tagSlugs = new Set((product.tags ?? []).map((t) => t.slug));
  const matched = DELIVERY_RULES.filter((rule) => rule.tags.some((t) => tagSlugs.has(t))).map(
    (rule): DeliveryMessage => ({
      tone: rule.tone,
      title: rule.title,
      body: rule.body,
      action: rule.action,
      actionHref: rule.actionHref,
    }),
  );
  if (matched.length > 0) return matched;

  /* No merchandising tag — fall back to what the Store API knows. */
  if (!product.is_in_stock) {
    return [
      {
        tone: "attention",
        title: "Out of stock",
        body: "Ring us — more may be on the way, or on the floor in a showroom.",
        ...PHONE,
      },
    ];
  }
  if (product.stock_availability.class === "available-on-backorder") {
    return [
      {
        tone: "attention",
        title: "Extended delivery",
        body: "This piece comes in on a longer lead time. Call us and we'll give you a firm date before you order.",
        ...PHONE,
      },
    ];
  }
  return [{ tone: "stock", title: product.stock_availability.text || "In stock" }];
}

export function rangeLinksFor(product: StoreApiProduct): RangeLinkTarget[] {
  const tagSlugs = new Set((product.tags ?? []).map((t) => t.slug));
  const categorySlugs = new Set(product.categories.map((c) => c.slug));

  const matched = RANGE_RULES.filter((rule) =>
    rule.term.startsWith("category:")
      ? categorySlugs.has(rule.term.slice("category:".length))
      : tagSlugs.has(rule.term),
  ).map(({ name, href }) => ({ name, href }));
  if (matched.length > 0) return matched;

  /* Fallback: a category named like a range ("Trenton by XOOON") links out. */
  const rangeCategory = product.categories.find((c) => / by /i.test(decodeEntities(c.name)));
  if (rangeCategory) {
    return [{ name: decodeEntities(rangeCategory.name), href: `/category/${rangeCategory.slug}` }];
  }
  return [];
}
