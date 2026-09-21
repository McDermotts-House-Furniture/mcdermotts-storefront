import { describe, expect, it } from "vitest";
import { getLiveRanges, getRangesByTags, isRangeLive, matchesShowroom, type LandingPage } from "./landing-data";
import { getTag, TAGS } from "./tags";
import { COLLECTIONS } from "./collection-data";

const page = (overrides: Partial<LandingPage>): LandingPage => ({
  slug: "test-range",
  eyebrow: "",
  title: "Test Range",
  standfirst: "",
  heroImage: "",
  heroAlt: "",
  tags: [],
  showroomStatus: { castlebar: "on-display", ennis: "on-display" },
  blocks: [],
  ...overrides,
});

describe("isRangeLive", () => {
  it("is live when at least one showroom is on display", () => {
    expect(
      isRangeLive(page({ showroomStatus: { castlebar: "on-display", ennis: "not-on-display" } })),
    ).toBe(true);
  });

  it("is live when a showroom is coming soon, even if the other is not on display", () => {
    expect(
      isRangeLive(page({ showroomStatus: { castlebar: "not-on-display", ennis: "coming-soon" } })),
    ).toBe(true);
  });

  it("is not live when both showrooms are not on display — the publishing rule", () => {
    expect(
      isRangeLive(page({ showroomStatus: { castlebar: "not-on-display", ennis: "not-on-display" } })),
    ).toBe(false);
  });

  it("is live when showroomStatus is entirely absent (a WP page with no ACF field for it yet) — exempt from the gate, not treated as both-not-on-display", () => {
    expect(isRangeLive(page({ showroomStatus: undefined }))).toBe(true);
  });
});

describe("matchesShowroom", () => {
  it("real data: matchesShowroom itself is tag-agnostic — Xtra Life Plus (a mattress, not a sofa) is on display in Ennis too; the collection page's own sofa-only exclusion comes from getRangesByTags, not this", () => {
    const onEnnis = getLiveRanges()
      .filter((r) => matchesShowroom(r, "ennis"))
      .map((r) => r.slug)
      .sort();
    expect(onEnnis).toEqual(
      [
        "axel-by-fama",
        "carini-sofa-by-xooon",
        "stax-sofa-by-alexander-and-james",
        "xtra-life-plus-1600-by-king-koil",
      ].sort(),
    );
  });

  it("real data, scoped to the sofa hub (tagged ranges only): the same three sofa ranges, mattress excluded", () => {
    const onEnnis = getRangesByTags([])
      .filter((r) => matchesShowroom(r, "ennis"))
      .map((r) => r.slug)
      .sort();
    expect(onEnnis).toEqual(
      ["axel-by-fama", "carini-sofa-by-xooon", "stax-sofa-by-alexander-and-james"].sort(),
    );
  });

  it("no showroom filter (undefined) always matches, regardless of status", () => {
    expect(matchesShowroom(page({ showroomStatus: undefined }), undefined)).toBe(true);
    expect(
      matchesShowroom(page({ showroomStatus: { castlebar: "not-on-display", ennis: "not-on-display" } }), undefined),
    ).toBe(true);
  });

  it("'coming-soon' does not match — this is about what's on the floor now, not what's arriving", () => {
    expect(matchesShowroom(page({ showroomStatus: { castlebar: "coming-soon", ennis: "on-display" } }), "castlebar")).toBe(false);
  });

  it("no showroomStatus at all does not match a specific showroom filter — never inferred", () => {
    expect(matchesShowroom(page({ showroomStatus: undefined }), "ennis")).toBe(false);
  });
});

describe("getRangesByTags", () => {
  it("real data: Mack is live and tagged corner + chaise", () => {
    const mack = getLiveRanges().find((p) => p.slug === "mack-sofa-range");
    expect(mack).toBeDefined();
    expect(mack?.tags).toEqual(expect.arrayContaining(["corner", "chaise"]));
  });

  it("empty tag query matches every TAGGED live range (the hub) — not literally every range on the site", () => {
    const tagged = getLiveRanges().filter((r) => (r.tags ?? []).length > 0);
    expect(getRangesByTags([]).length).toBe(tagged.length);
    expect(getRangesByTags([]).every((r) => (r.tags ?? []).length > 0)).toBe(true);
  });

  it("a range with no tags never appears in any tag query, including the empty one (the mattress-in-the-sofa-hub bug)", () => {
    const untagged = getLiveRanges().find((r) => r.slug === "xtra-life-plus-1600-by-king-koil");
    expect(untagged?.tags).toEqual([]);
    expect(getRangesByTags([])).not.toContainEqual(untagged);
  });

  it("AND-combines multiple tags, not OR", () => {
    const results = getRangesByTags(["corner", "chaise"]);
    expect(results.every((r) => (r.tags ?? []).includes("corner") && (r.tags ?? []).includes("chaise"))).toBe(true);
  });
});

describe("tag discipline", () => {
  it("every range tag is in the controlled vocabulary", () => {
    for (const range of getLiveRanges()) {
      for (const tag of range.tags ?? []) {
        expect(getTag(tag), `"${tag}" on ${range.slug} is not a defined tag`).toBeDefined();
      }
    }
  });

  it("every collection's tags are in the controlled vocabulary", () => {
    for (const collection of COLLECTIONS) {
      for (const tag of collection.tags) {
        expect(getTag(tag), `"${tag}" on collection ${collection.slug} is not a defined tag`).toBeDefined();
      }
    }
  });

  it("has no duplicate tag slugs", () => {
    const slugs = TAGS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
