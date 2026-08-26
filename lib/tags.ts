/* Controlled tag vocabulary for the sofa section (spec: sofa-section-spec,
   2026-08-25). A range's tags mean "available as", almost never "is" — see
   lib/landing-data.ts. Fixed list on purpose: open/free-text tagging drifts
   into near-duplicates within months, and collection pages quietly
   under-return with no visible error. Add new tags here, deliberately,
   never inline at the point of use. */

export type TagKind = "type" | "material" | "feature" | "brand";

export interface TagDef {
  slug: string;
  label: string;
  kind: TagKind;
}

export const TAGS: TagDef[] = [
  /* Type — what shape it is. */
  { slug: "2-seater", label: "2 Seater", kind: "type" },
  { slug: "2-5-seater", label: "2.5 Seater", kind: "type" },
  { slug: "3-seater", label: "3 Seater", kind: "type" },
  { slug: "4-seater", label: "4 Seater", kind: "type" },
  { slug: "corner", label: "Corner", kind: "type" },
  { slug: "modular", label: "Modular", kind: "type" },
  { slug: "recliner", label: "Recliner", kind: "type" },
  { slug: "sofa-bed", label: "Sofa Bed", kind: "type" },
  { slug: "lift-and-tilt", label: "Lift & Tilt", kind: "type" },
  /* Chair, narrower than a snuggler/cuddler (Declan, 2026-08-25). */
  { slug: "chair", label: "Chair", kind: "type" },
  { slug: "accent-chair", label: "Accent Chair", kind: "type" },
  /* "Cuddler" and "snuggler" are the same thing — a wider chair, not really
     built for two, think 1.5 seater — so one tag, not two (Declan corrected
     this 2026-08-25; keeping both would have been exactly the near-duplicate
     drift the vocabulary is meant to avoid). Label carries both search terms. */
  { slug: "snuggler", label: "Cuddler / Snuggler", kind: "type" },
  { slug: "chaise", label: "Chaise", kind: "type" },
  { slug: "footstool", label: "Footstool", kind: "type" },
  { slug: "swivel-chair", label: "Swivel Chair", kind: "type" },

  /* Material. */
  { slug: "fabric", label: "Fabric", kind: "material" },
  { slug: "leather", label: "Leather", kind: "material" },
  { slug: "aquaclean", label: "Aquaclean", kind: "material" },

  /* Feature — what a customer actually shops on. Trade terms and their
     plain-language equivalents deliberately sit side by side; both should
     resolve to the same ranges rather than competing near-empty pages. */
  { slug: "foam-seat-cushions", label: "Foam Seat Cushions", kind: "feature" },
  { slug: "fibre-cushions", label: "Fibre Cushions", kind: "feature" },
  { slug: "high-back", label: "High Back", kind: "feature" },
  { slug: "deep-seat", label: "Deep Seat", kind: "feature" },
  { slug: "firm-seat", label: "Firm Seat", kind: "feature" },
  { slug: "power-recline", label: "Power Recline", kind: "feature" },
  { slug: "small-room", label: "Suits a Small Room", kind: "feature" },
  { slug: "stain-resistant", label: "Stain Resistant", kind: "feature" },
  { slug: "pet-friendly", label: "Pet Friendly", kind: "feature" },
  { slug: "removable-covers", label: "Removable Covers", kind: "feature" },
  { slug: "helps-you-stand-up", label: "Helps You Stand Up", kind: "feature" },
  { slug: "for-guests", label: "For Guests", kind: "feature" },

  /* Brand. Some ranges carry no brand tag — house ranges. */
  { slug: "fama", label: "Fama", kind: "brand" },
  { slug: "parker-knoll", label: "Parker Knoll", kind: "brand" },
  { slug: "orla-kiely", label: "Orla Kiely", kind: "brand" },
  { slug: "alexander-and-james", label: "Alexander & James", kind: "brand" },
  { slug: "stressless", label: "Stressless", kind: "brand" },
  { slug: "la-z-boy", label: "La-Z-Boy", kind: "brand" },
  { slug: "calia-italia", label: "Calia Italia", kind: "brand" },
  { slug: "xooon", label: "XOOON", kind: "brand" },
];

const bySlug = new Map(TAGS.map((t) => [t.slug, t]));

export function getTag(slug: string): TagDef | undefined {
  return bySlug.get(slug);
}

export function tagLabel(slug: string): string {
  return bySlug.get(slug)?.label ?? slug;
}
