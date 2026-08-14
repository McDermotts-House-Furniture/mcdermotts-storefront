/* Marketing landing pages (sofa ranges, mattress lines) — the prototype's
   stand-in for a CMS. The block union below is deliberately the content model
   a Sanity schema would use one-to-one: marketing composes pages from these
   blocks, the template renders them with DS components, and product data stays
   in WooCommerce (referenced by search/category, never duplicated).

   Copy is verbatim from the live pages (2026-08-14) — including the "Larsson"
   slip in the Henrik intro, which is theirs to fix. Imagery is placeholder
   from the live media library. */

import { homepage } from "@/lib/homepage-data";

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
}

const LANDING_PAGES: LandingPage[] = [
  {
    slug: "henrik-sofa-range",
    eyebrow: "Introducing…",
    title: "Henrik",
    standfirst: "Sink-in comfort, built to last",
    heroImage: homepage.img.sofas,
    heroAlt: "Henrik sofa range in a McDermott's showroom setting",
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
];

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getLandingSlugs(): string[] {
  return LANDING_PAGES.map((p) => p.slug);
}
