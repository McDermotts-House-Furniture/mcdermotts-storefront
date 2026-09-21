import { describe, expect, it } from "vitest";
import {
  isCompleteSelection,
  matchVariation,
  priorSelection,
  reachableCandidates,
  representativeVariationId,
  subtreeVariations,
} from "./variations";
import type { StoreApiAttribute } from "./store-api";

/* Shapes mirror the live API: attribute terms carry name + slug; variation
   attribute values are term slugs; an empty value means "any". */
const attributes: StoreApiAttribute[] = [
  {
    id: 1,
    name: "Fabric Colour",
    taxonomy: "pa_fabric",
    has_variations: true,
    terms: [
      { id: 11, name: "Tomato", slug: "tomato" },
      { id: 12, name: "Dandelion", slug: "dandelion" },
    ],
  },
  {
    id: 2,
    name: "Foot Options",
    taxonomy: "pa_feet",
    has_variations: true,
    terms: [
      { id: 21, name: "Oak", slug: "oak" },
      { id: 22, name: "Black", slug: "black" },
    ],
  },
  {
    id: 3,
    name: "Brand",
    taxonomy: "pa_brand",
    has_variations: false,
    terms: [{ id: 31, name: "Orla Kiely", slug: "orla-kiely" }],
  },
];

const variations = [
  {
    id: 101,
    attributes: [
      { name: "Fabric Colour", value: "tomato" },
      { name: "Foot Options", value: "oak" },
    ],
  },
  {
    id: 102,
    attributes: [
      { name: "Fabric Colour", value: "tomato" },
      { name: "Foot Options", value: "black" },
    ],
  },
  {
    id: 103,
    attributes: [
      { name: "Fabric Colour", value: "dandelion" },
      { name: "Foot Options", value: "" }, // any feet
    ],
  },
];

describe("matchVariation", () => {
  it("resolves an exact combination", () => {
    expect(
      matchVariation({ "Fabric Colour": "tomato", "Foot Options": "black" }, variations),
    ).toBe(102);
  });

  it('treats an empty variation value as "any"', () => {
    expect(
      matchVariation({ "Fabric Colour": "dandelion", "Foot Options": "oak" }, variations),
    ).toBe(103);
  });

  it("returns null for a combination no variation offers", () => {
    expect(matchVariation({ "Fabric Colour": "seagreen", "Foot Options": "oak" }, variations)).toBe(
      null,
    );
  });

  it("returns null while the selection is incomplete", () => {
    expect(matchVariation({ "Fabric Colour": "tomato" }, variations)).toBe(null);
  });
});

describe("isCompleteSelection", () => {
  it("requires every has_variations attribute", () => {
    expect(isCompleteSelection({ "Fabric Colour": "tomato" }, attributes)).toBe(false);
    expect(
      isCompleteSelection({ "Fabric Colour": "tomato", "Foot Options": "oak" }, attributes),
    ).toBe(true);
  });

  it("ignores attributes that do not drive variations", () => {
    expect(
      isCompleteSelection(
        { "Fabric Colour": "tomato", "Foot Options": "oak", Brand: "" },
        attributes,
      ),
    ).toBe(true);
  });
});

/* A genuinely cascading three-level shape for priorSelection/reachableCandidates:
   Seagreen only ever ships Small — Large isn't a real combination for it, the
   way Mack Chaise's "ghost" colours weren't a real combination for it either. */
const cascadingLevels = [{ name: "Colour" }, { name: "Size" }, { name: "Foot" }];
const cascadingVariations = [
  { id: 1, attributes: [{ name: "Colour", value: "tomato" }, { name: "Size", value: "small" }, { name: "Foot", value: "oak" }] },
  { id: 2, attributes: [{ name: "Colour", value: "tomato" }, { name: "Size", value: "large" }, { name: "Foot", value: "oak" }] },
  { id: 3, attributes: [{ name: "Colour", value: "dandelion" }, { name: "Size", value: "small" }, { name: "Foot", value: "black" }] },
  { id: 4, attributes: [{ name: "Colour", value: "dandelion" }, { name: "Size", value: "large" }, { name: "Foot", value: "black" }] },
  { id: 5, attributes: [{ name: "Colour", value: "seagreen" }, { name: "Size", value: "small" }, { name: "Foot", value: "black" }] },
];

