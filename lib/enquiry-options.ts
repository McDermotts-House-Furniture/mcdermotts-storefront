/* Vocabulary for the range-page quote-request form (spec: "Range Page Quote
   Form", Declan, 2026-08-26; main-piece/alongside split, 2026-08-27). The
   option lists are fixed — same wording on every range page — but which of
   them actually show is filtered per range, against its own tags. */

/** "What's the main piece?" + "Anything alongside it?" — two questions
    replacing one "What are you looking for?" list (Declan, 2026-08-27).
    Listing every realistic main-piece-plus-extra combination runs to about
    33 options — a wall of tick boxes people abandon. This shape generates
    all of them from 15 options across two questions, and makes the nonsense
    combinations (two 4 seaters, two 3s and a 2) unreachable without needing
    a rule to block them. Both lists are filtered by the range's own type
    tags, same principle as before: offering "Corner group" on a range that
    doesn't come as a corner is the false-positive-tagging problem the tag
    vocabulary's conservatism rule exists to prevent, just surfaced through
    the enquiry form instead of a collection page. */

export const NOT_SURE_MAIN_PIECE = "Not sure yet, I'd like some advice";
export const CHAIR_OR_RECLINER_MAIN_PIECE = "Chair or recliner";

const MAIN_PIECE_OPTIONS: { label: string; requires: string[] | null }[] = [
  { label: "2 seater", requires: ["2-seater"] },
  { label: "3 seater", requires: ["3-seater"] },
  { label: "4 seater", requires: ["4-seater"] },
  { label: "Corner group", requires: ["corner"] },
  { label: "Chaise sofa", requires: ["chaise"] },
  { label: "Snuggler or cuddler", requires: ["snuggler"] },
  { label: CHAIR_OR_RECLINER_MAIN_PIECE, requires: ["chair", "recliner"] /* either, not both — see below */ },
  { label: NOT_SURE_MAIN_PIECE, requires: null },
];

/** Live main-piece options for a specific range, filtered by its own type
    tags. "Chair or recliner" is the one entry above whose requirement list
    actually means OR (chair or recliner, not both) — handled as a special
    case rather than complicating the shape for every other row. A range
    tagged "snuggler" but not "chair" deliberately does not unlock this
    option: chair and snuggler are kept as distinct tags on purpose (see
    tags.ts), so treating them as interchangeable here would quietly undo
    that. */
export function mainPieceOptionsFor(tags: string[]): string[] {
  return MAIN_PIECE_OPTIONS.filter(({ label, requires }) => {
    if (requires === null) return true;
    if (label === CHAIR_OR_RECLINER_MAIN_PIECE) return requires.some((t) => tags.includes(t));
    return requires.every((t) => tags.includes(t));
  }).map((o) => o.label);
}

const ALONGSIDE_OPTIONS: { label: string; requires: string[] | null }[] = [
  { label: "Nothing else", requires: null },
  { label: "A 2 seater", requires: ["2-seater"] },
  { label: "A 3 seater", requires: ["3-seater"] },
  { label: "A chair", requires: ["chair"] },
  { label: "Two chairs", requires: ["chair"] },
  { label: "A snuggler", requires: ["snuggler"] },
  { label: "Not sure yet", requires: null },
];

/** Live "anything alongside it?" options for a specific range, filtered the
    same way as mainPieceOptionsFor. Whether the question should even be
    asked is a separate call — see shouldShowAlongside. */
export function alongsideOptionsFor(tags: string[]): string[] {
  return ALONGSIDE_OPTIONS.filter(
    ({ requires }) => requires === null || requires.every((t) => tags.includes(t)),
  ).map((o) => o.label);
}

/** Q2 only makes sense once there's a main piece to be "alongside", and not
    when the customer has already said the only thing they want is a single
    chair or recliner, or that they don't know yet what the main piece even
    is (Declan, 2026-08-27: hide Q2 entirely in both cases). */
export function shouldShowAlongside(mainPieces: string[]): boolean {
  if (mainPieces.length === 0) return false;
  if (mainPieces.includes(NOT_SURE_MAIN_PIECE)) return false;
  if (mainPieces.length === 1 && mainPieces[0] === CHAIR_OR_RECLINER_MAIN_PIECE) return false;
  return true;
}

/** Standalone add-on, not part of either list — gated on the same
    "footstool" tag Mack already carries, same reasoning as everything else
    here: a range not tagged as available with a footstool doesn't get
    offered one. (Stax's own tag list, given directly by Declan, has no
    footstool tag despite footstools existing in that range's product
    catalog — the tag is trusted over the catalog, same as everywhere else
    in this file.) */
export function hasFootstoolOption(tags: string[]): boolean {
  return tags.includes("footstool");
}

/** Selections beyond this many, across both questions together, trigger the
    gentle "narrow it down" note — never a validation error, never blocking. */
export const LAYOUT_NUDGE_THRESHOLD = 4;

/** Same order as the live site's own delivery-location dropdown — Mayo/
    Galway/Roscommon/Sligo/Leitrim first (closest to Castlebar), then the
    rest alphabetically. Unselected by default; no default county is ever
    submitted by accident. */
export const COUNTIES = [
  "Mayo",
  "Galway",
  "Roscommon",
  "Sligo",
  "Leitrim",
  "Antrim",
  "Armagh",
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Derry",
  "Donegal",
  "Down",
  "Dublin",
  "Fermanagh",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "Laois",
  "Limerick",
  "Longford",
  "Louth",
  "Meath",
  "Monaghan",
  "Offaly",
  "Tipperary",
  "Tyrone",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
] as const;

/** Which showroom the enquiry should route to. */
export const SHOWROOM_PREFERENCES = ["Castlebar", "Ennis", "Either"] as const;

/** "Fabric or leather?" is conditional on the range's own material tags —
    absent entirely when there's no real choice (see the spec table). Takes
    the range's tag slugs; returns the option list, or [] if the field
    shouldn't render at all. */
export function materialOptionsFor(tags: string[]): string[] {
  const present: string[] = [];
  if (tags.includes("fabric")) present.push("Fabric");
  if (tags.includes("leather")) present.push("Leather");
  if (tags.includes("aquaclean")) present.push("Aquaclean");
  // Fewer than two real materials = no genuine choice to ask about.
  if (present.length < 2) return [];
  return [...present, "Not sure yet, I'd like to see the options"];
}
