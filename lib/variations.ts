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
