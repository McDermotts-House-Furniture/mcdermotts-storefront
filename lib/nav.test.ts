import { describe, expect, it } from "vitest";
import { buildNavTree } from "./nav";
import type { StoreApiCategory } from "./store-api";

const cat = (id: number, slug: string, name: string, parent = 0, count = 5): StoreApiCategory =>
  ({ id, slug, name, parent, count, description: "", image: null }) as StoreApiCategory;

const categories = [
  cat(10, "bedroom-furniture", "Bedroom"),
  cat(11, "wardrobes", "Wardrobes", 10),
  cat(12, "chest-of-drawers", "Chest of Drawers", 10),
  cat(13, "empty-sub", "Empty", 10, 0),
  cat(20, "willis-gambier", "Willis &amp; Gambier", 10),
  cat(30, "latest-arrivals", "Latest Arrivals"),
];

describe("buildNavTree", () => {
  const tree = buildNavTree(
    [
      { label: "Bedroom", href: "/category/bedroom-furniture" },
      { label: "New In", href: "/category/latest-arrivals" },
      { label: "Story", href: "https://mcdermotts.ie/about/" },
    ],
    categories,
  );

  it("attaches child categories sorted by name, entities decoded", () => {
    expect(tree[0].children.map((c) => c.label)).toEqual([
      "Chest of Drawers",
      "Wardrobes",
      "Willis & Gambier",
    ]);
    expect(tree[0].children[0].href).toBe("/category/chest-of-drawers");
  });

  it("drops empty subcategories", () => {
    expect(tree[0].children.find((c) => c.href.includes("empty-sub"))).toBeUndefined();
  });

  it("leaves childless and external items as plain links", () => {
    expect(tree[1].children).toEqual([]);
    expect(tree[2].children).toEqual([]);
  });
});
