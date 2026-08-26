/* Collection pages — tag-driven listings per the sofa-section spec
   (2026-08-25, saved in Claude memory as sofa-section-spec). Each one is
   "a saved question asked of [range] tags": nothing here is hand-picked, so
   nothing goes stale when a range is added, retagged, or taken off display.
   Slugs match the /collection/[slug] links wired up in lib/nav.ts's sofa
   mega menu. */

export interface CollectionDef {
  slug: string;
  eyebrow: string;
  title: string;
  standfirst: string;
  /** Tags a range must carry ALL of to appear here. Empty = every live range (the hub). */
  tags: string[];
}

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "full-collection",
    eyebrow: "Sofas & Chairs",
    title: "Full Collection",
    standfirst: "Every sofa range we carry, in one place — on the floor in Castlebar, in Ennis, or both.",
    tags: [],
  },
  {
    slug: "corner-sofa-collection",
    eyebrow: "Collection",
    title: "Corner Sofa Collection",
    standfirst: "Ranges available as a corner — built to fit the shape of the room you actually have.",
    tags: ["corner"],
  },
  {
    slug: "leather-collection",
    eyebrow: "Collection",
    title: "Leather Collection",
    standfirst: "Ranges available in leather. Most of our leather ranges also come in fabric — ask in-store if you're weighing up both.",
    tags: ["leather"],
  },
  {
    slug: "recliner-collection",
    eyebrow: "Collection",
    title: "Recliner Collection",
    standfirst: "Ranges available with reclining seats — from a single recliner chair to a fully reclining corner group.",
    tags: ["recliner"],
  },
  {
    slug: "lift-and-tilt-chairs",
    eyebrow: "Collection",
    title: "Lift & Tilt Chairs",
    standfirst: "Chairs that help you stand — built for independence at home, not for a hospital ward. Ring us about delivery timescales; we know they matter here more than anywhere else.",
    tags: ["lift-and-tilt"],
  },
  {
    slug: "sofa-bed-collection",
    eyebrow: "Collection",
    title: "Sofa Bed Collection",
    standfirst: "Ranges that convert to a bed — for a spare room, a small home, or a house that hosts at Christmas.",
    tags: ["sofa-bed"],
  },
  {
    slug: "fama",
    eyebrow: "Sofa Brand",
    title: "Fama",
    standfirst: "Ireland's only dedicated Fama showrooms — Castlebar and Ennis, and nowhere else in the country.",
    tags: ["fama"],
  },
  {
    slug: "parker-knoll",
    eyebrow: "Sofa Brand",
    title: "Parker Knoll",
    standfirst: "British-made comfort with a design pedigree going back to the 1930s.",
    tags: ["parker-knoll"],
  },
  {
    slug: "orla-kiely",
    eyebrow: "Sofa Brand",
    title: "Orla Kiely",
    standfirst: "Distinctive print and colour, built on the same frames and craftsmanship as the rest of our range.",
    tags: ["orla-kiely"],
  },
  {
    slug: "alexander-and-james",
    eyebrow: "Sofa Brand",
    title: "Alexander & James",
    standfirst: "Leather-led, character-driven sofas — softens and marks with age, by design.",
    tags: ["alexander-and-james"],
  },
  {
    slug: "stressless",
    eyebrow: "Sofa Brand",
    title: "Stressless®",
    standfirst: "The original recliner, direct from Norway — Plus System comfort that moves with you.",
    tags: ["stressless"],
  },
  {
    slug: "aquaclean",
    eyebrow: "Fabric Technology",
    title: "Aquaclean®",
    standfirst: "Fabric that cleans with water alone — no products, no professional cleaning. Available as one of the fabric choices across many ranges, not a range in itself.",
    tags: ["aquaclean"],
  },
  {
    slug: "la-z-boy",
    eyebrow: "Sofa Brand",
    title: "La-Z-Boy",
    standfirst: "American reclining comfort, built for the long haul.",
    tags: ["la-z-boy"],
  },
];

export function getCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
