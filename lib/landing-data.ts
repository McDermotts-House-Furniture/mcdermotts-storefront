/* Marketing landing pages (sofa ranges, mattress lines) — the prototype's
   stand-in for a CMS. The block union below is deliberately the content model
   a Sanity schema would use one-to-one: marketing composes pages from these
   blocks, the template renders them with DS components, and product data stays
   in WooCommerce (referenced by search/category, never duplicated).

   Copy is verbatim from the live pages (2026-08-14) — including the "Larsson"
   slip in the Henrik intro, which is theirs to fix. Imagery is placeholder
   from the live media library. */

import { homepage } from "@/lib/homepage-data";

/* Showroom display status — the spec's three states, tracked independently
   per showroom. "coming-soon" is a promise about the near future (floor
   model sold, replacement on the way); "not-on-display" says nothing about
   when or whether it returns. A range is live on the site only while at
   least one showroom reads "on-display" or "coming-soon" — see
   isRangeLive() below. This is a publishing rule, not a display rule. */
export type ShowroomStatus = "on-display" | "not-on-display" | "coming-soon";

export interface ShowroomAvailability {
  castlebar: ShowroomStatus;
  ennis: ShowroomStatus;
  /** Only meaningful for "coming-soon" — a known timeframe keeps the promise honest. */
  eta?: string;
}

export type LandingBlock =
  | {
      type: "features";
      title: string;
      items: { title: string; body: string }[];
    }
  | {
      type: "editorial";
      title?: string;
      paragraphs: string[];
    }
  | {
      type: "specs";
      title: string;
      items: { label: string; value: string }[];
    }
  | {
      /** Live ProductCard grid from the Store API. Renders nothing when the
          query finds no products (showroom-only ranges). */
      type: "products";
      title: string;
      standfirst?: string;
      search: string;
    }
  | {
      /** For ranges not sold online — the showroom is the product. */
      type: "showroom";
      title: string;
      body: string;
    }
  | {
      type: "callCta";
      title: string;
      body?: string;
    };

export interface LandingPage {
  slug: string;
  eyebrow: string;
  title: string;
  standfirst: string;
  heroImage: string;
  heroAlt: string;
  blocks: LandingBlock[];
  /** Tag slugs from lib/tags.ts. Means "available as", almost never "is" —
      a range tagged "corner" is a range you CAN have as a corner, not
      necessarily what the hero photo shows. Apply conservatively: a missing
      tag costs a click, a false one costs a showroom visit and trust. */
  tags: string[];
  showroomStatus: ShowroomAvailability;
  /** Configuration-specific photography for the collection-page image
      fallback (spec §6): when a collection page filters by a type tag
      (corner, chaise…) and a photo of the range in that exact configuration
      exists, show it. Falls back to heroImage + a text note otherwise. Keyed
      by tag slug, e.g. configPhotos.corner. */
  configPhotos?: Record<string, { src: string; alt: string }>;
}

/** The publishing rule: a range is live only while at least one showroom can
    still show it or has one arriving. Both "not-on-display" means nobody can
    say when, or whether, it's coming back — the range comes off the site,
    not just off the grid. */
export function isRangeLive(page: LandingPage): boolean {
  const { castlebar, ennis } = page.showroomStatus;
  return castlebar !== "not-on-display" || ennis !== "not-on-display";
}

