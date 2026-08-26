import { describe, expect, it } from "vitest";
import { getLiveRanges, getRangesByTags, isRangeLive, type LandingPage } from "./landing-data";
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
});

describe("getRangesByTags", () => {
  it("real data: Mack is live and tagged corner + chaise", () => {
    const mack = getLiveRanges().find((p) => p.slug === "mack-sofa-range");
    expect(mack).toBeDefined();
    expect(mack?.tags).toEqual(expect.arrayContaining(["corner", "chaise"]));
  });

  it("empty tag query matches every live range (the hub)", () => {
    expect(getRangesByTags([]).length).toBe(getLiveRanges().length);
  });

  it("AND-combines multiple tags, not OR", () => {
    const results = getRangesByTags(["corner", "chaise"]);
    expect(results.every((r) => r.tags.includes("corner") && r.tags.includes("chaise"))).toBe(true);
  });
});

describe("tag discipline", () => {
  it("every range tag is in the controlled vocabulary", () => {
    for (const range of getLiveRanges()) {
      for (const tag of range.tags) {
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
