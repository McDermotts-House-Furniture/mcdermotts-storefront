/* Pure variation-resolution logic. The parent product's `variations` array maps
   every purchasable combination to a variation id, so selection resolves locally
   — no bulk variation fetching, which matters at Orla Kiely scale (240
   variations on one sofa). Selection is keyed by attribute name; values are
   term slugs. An empty variation value means that attribute can be anything. */

export interface VariationRef {
  id: number;
  attributes: { name: string; value: string }[];
}

export type Selection = Record<string, string>;

export function matchVariation(selection: Selection, variations: VariationRef[]): number | null {
  const match = variations.find((variation) =>
    variation.attributes.every((attr) => {
      if (attr.value === "") return true;
      return selection[attr.name] === attr.value;
    }),
  );
  return match?.id ?? null;
}

export function isCompleteSelection(
  selection: Selection,
  attributes: { name: string; has_variations: boolean }[],
): boolean {
  return attributes
    .filter((a) => a.has_variations)
    .every((a) => Boolean(selection[a.name]));
}

/* Selection restricted to attributes strictly before `index` in `attributes`
   — the context a given level's reachable options are filtered by. Values
   the selection still holds for attributes at or after `index` are
   deliberately left out, even if one lingers from before an earlier pick
   changed underneath it — they're a different level's concern, not this
   one's. */
export function priorSelection(
  attributes: { name: string }[],
  index: number,
  selection: Selection,
): Selection {
  const prior: Selection = {};
  for (let i = 0; i < index; i++) {
    const value = selection[attributes[i].name];
    if (value) prior[attributes[i].name] = value;
  }
  return prior;
}

/* Every term of `attribute` actually reachable given `priorSel` — i.e. it
   appears on at least one variation matching everything already chosen —
   each mapped to one representative variation id (the first match), whose
   image can stand in as that term's swatch. An empty `priorSel` (nothing
   chosen yet) reduces to "every term with a real variation at all" — the
   first level's own picture. Depth and width both fall straight out of the
   product's own variation list; no attribute count or level count is
   assumed anywhere, so this works the same whether the product has one
   attribute or five, two terms or two hundred. */
export function reachableCandidates(
  attribute: { name: string },
  priorSel: Selection,
  variations: VariationRef[],
): Map<string, number> {
  const candidates = new Map<string, number>();
  for (const variation of variations) {
    const matchesSoFar = variation.attributes.every((a) => {
      const wanted = priorSel[a.name];
      return wanted === undefined || a.value === "" || a.value === wanted;
    });
    if (!matchesSoFar) continue;
    const term = variation.attributes.find((a) => a.name === attribute.name)?.value;
    if (term && !candidates.has(term)) candidates.set(term, variation.id);
  }
  return candidates;
}

/* Prefetch cap for a single level's own picture — used both for the first
   level on page load and as the fallback when a subtree (below) is too big
   to fetch whole. A level with only a couple of terms already clears this
   outright, so there's no separate "small branch" path to maintain (Declan,
   2026-09-01: "the overhead isn't worth it"). */
export const PREFETCH_CAP = 8;

/* Every variation compatible with everything in `selection` so far — the
   whole branch reachable underneath it, however many further attributes
   sit below (arbitrary depth, driven entirely by the product's own
   variation data, never an assumed count or an assumed "first level").
   One rule for wherever the selection currently stands: an empty selection
   returns every variation; a complete one returns at most the single exact
   match. A wildcard ("any") value on any attribute counts as compatible
   with whatever's selected for it, same as everywhere else this file
   treats "". */
export function subtreeVariations(selection: Selection, variations: VariationRef[]): VariationRef[] {
  return variations.filter((v) =>
    v.attributes.every((a) => {
      const wanted = selection[a.name];
      return wanted === undefined || a.value === "" || a.value === wanted;
    }),
  );
}

/* Cap on how much of a subtree gets fetched whole. Declan's own example — 6
   colours × 8 cushion options × 2 foot finishes, 16 combinations under one
   colour — should clear this outright; it's set comfortably above that so
   that example fetches in full, while a wider range (more colours, more
   attributes) falls back to `PREFETCH_CAP`-worth of the immediate next
   level instead of every leaf combination underneath it. */
export const SUBTREE_CAP = 24;

/* Deterministic "what to show" for wherever the selection currently
   stands — one rule for every level, a single term picked or all of them
   — never random, so the same selection path always resolves to the same
   photo (Declan, 2026-09-02: "the same selection path must always resolve
   to the same image, so backtracking and returning shows what the user
   saw before"). Prefers the product's own flagged default
   (`defaultSelection`, Woo's default_attributes) when it agrees with
   everything already chosen; otherwise the first match in the product's
   own variation order — never a random pick within the subtree. */
export function representativeVariationId(
  selection: Selection,
  variations: VariationRef[],
  defaultSelection: Selection | undefined,
): number | undefined {
  const chosen = Object.keys(selection);
  if (defaultSelection && chosen.every((name) => defaultSelection[name] === selection[name])) {
    const id = matchVariation(defaultSelection, variations);
    if (id !== null) return id;
  }
  return variations.find((v) =>
    v.attributes.every((a) => {
      const wanted = selection[a.name];
      return wanted === undefined || a.value === "" || a.value === wanted;
    }),
  )?.id;
}
