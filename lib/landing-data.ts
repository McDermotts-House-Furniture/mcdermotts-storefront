/* Marketing landing pages (sofa ranges, mattress lines) — the prototype's
   stand-in for a CMS. The block union below is deliberately the content model
   a Sanity schema would use one-to-one: marketing composes pages from these
   blocks, the template renders them with DS components, and product data stays
   in WooCommerce (referenced by search/category, never duplicated).

   Copy is either verbatim from the live pages or given directly by Declan —
   see each entry's own comment for which, and its date. */

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
          query finds no products (showroom-only ranges). CMS-authored pages
          pick products by id (ACF relationship); `search` is the fallback. */
      type: "products";
      title: string;
      standfirst?: string;
      ids?: number[];
      search?: string;
    }
  | {
      /** For ranges not sold online — the showroom is the product. */
      type: "showroom";
      title: string;
      body: string;
    }
  | {
      /** Photo grid — styled shots beyond the hero/config photos, mixing
          room/lifestyle and detail shots per the spec's range-page brief
          (10-20 images typical). */
      type: "gallery";
      title?: string;
      images: { src: string; alt: string }[];
    }
  | {
      /** Embedded showroom video (YouTube) — footage of the actual floor
          model, for the ranges Declan has it for (2026-08-27: "some of my
          sofa ranges I have videos uploaded to youtube of the sofa on
          display in my showroom"). Optional per range; most won't have one.
          youtubeId is just the id (the "v=" query param, or the last path
          segment of a youtu.be link) — not the full URL, so the template
          controls the embed domain and player params in one place rather
          than trusting whatever URL shape gets pasted in here. */
      type: "video";
      title?: string;
      youtubeId: string;
      caption?: string;
    }
  | {
      type: "callCta";
      title: string;
      body?: string;
    }
  | {
      /** A real "request a quote" form, not just a phone-call prompt — for
          ranges where that's worth the extra weight over callCta. Message
          field pre-fills referencing the range by name. */
      type: "quoteForm";
      title: string;
      standfirst?: string;
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
      tag costs a click, a false one costs a showroom visit and trust.
      Optional (2026-08-27 merge with the WordPress CMS branch) only because
      a WP-authored page has no ACF field for it yet — every entry in
      LANDING_PAGES below still sets it. Untagged/undefined both mean the
      same thing everywhere this is read: excluded from every tag-driven
      collection, same as a range explicitly tagged with nothing. */
  tags?: string[];
  /** Optional for the same reason as tags — no ACF field yet on the WP
      side. Undefined is NOT the same as "not on display": per the hard
      rule this project has followed all along, showroom status is never
      inferred, so a page with no data here is treated as live/unpublished-
      gate-exempt (see isRangeLive) rather than guessed at either way; it
      just doesn't get a status line or a real value in the enquiry form
      until someone sets it. */
  showroomStatus?: ShowroomAvailability;
  /** Configuration-specific photography for the collection-page image
      fallback (spec §6): when a collection page filters by a type tag
      (corner, chaise…) and a photo of the range in that exact configuration
      exists, show it. Falls back to heroImage + a text note otherwise. Keyed
      by tag slug, e.g. configPhotos.corner. */
  configPhotos?: Record<string, { src: string; alt: string }>;
  /** Downloadable dimensions/configurations PDF, same idea as the product
      page's ACF specSheetUrl. Rendered as a button near Key Features, where
      a range's own copy typically references it. */
  specSheetUrl?: string;
}

/** The publishing rule: a range is live only while at least one showroom can
    still show it or has one arriving. Both "not-on-display" means nobody can
    say when, or whether, it's coming back — the range comes off the site,
    not just off the grid.

    No showroomStatus at all (a WP-authored page with no ACF field for it
    yet, 2026-08-27) is NOT the same as both-not-on-display: this rule only
    ever applies to a status that's actually been set, one way or the
    other. A page with none is exempt from this specific gate, not silently
    unpublished by it — same "never inferred" principle, applied to the
    absence of data instead of a guess at its value. */
export function isRangeLive(page: LandingPage): boolean {
  if (!page.showroomStatus) return true;
  const { castlebar, ennis } = page.showroomStatus;
  return castlebar !== "not-on-display" || ennis !== "not-on-display";
}

/** For collection pages scoped to one showroom (2026-08-27: "only includes
    sofas that are on display in ennis") — "on-display" specifically, not
    "coming-soon"; a page about what's actually on the floor right now, not
    what's arriving. No showroom filter (undefined) always matches. */
export function matchesShowroom(page: LandingPage, showroom: "castlebar" | "ennis" | undefined): boolean {
  return !showroom || page.showroomStatus?.[showroom] === "on-display";
}

