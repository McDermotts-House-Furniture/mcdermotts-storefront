import { describe, expect, it } from "vitest";
import { isCompleteSelection, matchVariation } from "./variations";
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