const LANDING_PAGES: LandingPage[] = [
  {
    slug: "henrik-sofa-range",
    eyebrow: "Introducing…",
    title: "Henrik",
    standfirst: "Sink-in comfort, built to last",
    heroImage: homepage.img.sofas,
    heroAlt: "Henrik sofa range in a McDermott's showroom setting",
    /* House range — no brand tag, per the spec's rule that some ranges
       legitimately have none. Fabric only: nothing in the source copy
       mentions a leather option, so no leather tag (absence is meaningful,
       not an oversight). */
    tags: ["corner", "snuggler", "fabric"],
    /* Inferred from the existing showroom block below ("On the floor in
       Castlebar") — Ennis status isn't confirmed either way, defaulted to
       not-on-display as a placeholder pending a real answer. */
    showroomStatus: { castlebar: "on-display", ennis: "not-on-display" },
    blocks: [
      {
        type: "editorial",
        paragraphs: [
          "The Henrik is a wonderfully relaxed sofa range designed for real, everyday living. Its generously padded arms and deep, supportive cushions give it an inviting, lived-in feel from day one, while a solid hardwood frame – backed by a 25 year guarantee – means it's built to stay that way. With every option from a compact 2 seater to a full corner configuration, the Larsson suits rooms and households of every size.",
        ],
      },
      {
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "Available in a wide selection of fabrics to suit your home. Visit our Castlebar showrooms to explore the full range in person.",
          },
          {
            title: "Reversible seat cushions",
            body: "Fully reversible premium foam seat cushions with a fibre wrap, paired with hollow pocketed fibre back cushions for lasting comfort and easy care.",
          },
          {
            title: "Comprehensive collection",
            body: "Available as a 4 seater, 3 seater, 2 seater, cuddler or corner sofas – you can build the Henrik around your room, not the other way around.",
          },
          {
            title: "25 year frame guarantee",
            body: "Frames constructed from hardwood rails and high density board, with solid wood feet in a choice of Light, Dark or Smoke finishes.",
          },
        ],
      },
      {
        type: "specs",
        title: "Detail",
        items: [
          {
            label: "Seat and back",
            value:
              "Fully reversible premium foam seat cushions with fibre wrap, and hollow pocketed fibre back cushions for a plush, supportive sit.",
          },
          {
            label: "Suspension",
            value:
              "Seats sprung by high gauge serpentine springs, with backs fully supported by elasticated tensioned webbing.",
          },
          {
            label: "Scatter cushions",
            value: "Luxurious feather-filled scatter cushions and arm pads for an added layer of softness.",
          },
          {
            label: "Feet & delivery",
            value:
              "Solid wood feet in Light, Dark, or Smoke finishes, with removable arms for easy delivery – handy for tight hallways and entryways.",
          },
        ],
      },
      {
        type: "showroom",
        title: "On the floor in Castlebar",
        body: "The Henrik sells from the showroom, not the website — fabrics are chosen in person. Sit on it, argue about the corner configuration, and we'll take it from there.",
      },
      {
        type: "callCta",
        title: "Or give us a call for more information",
      },
    ],
  },
  {
    slug: "xtra-life-plus-1600-by-king-koil",
    eyebrow: "King Koil",
    title: "Xtra Life Plus 1600",
    standfirst: "Crafted for long-lasting durability, firm support, and dependable back-care comfort.",
    heroImage: homepage.img.mattresses,
    heroAlt: "King Koil mattress dressed on a divan base",
    /* Mattress, not sofa — no sofa-section tags apply. Showroom status not
       yet confirmed per-showroom (placeholder, matches this file's existing
       "imagery is placeholder" convention); defaults to on-display both so
       a real, live-selling product doesn't vanish from the site over an
       unconfirmed field. */
    tags: [],
    showroomStatus: { castlebar: "on-display", ennis: "on-display" },
    blocks: [
      {
        type: "features",
        title: "Key features",
        items: [
          {
            title: "90-night mattress trial",
            body: "This mattress is included in our 90 Nights Mattress Trial. Sleep on it for three months — if it isn't right, we'll work with you to put it right.",
          },
          {
            title: "Delivered by our own crews",
            body: "Nationwide delivery and setup by McDermott's own crews — one contribution fee, no surprise charges on the day.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "The Xtra Life family, in every size.",
        search: "xtra life",
      },
      {
        type: "callCta",
        title: "Not sure on firmness?",
        body: "Ring us — the mattress team will talk you through it, or try it in Castlebar or Ennis.",
      },
    ],
  },
  {
    /* Copy and pricing verbatim from the live page (fetched 2026-08-25),
       reordered to lead with the editorial story rather than the products —
       the live page puts pricing right under the fold, which the spec is
       explicit range pages shouldn't do. Showroom status confirmed directly
       by Declan (not scraped, unlike everything else here): on display in
       Castlebar, not in Ennis. */
    slug: "mack-sofa-range",
    eyebrow: "Introducing…",
    title: "Mack",
    standfirst: "Timeless elegance, exceptional comfort — our best-selling sofa of 2024 & 2025.",
    /* Real Mack photography (Declan, 2026-08-25) — not the homepage.img.sofas
       placeholder (that was a Fama Selene photo, wrongly labelled). Hero is
       the range's own banner image, not a per-fabric product-variation shot. */
    heroImage: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Sofa-Range-at-McDermotts-Furniture.jpg",
    heroAlt: "Mack sofa range at McDermott's Furniture",
    /* Tags corrected by Declan, 2026-08-25: scatter-back removed (Mack's
       scatter cushions are loose accessories, not a scatter-back
       construction — not the same claim); configurations/features below are
       what Mack is actually sold as, not scraped from the live page. */
    tags: [
      "corner",
      "chaise",
      "fabric",
      "3-seater",
      "2-5-seater",
      "2-seater",
      "snuggler",
      "chair",
      "accent-chair",
      "footstool",
      "foam-seat-cushions",
    ],
    showroomStatus: { castlebar: "on-display", ennis: "not-on-display" },
    /* Range-gallery photography from the live Mack page's own media
       (2025/01 uploads), not Store API product-variation images (those were
       lhf-bellaria-azure / -duck-egg, the specific per-fabric SKU thumbnails
       — swapped out per Declan, 2026-08-25). */
    configPhotos: {
      corner: {
        src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-3.webp",
        alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
      },
      chaise: {
        src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Mack-Chaise-Manhattan-Conifer-Left-Hand-Facing-McDermotts-Furniture-Castlebar_11zon.webp",
        alt: "Mack chaise sofa, left-hand facing, in Manhattan Conifer at McDermott's Furniture Castlebar",
      },
    },
    blocks: [
      {
        type: "editorial",
        paragraphs: [
          "Mack is relaxed without being loose — generous proportions, a deep seat and a frame built to earn its 25-year guarantee. It's been the range our own customers keep coming back to, two years running.",
          "Hardwood rails and high-density board give it real weight underfoot; feather-filled scatter cushions and bolsters soften the sit without losing shape over time.",
        ],
      },
      {
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "A wide range of fabrics, including Bellaria and Manhattan. Visit our Castlebar showroom to see and feel the full range in person.",
          },
          {
            title: "Size configurations",
            body: "2 seater, 2.5 seater, chaise and corner — a full specifications sheet is available for exact measurements.",
          },
          {
            title: "25 year frame guarantee",
            body: "Hardwood rails and high-density board construction, built to stay the shape it arrived in.",
          },
        ],
      },
      {
        type: "specs",
        title: "Detail",
        items: [
          {
            label: "Legs",
            value: "Brushed chrome, or solid wood in Light or Smoke finishes.",
          },
          {
            label: "Seat and back",
            value:
              "Fully reversible premium foam seat cushions with fibre wrap, and hollow pocketed fibre back cushions for a plush, supportive sit.",
          },
          {
            label: "Suspension",
            value:
              "Seats sprung by high gauge serpentine springs, with backs fully supported by elasticated tensioned webbing.",
          },
          {
            label: "Scatter cushions",
            value: "Feather-filled scatter cushions and bolsters for an added layer of softness.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "The 2 seater and 2.5 seater ship in a stocked fabric selection; corner and chaise are made to order.",
        search: "mack",
      },
      {
        type: "callCta",
        title: "Have a question?",
        body: "Ring Castlebar to sit on it, or ask about a fabric that isn't shown online yet.",
      },
    ],
  },
];

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getLandingSlugs(): string[] {
  return LANDING_PAGES.map((p) => p.slug);
}

/** Every range currently allowed to be on the site — see isRangeLive(). This
    is what collection pages query against, so a range dropping to
    not-on-display in both showrooms disappears from every collection
    automatically, with nothing to manually update. */
export function getLiveRanges(): LandingPage[] {
  return LANDING_PAGES.filter(isRangeLive);
}

/** Live ranges carrying every one of `tagSlugs` (AND, not OR) — the query a
    collection page runs. Empty `tagSlugs` matches every live range (the hub). */
export function getRangesByTags(tagSlugs: string[]): LandingPage[] {
  return getLiveRanges().filter((page) => tagSlugs.every((t) => page.tags.includes(t)));
}