describe("priorSelection", () => {
  it("is empty at level 0 regardless of what's selected", () => {
    expect(priorSelection(cascadingLevels, 0, { Colour: "tomato", Size: "small" })).toEqual({});
  });

  it("includes only attributes strictly before the given index", () => {
    expect(priorSelection(cascadingLevels, 1, { Colour: "tomato" })).toEqual({ Colour: "tomato" });
    expect(
      priorSelection(cascadingLevels, 2, { Colour: "tomato", Size: "small", Foot: "oak" }),
    ).toEqual({ Colour: "tomato", Size: "small" });
  });

  it("drops a lingering value at or after the index — a different level's concern", () => {
    // Foot was picked, then Colour changed underneath it; Foot shouldn't
    // constrain what's reachable at Colour's own level (0) or Size's (1).
    const stale = { Colour: "tomato", Size: "small", Foot: "oak" };
    expect(priorSelection(cascadingLevels, 0, stale)).toEqual({});
    expect(priorSelection(cascadingLevels, 1, stale)).toEqual({ Colour: "tomato" });
  });

  it("omits falsy selections", () => {
    expect(priorSelection(cascadingLevels, 2, { Colour: "tomato", Size: "" })).toEqual({
      Colour: "tomato",
    });
  });
});

describe("reachableCandidates", () => {
  it("returns every term with a real variation when nothing is chosen yet — level one", () => {
    const result = reachableCandidates({ name: "Colour" }, {}, cascadingVariations);
    expect([...result.keys()].sort()).toEqual(["dandelion", "seagreen", "tomato"]);
    expect(result.get("tomato")).toBe(1); // first matching variation, not just any
  });

  it("narrows to only what's reachable given the branch entered so far", () => {
    const forTomato = reachableCandidates({ name: "Size" }, { Colour: "tomato" }, cascadingVariations);
    expect([...forTomato.keys()].sort()).toEqual(["large", "small"]);

    // Seagreen never ships Large — a cascading constraint, not missing data.
    const forSeagreen = reachableCandidates({ name: "Size" }, { Colour: "seagreen" }, cascadingVariations);
    expect([...forSeagreen.keys()]).toEqual(["small"]);
  });

  it("never surfaces a sibling branch's options", () => {
    // Picking Dandelion should never make Tomato's own Foot Options visible.
    const forDandelion = reachableCandidates(
      { name: "Foot" },
      { Colour: "dandelion", Size: "small" },
      cascadingVariations,
    );
    expect([...forDandelion.keys()]).toEqual(["black"]);
  });

  it('treats a wildcard ("any") variation value as compatible with every prior selection', () => {
    const withWildcard = [
      { id: 9, attributes: [{ name: "Colour", value: "dandelion" }, { name: "Foot", value: "" }] },
    ];
    // Foot is "any" on this variation, so no matter what Foot was picked
    // upstream, Colour: dandelion should still be reachable from it.
    expect([...reachableCandidates({ name: "Colour" }, { Foot: "oak" }, withWildcard).keys()]).toEqual([
      "dandelion",
    ]);
  });
});