const LANDING_PAGES: LandingPage[] = [
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
    /* Copy and pricing verbatim from the live page (fetched 2026-08-25,
       corrected 2026-08-26 — the editorial/features/specs text below had
       actually been paraphrased, not copied, the first time round; Declan
       asked for the real wording and this is now it), reordered to lead
       with the editorial story rather than the products — the live page
       puts pricing right under the fold, which the spec is explicit range
       pages shouldn't do. Showroom status confirmed directly by Declan (not
       scraped, unlike everything else here): on display in Castlebar, not
       in Ennis. */
    slug: "mack-sofa-range",
    eyebrow: "Introducing…",
    title: "Mack",
    standfirst: "Timeless elegance, exceptional comfort — our best-selling sofa of 2024 & 2025.",
    /* Real Mack photography (Declan, 2026-08-25) — not the homepage.img.sofas
       placeholder (that was a Fama Selene photo, wrongly labelled). Hero is
       the range's own banner image, not a per-fabric product-variation shot. */
    heroImage: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Sofa-Range-at-McDermotts-Furniture.jpg",
    heroAlt: "Mack sofa range at McDermott's Furniture",
    /* Real spec sheet from the live page's "View Full Specifications" link
       (fetched 2026-08-26), verified 200/application-pdf before use. */
    specSheetUrl:
      "https://mcdermotts.ie/wp-content/uploads/2025/10/Mack-Specifications-Sheet-at-McDermotts-Furniture-Castlebar-compressed-1-1.pdf",
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
        /* Verbatim from the live page (fetched 2026-08-26), not paraphrased
           — Declan asked for the real copy, not our own rewrite of it. Only
           the em dash swapped in for the source's plain hyphen, matching
           this codebase's own typographic convention elsewhere. */
        type: "editorial",
        paragraphs: [
          "The Mack sofa is where luxurious style meets irresistible comfort. Our best-selling sofa of 2024 & 2025, this exquisite piece is a real show-stopper. It's easy to see why once you try it for yourself — unparalleled relaxation backed by a 25-year frame guarantee.",
        ],
      },
      {
        /* Real showroom footage, Declan 2026-08-27 — the floor model in
           Castlebar, not stock/marketing video. First range on the site to
           have one. Moved above "A closer look" same day, per Declan. */
        type: "video",
        title: "See it in the showroom",
        youtubeId: "_kxXDN28idc",
      },
      {
        /* Real gallery, Declan 2026-08-25 — live media library, not Store
           API product-variation images (same distinction as configPhotos).
           Title was "In the showroom" — these are studio shots, not
           showroom photography, so that claim wasn't accurate (Declan).
           Moved to directly after the editorial intro, 2026-08-26. */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-16.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-2.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-7.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-8.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-12.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-4-1000x1000.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-3.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-8.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-11.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-5.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-7.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-6.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-2.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-10.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-1.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Mack-Corner-Sofa-in-Bellaria-Pearl-at-McDermotts-Furniture-Castlebar-9.webp",
            alt: "Mack corner sofa in Bellaria Pearl at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Mack-Sofa-Range-at-McDermotts-Furniture-Castlebar-Hansson-Sofa-Range-1.webp",
            alt: "Mack sofa range in a McDermott's Furniture Castlebar showroom setting",
          },
        ],
      },
      {
        /* Rewritten by Declan, 2026-08-26, tightened further same day —
           plainer, shorter versions of the same three points. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "Hundreds of fabrics to choose from. Visit our Castlebar showroom to see the full range in person and feel them for yourself.",
          },
          {
            title: "Size options",
            body: "From a 2 seater to a full corner group, the Mack comes in a size to suit the room. The specifications sheet has every dimension and configuration.",
          },
          {
            title: "Legs",
            body: "Brushed chrome, or solid wood in Light or Smoke.",
          },
        ],
      },
      {
        /* "Detail" → "Closer detail" (Declan, 2026-08-26), then tightened
           further same day — plainer, shorter versions of the same four
           points. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Craftsmanship",
            value: "A frame of hardwood rails and high-density particle board, backed by a 25-year frame guarantee.",
          },
          {
            label: "Seating comfort",
            value: "Fully reversible foam seat cushions with a fibre wrap, over high-gauge serpentine springs.",
          },
          {
            label: "Back support",
            value: "Hollow pocketed fibre back cushions on elasticated tensioned webbing.",
          },
          {
            label: "Scatter cushions",
            value: "Feather-filled scatters and bolsters.",
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
        /* Real quote-request form, not the plain phone-only callCta
           (Declan, 2026-08-26) — "a contact us box that looks like it's
           meant to be part of this webpage." */
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy and pricing verbatim from the live page (fetched 2026-08-26).
       Tags given directly by Declan (2026-08-26), not scraped — the live
       page's own copy doesn't spell out configurations by seat count, so
       there's no source text to check them against; same trust basis as
       Mack's tag corrections. Showroom status confirmed directly by Declan:
       on display in both Castlebar and Ennis. */
    slug: "stax-sofa-by-alexander-and-james",
    eyebrow: "Introducing…",
    title: "Stax",
    standfirst: "A Contemporary Chesterfield Redefined",
    /* Real Stax photography, from the live product gallery (Declan,
       2026-08-26: "use images from the linked products on that page") — the
       Oasis Sage lead shot doubles as the range's own banner image on the
       live page, same as it does here. 1000x1000, confirmed. */
    heroImage: "https://mcdermotts.ie/wp-content/uploads/2024/09/Stax-Sofa-by-Alexander-and-James-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar.webp",
    heroAlt: "Stax sofa by Alexander and James in Oasis Sage at McDermott's Furniture Castlebar",
    /* Real spec sheet from the live page's "View Full Specifications" link
       (fetched 2026-08-26), verified 200/application-pdf before use. */
    specSheetUrl:
      "https://mcdermotts.ie/wp-content/uploads/2025/01/Stax-Sofa-Range-by-Alexander-and-James-at-McDermotts-Furniture-Castlebar.pdf",
    tags: ["leather", "fabric", "4-seater", "3-seater", "2-seater", "snuggler", "alexander-and-james"],
    showroomStatus: { castlebar: "on-display", ennis: "on-display" },
    blocks: [
      {
        /* Rewritten by Declan, 2026-08-26 — replaces the verbatim live-page
           copy above with his own shorter version. */
        type: "editorial",
        paragraphs: [
          "With a deep seat platform that curves over the front edge into tufted detailing, thick scroll arms with studded accents, and low, rounded wooden feet, the Stax takes the Chesterfield and softens it. Generous proportions, and a much easier sit than the shape suggests.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-26 — live product photography across
           both current colourways (Oasis Sage, Tote Tiramisu) and the
           footstool, not Store API thumbnails duplicated from the hero. */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar-5.png",
            alt: "Stax Maxi sofa in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar-7.png",
            alt: "Stax Maxi sofa in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar-3.png",
            alt: "Stax Maxi sofa in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar-4.png",
            alt: "Stax Maxi sofa in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Midi-Sofa-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar-4.png",
            alt: "Stax Midi sofa in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Stax-Footstool-by-Alexander-and-James-in-Oasis-Sage-at-McDermotts-Furniture-Castlebar.webp",
            alt: "Stax footstool by Alexander and James in Oasis Sage at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-by-Alexander-and-James-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar_11zon.webp",
            alt: "Stax Maxi sofa by Alexander and James in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-5.png",
            alt: "Stax Maxi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-7.png",
            alt: "Stax Maxi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-8.png",
            alt: "Stax Maxi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Maxi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-9.png",
            alt: "Stax Maxi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Midi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-5.png",
            alt: "Stax Midi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Midi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-3.png",
            alt: "Stax Midi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Midi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-4.png",
            alt: "Stax Midi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/06/Stax-Midi-Sofa-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar-1.png",
            alt: "Stax Midi sofa in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/09/Stax-Footstool-by-Alexander-and-James-in-Tote-Tiramisu-at-McDermotts-Furniture-Castlebar.webp",
            alt: "Stax footstool by Alexander and James in Tote Tiramisu at McDermott's Furniture Castlebar",
          },
        ],
      },
      {
        /* Rewritten by Declan, 2026-08-26 — replaces the verbatim live-page
           copy above. Regrouped, not just reworded: Custom Finishes and
           Additional Pillows moved here from Closer Detail (the two things
           a shopper actually chooses); Frame, Suspension and Cushion Filling
           moved the other way, into Closer Detail (the two things that are
           just fixed construction). */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "A wide selection of fabrics and genuine leathers. Visit our Castlebar showroom to see them in person.",
          },
          {
            title: "Custom finishes",
            body: "Feet in Dark Wood or Weathered Oak, and studding in Antique, Chrome, Gold or Pewter.",
          },
          {
            title: "Additional pillows",
            body: "Optional extra pillows and bolsters, made up in your chosen fabric.",
          },
        ],
      },
      {
        /* Rewritten by Declan, 2026-08-26 — "Detail" → "Closer detail" kept
           from before to match this template's own heading convention (see
           Mack above); regrouping explained in the features block comment
           above. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Frame & craftsmanship",
            value: "A solid Rubberwood frame.",
          },
          {
            label: "Suspension",
            value: "Webbing under the seat, zigzag springs in the back.",
          },
          {
            label: "Cushion filling",
            value: "Foam-filled seat and back cushions.",
          },
          {
            label: "Signature Chesterfield design",
            value: "The tufting runs over the seat edge rather than stopping at it, which is what gives the Stax its finish.",
          },
          {
            label: "Scroll arms with studding",
            value: "Thick, rolled arms with studs along the edge.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "The Maxi and Midi sofas ship in Oasis Sage and Tote Tiramisu, with a matching footstool in each.",
        search: "stax",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy given directly by Declan (2026-08-27), not scraped — there's no
       live "Ivy" range page to fetch from (only individual product pages
       under /shop/), so unlike Mack and Stax this was never "verbatim from
       the live page" to begin with. Tags given directly too, after Declan
       corrected my own tag suggestion (guessed from the real product line)
       to add 4-seater and swap in aquaclean. Showroom status confirmed
       directly by Declan: on display in Castlebar, not in Ennis. */
    slug: "ivy-sofa-by-orla-kiely",
    eyebrow: "Introducing…",
    title: "Ivy",
    /* Not given verbatim — there's no source tagline to take it from, so
       this is lifted from the closing clause of Declan's own editorial
       paragraph below, not written fresh. Flagged in case a real standfirst
       is wanted instead. */
    standfirst: "A designer's eye for shape and proportion, made to actually be sat on.",
    /* Real Ivy photography from the live product galleries (Declan,
       2026-08-27: "use some images from the products attached, especially
       any with lifestyle in the image file name") — this is one of only
       three images across the whole range actually named "Lifestyle" in the
       media library. 1000x1000, confirmed. */
    heroImage: "https://mcdermotts.ie/wp-content/uploads/2024/07/Ivy-by-Orla-Kiely-Lifestyle-Images-1.webp",
    heroAlt: "Ivy sofa by Orla Kiely, lifestyle photography, at McDermott's Furniture Castlebar",
    tags: ["corner", "4-seater", "3-seater", "2-seater", "snuggler", "chair", "fabric", "aquaclean", "orla-kiely"],
    showroomStatus: { castlebar: "on-display", ennis: "not-on-display" },
    blocks: [
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "editorial",
        paragraphs: [
          "Clean lines, circular forms and precision-piped seams. The square-quilted seat and back pads are a direct nod to 1960s upholstery, and they're what give the Ivy its character — a designer's eye for shape and proportion, made to actually be sat on.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-27 — capped at 20 images total
           (including the hero) across both instructions in the same
           message: prioritise anything named "Lifestyle", and don't pull in
           the full product-photography library ("there's literally 1000s")
           until specific images are chosen. The other two Lifestyle shots
           lead; the rest spans every configuration (corner, 2 seater, 3
           seater/large, medium, snuggler, armchair) and colourway actually
           photographed, not just one. */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Ivy-by-Orla-Kiely-Lifestyle-Images-2.webp",
            alt: "Ivy sofa by Orla Kiely, lifestyle photography, at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Ivy-by-Orla-Kiely-Lifestyle-Images-3.webp",
            alt: "Ivy sofa by Orla Kiely, lifestyle photography, at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Ivy-Corner-Sofa-Right-Hand-Facing-in-Derry-Orange-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-with-2-Orla-Kiely-Scatter-cushions-16-1.jpeg",
            alt: "Ivy corner sofa, right-hand facing, in Derry Orange by Orla Kiely at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Ivy-Corner-Sofa-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-Choose-a-fabric-leg-and-scatter-cushions-by-Orla-Kiely-2.webp",
            alt: "Ivy corner sofa by Orla Kiely at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Ivy-Corner-Sofa-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-Choose-a-fabric-leg-and-scatter-cushions-by-Orla-Kiely-7.webp",
            alt: "Ivy corner sofa by Orla Kiely at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Ivy-Small-Sofa-by-Orla-Kiely-in-Derry-Orange-at-McDermotts-Furniture-Castlebar-with-2-Custom-Orla-Kiely-Scatter-Cushions-5.webp",
            alt: "Ivy small (2 seater) sofa by Orla Kiely in Derry Orange at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Sofa-Range-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-Orla-Kiely-Furniture-5.webp",
            alt: "Ivy sofa range by Orla Kiely at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Sofa-Range-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-Orla-Kiely-Furniture-3.webp",
            alt: "Ivy sofa range by Orla Kiely at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Orange-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Orange at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Bandon-Forest-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Bandon Forest at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Caramel-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Caramel at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Dark-Jewel-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Dark Jewel at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Dark-Moss-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Dark Moss at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Indigo-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Indigo at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/12/Ivy-Large-Sofa-by-Orla-Kiely-in-Derry-Sunflower-at-McDermotts-Furniture-Castlebar-Ireland.webp",
            alt: "Ivy large (3 seater) sofa by Orla Kiely in Derry Sunflower at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Ivy-Medium-Sofa-in-Derry-Orange-by-Orla-Kiely-at-McDermotts-Furniture-Castlebar-with-Custom-Orla-Kiely-Scatter-Cushions-11.webp",
            alt: "Ivy medium sofa by Orla Kiely in Derry Orange at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/01/Orla-Kiely-Ivy-Snuggler-in-Derry-Orange-fabric-with-Weathered-Oak-feet-and-custom-Orla-Kiely-Scatter-Choice-5.webp",
            alt: "Ivy snuggler by Orla Kiely in Derry Orange at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Ivy-Armchair-by-Orla-Kiely-in-Derry-Orange-at-McDermotts-Furniture-Castlebar.webp",
            alt: "Ivy armchair by Orla Kiely in Derry Orange at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2020/09/Orla-Kiely-Scatter-Cushions-at-McDermotts-Furniture.webp",
            alt: "Orla Kiely scatter cushions at McDermott's Furniture",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "Bright velvets and richly textured fabrics, chosen to do justice to the shape. Visit our Castlebar showroom to see the full range in person.",
          },
          {
            title: "Design details",
            body: "Clean lines and circular forms, with precision piping following every seam. Considered from every angle rather than just the front.",
          },
          {
            title: "Scatter cushions",
            body: "Coordinating or contrasting scatters, including Orla Kiely's own prints.",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Quilted pads",
            value: "Square-quilted seat and back pads, a retro reference carried out properly rather than gestured at.",
          },
          {
            label: "1960s influence",
            value: "The quilting and the rounded arms borrow from mid-century upholstery, set on a frame built for how people sit now.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "Corner, 2 seater, 3 seater, snuggler and armchair — seven pieces, in every fabric currently photographed.",
        search: "ivy",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy given directly by Declan (2026-08-27), not scraped — same basis
       as Ivy. Tags given directly too; two didn't exist in the vocabulary
       yet (swivel-chair, fibre-cushions — added to tags.ts) and "foam
       cushions" was mapped onto the existing foam-seat-cushions tag rather
       than creating a near-duplicate, the same call Declan made himself for
       cuddler/snuggler. Showroom status confirmed directly by Declan: on
       display in Castlebar, not in Ennis. */
    slug: "colo-sofa-range",
    eyebrow: "Introducing…",
    title: "Colo",
    /* Live page's own tagline (fetched 2026-08-27) — kept even though the
       editorial paragraph below is Declan's own rewrite, not the live page's;
       there's no other standfirst to use and this one still fits. */
    standfirst: "Effortless Versatility Meets Unmatched Comfort",
    /* Real Colo photography — the only product listing for this range on
       the live site is the Colo Corner Sofa (variable product, different
       fabric colourways), so unlike Stax/Ivy there's no "lifestyle"-named
       shot to lead with; these are its own 5 real images (Declan,
       2026-08-27: "grab some lifestyle images from the products linked at
       the bottom" — this is what was actually linked). 1000x1000, confirmed. */
    heroImage:
      "https://mcdermotts.ie/wp-content/uploads/2024/11/Colo-Sofa-Range-Corner-Sofas-at-McDermotts-Furniture-Castlebar-Ireland-2.webp",
    heroAlt: "Colo corner sofa range at McDermott's Furniture Castlebar",
    /* No specSheetUrl: the live page's "View Full Specifications" link is a
       PNG (Colo-Spec.png), not the PDF this field and its button copy
       ("See the specifications sheet (PDF)") assume elsewhere on the site —
       verified 200/image-png, not skipped for lack of trying, just left out
       rather than mislabelled. */
    tags: [
      "corner",
      "3-seater",
      "2-seater",
      "snuggler",
      "swivel-chair",
      "footstool",
      "fibre-cushions",
      "foam-seat-cushions",
      "chaise",
    ],
    showroomStatus: { castlebar: "on-display", ennis: "not-on-display" },
    blocks: [
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "editorial",
        paragraphs: [
          "The Colo is modular, so it builds around the room rather than the other way round. Deep, slouchy and feather-filled to sit in. Works as a compact two seater or a full corner group, and it's the sit rather than the shape that people come back for.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-27 — the Colo Corner Sofa's own
           product photography (see heroImage note above). */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Colo-Sofa-Range-at-McDermotts-Furniture-Castlebar-5.webp",
            alt: "Colo sofa range at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Colo-Sofa-Range-at-McDermotts-Furniture-Castlebar-11.webp",
            alt: "Colo sofa range at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Colo-Sofa-Range-at-McDermotts-Furniture-Castlebar-14.webp",
            alt: "Colo sofa range at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Colo-Sofa-Range-at-McDermotts-Furniture-Castlebar-10.webp",
            alt: "Colo sofa range at McDermott's Furniture Castlebar",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabric options",
            body: "Hundreds of fabrics to choose from. Visit our Castlebar showroom to see them in person.",
          },
          {
            title: "Modular design",
            body: "Configurations to suit any room size and layout.",
          },
          {
            title: "Deep comfort",
            body: "A slouchy, relaxed sit rather than an upright one.",
          },
          {
            title: "Feet",
            body: "Weathered Oak, Walnut or Chrome.",
          },
          {
            title: "Scatter cushions",
            body: "Optional scatter package of large, medium and small scatters, plus a bolster.",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Frame",
            value: "Seasoned hardwood, sustainably sourced.",
          },
          {
            label: "Seat and back",
            value: "Feather and fibre-filled seat cushions, with foam options available. Fibre-filled back cushions.",
          },
          {
            label: "Suspension",
            value: "Spring unit under the Combi-Unit seat, with Superloop springs and elastic webbing in the arms.",
          },
          {
            label: "Swivel base",
            value: "Hidden swivel base on the three Cuddler sizes.",
          },
        ],
      },
      {
        /* "colo corner", not "colo" — a plain "colo" search on the Store
           API also matches the unrelated Colorado Dining Table (Declan,
           2026-08-27's product link is only the corner sofa; verified this
           narrower term returns just that one). */
        type: "products",
        title: "Buy online",
        standfirst: "The corner sofa ships in seven fabrics; other sizes and the swivel chair are showroom configurations.",
        search: "colo corner",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy given directly by Declan (2026-08-27), not scraped — the live
       page's own copy has a couple of typos ("Expertly Handcrafted fro",
       "WExplore") this version doesn't. Tags given directly too, with three
       decisions worth flagging: "cuddler" mapped onto the existing snuggler
       tag rather than a new one (the same consolidation Declan made himself
       for Mack — keeping both would be the exact near-duplicate drift the
       vocabulary exists to avoid); "electric recliner" mapped onto BOTH
       recliner (type: it's sold as a recliner) and power-recline (feature:
       specifically the powered kind, not a manual pull-lever one) rather
       than a new combined tag; and calia-italia added as a new brand tag
       after Declan confirmed it should be here (his own list omitted a
       brand tag, unlike every other range so far). leather added
       2026-08-27, after the fact — the original list omitted both leather
       and fabric despite the copy describing both. Fabric is still absent,
       so "Fabric or leather?" on the enquiry form still doesn't appear:
       materialOptionsFor needs two present materials to show a real choice,
       and there's only one here now. Showroom status confirmed directly by
       Declan: on display in Castlebar, not in Ennis. */
    slug: "xavier-by-calia-italia",
    eyebrow: "Introducing…",
    title: "Xavier",
    /* Live page's own tagline (fetched 2026-08-27) — kept even though the
       editorial paragraph below is Declan's own rewrite, not the live
       page's; there's no other standfirst to use and this one still fits. */
    standfirst: "Italian Elegance Meets Luxurious Comfort",
    /* Real Xavier photography — the only product listing for this range on
       the live site is the Xavier Large Sofa (3 seater); the armchair,
       corner and recliner configurations are showroom-only, same situation
       as Colo. 1000x1000, confirmed. */
    heroImage:
      "https://mcdermotts.ie/wp-content/uploads/2024/07/Xavier-Cabrini-Sofa-by-Calia-Italia-at-McDermotts-Furniture-Castlebar-2.webp",
    heroAlt: "Xavier sofa by Calia Italia at McDermott's Furniture Castlebar",
    /* Real spec sheet from the live page's "View Full Specifications" link
       (fetched 2026-08-27), verified 200/application-pdf before use. */
    specSheetUrl: "https://mcdermotts.ie/wp-content/uploads/2026/02/Xavier-Specifications-Sheet-at-McDermotts-Furniture-Castlebar.pdf",
    tags: [
      "chair",
      "snuggler",
      "2-seater",
      "2-5-seater",
      "3-seater",
      "footstool",
      "corner",
      "recliner",
      "power-recline",
      "leather",
      "calia-italia",
    ],
    showroomStatus: { castlebar: "on-display", ennis: "not-on-display" },
    blocks: [
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "editorial",
        paragraphs: [
          "Handmade in Italy, in leather or fabric. The Xavier's high back is the point of it — proper support behind the shoulders rather than the low-slung sit most modern sofas give you, and there's a powered recliner version if you want it.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-27 — the Xavier Large Sofa's own
           product photography (see heroImage note above). */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Xavier-Cabrini-Sofa-by-Calia-Italia-at-McDermotts-Furniture-Castlebar-3.webp",
            alt: "Xavier sofa by Calia Italia at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2024/07/Xavier-Cabrini-Sofa-by-Calia-Italia-at-McDermotts-Furniture-Castlebar-1.webp",
            alt: "Xavier sofa by Calia Italia at McDermott's Furniture Castlebar",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Italian leather",
            body: "Handcrafted Italian leather, chosen for how it wears as much as how it feels.",
          },
          {
            title: "Fabric & leather options",
            body: "A wide selection of genuine Italian leathers and premium fabrics, available to see in our Castlebar showroom. Give us a call if you'd like more information before you visit.",
          },
          {
            title: "Size options",
            body: "From an armchair up to a 3 seater, with a corner group also available.",
          },
          {
            title: "Recliner option",
            body: "An electrically powered recliner version, operated by a discreet button panel on the arm side of the seat cushion.",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Frame construction",
            value: "Beechwood, pinewood, multilayer and plywood, covered with polyurethane foam.",
          },
          {
            label: "Padding",
            value: "Ecological polyurethane foam with synthetic fibrefill through the seats and backs.",
          },
          {
            label: "Scatter cushions",
            value: "A choice of finishes including coal black and antique bronze, with more in our sample book.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "The 3 seater ships online; armchair, corner and the powered recliner are showroom configurations.",
        search: "xavier",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy given directly by Declan (2026-08-27), not scraped — the live
       page's own "Environmental Responsibility" paragraph wrongly credits
       Fama for this XOOON range, a real error on the live site this
       version doesn't carry over. Tags and showroom status both given
       directly too (neither was in the original message this time, asked
       for both): "electric recliner" mapped onto both recliner (type) and
       power-recline (feature), same pairing as Xavier; xooon added as a
       new brand tag. Showroom status confirmed directly by Declan: on
       display in both Castlebar and Ennis. */
    slug: "carini-sofa-by-xooon",
    eyebrow: "Introducing…",
    title: "Carini by XOOON",
    /* Live page's own tagline (fetched 2026-08-27) — kept even though the
       editorial paragraph below is Declan's own rewrite, not the live
       page's; there's no other standfirst to use and this one still fits. */
    standfirst: "Modern Relaxation with Intelligent Comfort",
    /* Real Carini photography — the only product listing for this range on
       the live site is the Carini Corner Chaise Sofa; straight and ottoman
       configurations are showroom-only, same situation as Colo and Xavier
       (Declan, 2026-08-27: "take product images from the product linked").
       1000x1000, confirmed. */
    heroImage:
      "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-2.jpg",
    heroAlt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
    /* Real spec sheet from the live page's "View Full Specifications" link
       (fetched 2026-08-27), verified 200/application-pdf before use — the
       file itself is misspelled ("Rnage") on the live site; the URL still
       works, so used as-is rather than guessed at a corrected one. */
    specSheetUrl: "https://mcdermotts.ie/wp-content/uploads/2025/12/Carini-Sofa-Rnage-by-XOOON-at-McDermotts-Furniture.pdf",
    tags: ["2-5-seater", "3-seater", "chair", "corner", "chaise", "fabric", "recliner", "power-recline", "xooon"],
    showroomStatus: { castlebar: "on-display", ennis: "on-display" },
    blocks: [
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "editorial",
        paragraphs: [
          "Softly rounded shapes with an electric reclining option, and a wall-away mechanism so the back stays put when it reclines. That last part matters more than it sounds — it means the sofa can go against the wall rather than needing clearance behind it.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-27 — the Carini Corner Chaise Sofa's
           own product photography (see heroImage note above). */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-8.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-3.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-6.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-5.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-7.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-9.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-10.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-1.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2026/01/Carini-Sofa-Range-by-XOOON-at-McDermotts-Furniture-Ennis-Castlebar-4.jpg",
            alt: "Carini corner chaise sofa by XOOON at McDermott's Furniture",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Upholstery choices",
            body: "A curated selection of fabrics from the Selected Choices collection. Note that most fabrics carry an extended delivery time, so get in touch for current lead times before you order.",
          },
          {
            title: "Electric recliner option",
            body: "Available with an electric reclining system that adjusts both headrest and footrest.",
          },
          {
            title: "Wall-away design",
            body: "The back stays stationary as it reclines, so the sofa can sit against the wall without leaving space behind it.",
          },
          {
            title: "Configuration & sizes",
            body: "Straight sofas, corner combinations, ottomans and chaise options. The specifications sheet has every size and layout.",
          },
          {
            title: "Charging ports",
            body: "Integrated USB-A and USB-C ports on selected models.",
          },
          {
            title: "Feet",
            body: "Discreet black metal feet, with hidden support legs.",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Frame & construction",
            value: "Beechwood, pinewood and MDF.",
          },
          {
            label: "Seating",
            value: "Bonnell spring core with cold foam upholstery, giving a firm sit built for long-term use.",
          },
          {
            label: "Back & headrests",
            value: "Fixed back cushions on Nosag suspension, with manually adjustable headrests on selected configurations.",
          },
        ],
      },
      {
        type: "products",
        title: "Buy online",
        standfirst: "The corner chaise ships online; straight and ottoman configurations are showroom pieces.",
        search: "carini",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
      },
    ],
  },
  {
    /* Copy given directly by Declan (2026-08-27), not scraped — the live
       page's own "Environmental Responsibility" line was cut here (Declan's
       version doesn't have it, unlike Carini's, so it's left out rather
       than added back in). Tags given directly too: "cuddler" mapped onto
       the existing snuggler tag (same consolidation as Mack/Carini) and
       "electric recliner" onto both recliner (type) and power-recline
       (feature), same pairing used for Xavier and Carini. Showroom status
       confirmed directly by Declan: on display in both Castlebar and
       Ennis. */
    slug: "axel-by-fama",
    eyebrow: "Introducing…",
    title: "Axel by Fama",
    /* Live page's own tagline (fetched 2026-08-27) — kept even though the
       editorial paragraph below is Declan's own rewrite, not the live
       page's; there's no other standfirst to use and this one still fits. */
    standfirst: "Refined Comfort, Reimagined",
    /* Real Axel photography — this range has no Store API product listing
       at all (search returns zero results; there's no "Buy Online" section
       on the live page either), so unlike every other range added this
       session there was no linked product to pull images from. These are
       the live page's own gallery photos instead (Declan, 2026-08-27).
       900x900, confirmed. */
    heroImage:
      "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-1.webp",
    heroAlt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
    /* Real spec sheet from the live page's "View Full Specifications" link
       (fetched 2026-08-27), verified 200/application-pdf before use. */
    specSheetUrl:
      "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-by-Fama-Specification-Sheet-at-McDermotts-Furniture-Castlebar.pdf",
    tags: [
      "fama",
      "fabric",
      "chair",
      "snuggler",
      "2-seater",
      "2-5-seater",
      "3-seater",
      "4-seater",
      "corner",
      "chaise",
      "recliner",
      "power-recline",
      "footstool",
    ],
    showroomStatus: { castlebar: "on-display", ennis: "on-display" },
    blocks: [
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "editorial",
        paragraphs: [
          "Axel came out of customer feedback on Fama's Avalon — same sit, same base, without the quilting. Cleaner lines, power reclining, and a modular build with eight armrest styles and three leg options.",
        ],
      },
      {
        /* Real gallery, Declan 2026-08-27 — the live page's own
           photography (see heroImage note above: no linked product exists
           for this range, so these came from the range page itself rather
           than a product listing). */
        type: "gallery",
        title: "A closer look",
        images: [
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-2.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-3.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-4.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-5.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-6.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-7.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-8.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-9.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-10.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-11.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-12.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-13.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-14.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-15.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
          {
            src: "https://mcdermotts.ie/wp-content/uploads/2025/07/Axel-Sofa-Range-by-Fama-Sofas-at-McDermotts-Furniture-Castlebar-Official-Supplier-16.webp",
            alt: "Axel sofa range by Fama at McDermott's Furniture Castlebar",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "features",
        title: "Key features",
        items: [
          {
            title: "Fabrics & design",
            body: "Hundreds of fabrics, including plains and patterns, cotton and linen, velvets, and leather in a wide range of colours. Eight armrest styles and three leg styles to choose from.",
          },
          {
            title: "Power reclining",
            body: "Motorised reclining modules.",
          },
          {
            title: "Built on the Avalon base",
            body: "The same sit as the Avalon, without the quilted finish.",
          },
          {
            title: "Removable covers",
            body: "All seat, back and loose cushion covers come off for cleaning.",
          },
        ],
      },
      {
        /* Verbatim, Declan 2026-08-27. */
        type: "specs",
        title: "Closer detail",
        items: [
          {
            label: "Frame",
            value: "Metal structure on a pinewood and MDF base.",
          },
          {
            label: "Seat & cushions",
            value: "A medium sit, from layered 35kg polyurethane foam with soft polyester fibre.",
          },
          {
            label: "Back & scatter cushions",
            value: "Filled with 100% Fibersilk.",
          },
        ],
      },
      {
        /* No products block — Axel has no Store API listing and no "Buy
           Online" section on the live page at all, unlike every other range
           this session (Declan, 2026-08-27: showroom-only, same idea as
           Henrik originally). */
        type: "showroom",
        title: "See it in the showroom",
        body: "The Axel sells from the showroom, not the website — armrest, leg and fabric choices are made in person. Sit on it, run through the options, and we'll take it from there.",
      },
      {
        type: "quoteForm",
        title: "Request a quote",
        standfirst: "Tell us what you're after and we'll come back to you — or ring Castlebar direct.",
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
    collection page runs. Empty `tagSlugs` matches every TAGGED live range —
    the "browse everything" hub, not literally every range on the whole
    site. A range with zero tags (Xtra Life Plus: "Mattress, not sofa — no
    sofa-section tags apply") was showing up inside the sofa hub's "Full
    Collection" precisely because an empty AND-query is vacuously true even
    against an empty tags array (Declan, 2026-08-26). There's no real
    department/category field yet to scope "sofas only" properly — this is
    the minimal fix for the sofa hub specifically, not that bigger build;
    mattresses get their own real handling later. Undefined tags (a WP page
    with no ACF field for it yet, 2026-08-27) reads exactly the same as an
    empty array here — excluded either way. */
export function getRangesByTags(tagSlugs: string[]): LandingPage[] {
  return getLiveRanges().filter((page) => {
    const tags = page.tags ?? [];
    return tags.length > 0 && tagSlugs.every((t) => tags.includes(t));
  });
}