describe("subtreeVariations", () => {
  it("returns every combination under a one-attribute selection, whatever sits below it", () => {
    // Tomato: Size × Foot both vary underneath it (ids 1, 2).
    expect(subtreeVariations({ Colour: "tomato" }, cascadingVariations).map((v) => v.id)).toEqual([1, 2]);
    // Seagreen: only ever Small (id 5) — a smaller subtree, same function.
    expect(subtreeVariations({ Colour: "seagreen" }, cascadingVariations).map((v) => v.id)).toEqual([5]);
  });

  it("narrows further as more levels are added to the selection — the same rule, no special case", () => {
    // Colour alone: both tomato variations (small + large).
    expect(subtreeVariations({ Colour: "tomato" }, cascadingVariations).map((v) => v.id)).toEqual([1, 2]);
    // Colour + Size: down to the one exact combination.
    expect(
      subtreeVariations({ Colour: "tomato", Size: "large" }, cascadingVariations).map((v) => v.id),
    ).toEqual([2]);
  });

  it("returns every variation for an empty selection", () => {
    expect(subtreeVariations({}, cascadingVariations)).toHaveLength(cascadingVariations.length);
  });

  it("never includes a sibling branch", () => {
    const dandelion = subtreeVariations({ Colour: "dandelion" }, cascadingVariations);
    expect(dandelion.every((v) => v.attributes.some((a) => a.name === "Colour" && a.value === "dandelion"))).toBe(
      true,
    );
  });

  it('includes a wildcard ("any") variation regardless of what was selected', () => {
    const withWildcard = [
      { id: 9, attributes: [{ name: "Colour", value: "" }, { name: "Size", value: "small" }] },
    ];
    expect(subtreeVariations({ Colour: "tomato" }, withWildcard).map((v) => v.id)).toEqual([9]);
  });

  it("returns an empty subtree for a selection with no matching variation", () => {
    expect(subtreeVariations({ Colour: "seagreen-xl" }, cascadingVariations)).toEqual([]);
  });
});

describe("representativeVariationId", () => {
  // The flagged default (dandelion + large) is deliberately NOT first in
  // array order, so a pass here proves the default is actually being
  // preferred, not just landing on the natural first match by luck.
  const withDefault = [
    { id: 201, attributes: [{ name: "Colour", value: "tomato" }, { name: "Size", value: "small" }] },
    { id: 202, attributes: [{ name: "Colour", value: "dandelion" }, { name: "Size", value: "small" }] },
    { id: 203, attributes: [{ name: "Colour", value: "dandelion" }, { name: "Size", value: "large" }] },
  ];

  it("falls back to the first match in the product's own order when there's no default", () => {
    expect(representativeVariationId({ Colour: "dandelion" }, withDefault, undefined)).toBe(202);
  });

  it("prefers the product's flagged default when it agrees with everything already chosen", () => {
    expect(
      representativeVariationId({ Colour: "dandelion" }, withDefault, { Colour: "dandelion", Size: "large" }),
    ).toBe(203);
  });

  it("ignores a default that belongs to a different branch", () => {
    // The default is Tomato; asking for Dandelion's representative should
    // never resolve to a Tomato variation.
    expect(representativeVariationId({ Colour: "dandelion" }, withDefault, { Colour: "tomato", Size: "small" })).toBe(
      202,
    );
  });

  it("falls back to natural order when the default doesn't resolve to a real combination", () => {
    // Colour matches, but Size: "xl" isn't a real variation for this branch.
    expect(
      representativeVariationId({ Colour: "dandelion" }, withDefault, { Colour: "dandelion", Size: "xl" }),
    ).toBe(202);
  });

  it("resolves the exact same variation once every level is selected, not just the first", () => {
    // The same rule applied to a complete selection is just matchVariation's
    // own single-match behaviour — no separate "final level" case needed.
    expect(representativeVariationId({ Colour: "dandelion", Size: "large" }, withDefault, undefined)).toBe(203);
  });

  it("is deterministic — the same selection always resolves to the same id", () => {
    const first = representativeVariationId({ Colour: "dandelion" }, withDefault, undefined);
    const second = representativeVariationId({ Colour: "dandelion" }, withDefault, undefined);
    expect(first).toBe(second);
  });

  it("returns undefined for a selection with no matching variation", () => {
    expect(representativeVariationId({ Colour: "seagreen-xl" }, withDefault, undefined)).toBeUndefined();
  });
});
