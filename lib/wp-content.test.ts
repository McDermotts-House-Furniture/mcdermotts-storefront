import { describe, expect, it } from "vitest";
import { mapBlocks, mapLandingDoc, mapModelDoc, splitParagraphs } from "./wp-content";

/* Fixtures mirror what wp/v2 returns with acf_format=standard for content
   authored through the mcdermotts-content plugin's field groups. */

describe("splitParagraphs", () => {
  it("splits on blank lines and collapses internal whitespace", () => {
    expect(splitParagraphs("First para\nsame para.\n\nSecond   para.\n\n\nThird.")).toEqual([
      "First para same para.",
      "Second para.",
      "Third.",
    ]);
  });

  it("returns [] for empty and non-string input", () => {
    expect(splitParagraphs("")).toEqual([]);
    expect(splitParagraphs(undefined)).toEqual([]);
    expect(splitParagraphs(false)).toEqual([]);
  });
});

describe("mapBlocks", () => {
  it("maps every layout of the shared block library", () => {
    expect(
      mapBlocks([
        { acf_fc_layout: "editorial", title: "", body: "One.\n\nTwo." },
        {
          acf_fc_layout: "features",
          title: "Key features",
          items: [{ title: "Fabric options", body: "Wide selection." }],
        },
        {
          acf_fc_layout: "specs",
          title: "Detail",
          items: [{ label: "Suspension", value: "Serpentine springs." }],
        },
        { acf_fc_layout: "products", title: "Shop Henrik", standfirst: "", products: [12, 34], search: "" },
        { acf_fc_layout: "showroom", title: "See it in person", body: "Castlebar and Ennis." },
        { acf_fc_layout: "call_cta", title: "Talk to us", body: "" },
      ]),
    ).toEqual([
      { type: "editorial", title: undefined, paragraphs: ["One.", "Two."] },
      { type: "features", title: "Key features", items: [{ title: "Fabric options", body: "Wide selection." }] },
      { type: "specs", title: "Detail", items: [{ label: "Suspension", value: "Serpentine springs." }] },
      { type: "products", title: "Shop Henrik", standfirst: undefined, ids: [12, 34], search: undefined },
      { type: "showroom", title: "See it in person", body: "Castlebar and Ennis." },
      { type: "callCta", title: "Talk to us", body: undefined },
    ]);
  });

  it("prefers picked product ids over the search fallback, uses search when none picked", () => {
    /* ACF serialises an empty repeater/relationship as false. */
    expect(mapBlocks([{ acf_fc_layout: "products", title: "T", products: false, search: "henrik" }])).toEqual([
      { type: "products", title: "T", standfirst: undefined, ids: undefined, search: "henrik" },
    ]);
    /* Embedded post objects (rest format drift) still yield ids. */
    expect(mapBlocks([{ acf_fc_layout: "products", title: "T", products: [{ ID: 7 }] }])).toEqual([
      { type: "products", title: "T", standfirst: undefined, ids: [7], search: undefined },
    ]);
  });

  it("drops empty rows, unknown layouts and non-array input", () => {
    expect(
      mapBlocks([
        { acf_fc_layout: "editorial", title: "Empty", body: "" },
        { acf_fc_layout: "features", title: "No items", items: false },
        { acf_fc_layout: "products", title: "Neither ids nor search", products: [], search: "" },
        { acf_fc_layout: "hero_video" },
      ]),
    ).toEqual([]);
    expect(mapBlocks(false)).toEqual([]);
    expect(mapBlocks(undefined)).toEqual([]);
  });
});

describe("mapLandingDoc", () => {
  it("maps a WP landing doc to the LandingPage shape the /range template renders", () => {
    const page = mapLandingDoc({
      id: 101,
      slug: "henrik-sofa-range",
      title: { rendered: "Henrik &amp; Friends" },
      acf: {
        eyebrow: "Introducing…",
        standfirst: "Sink-in comfort, built to last",
        hero_image: { url: "https://mcdermotts.ie/wp-content/uploads/henrik.jpg", alt: "Henrik sofa" },
        blocks: [{ acf_fc_layout: "editorial", body: "Hello." }],
      },
    });
    expect(page).toEqual({
      slug: "henrik-sofa-range",
      title: "Henrik & Friends",
      eyebrow: "Introducing…",
      standfirst: "Sink-in comfort, built to last",
      heroImage: "https://mcdermotts.ie/wp-content/uploads/henrik.jpg",
      heroAlt: "Henrik sofa",
      blocks: [{ type: "editorial", title: undefined, paragraphs: ["Hello."] }],
    });
  });

  it("survives a doc with no ACF values yet (just-published empty page)", () => {
    const page = mapLandingDoc({ id: 1, slug: "new-page", title: { rendered: "New Page" }, acf: [] });
    expect(page).toMatchObject({ slug: "new-page", eyebrow: "Introducing…", heroImage: "", blocks: [] });
    /* Missing alt falls back to the page title for the hero. */
    expect(page?.heroAlt).toBe("New Page");
  });

  it("rejects docs without slug or title", () => {
    expect(mapLandingDoc({ id: 1, slug: "x" })).toBeNull();
    expect(mapLandingDoc({ id: 1, title: { rendered: "X" } })).toBeNull();
  });
});

describe("mapModelDoc", () => {
  it("assembles sofa facts from the type-specific fields", () => {
    const model = mapModelDoc("sofa", {
      id: 7,
      slug: "henrik",
      title: { rendered: "Henrik" },
      acf: {
        standfirst: "Sink-in comfort",
        fabric_note: "Wide fabric selection",
        configurations: [{ name: "2 seater" }, { name: "Corner" }],
        guarantee: "25 year frame guarantee",
        blocks: false,
      },
    });
    expect(model).toMatchObject({
      kind: "sofa",
      slug: "henrik",
      eyebrow: "Sofa range",
      facts: [
        { label: "Fabrics", value: "Wide fabric selection" },
        { label: "Configurations", value: "2 seater · Corner" },
        { label: "Guarantee", value: "25 year frame guarantee" },
      ],
    });
  });

  it("assembles mattress facts and maps stored keys to display labels", () => {
    const model = mapModelDoc("mattress", {
      id: 8,
      slug: "xtra-life-plus-1600",
      title: { rendered: "Xtra Life Plus 1600" },
      acf: {
        brand_name: "King Koil",
        brand_logo: { url: "https://mcdermotts.ie/wp-content/uploads/king-koil.png", alt: "", width: 320, height: 96 },
        firmness: "medium-firm",
        mattress_height: "34 cm",
        turn_type: "no-turn",
        sizes: ["double", "king", "super-king"],
        trial: "90-night comfort trial",
      },
    });
    expect(model?.brand).toEqual({
      name: "King Koil",
      /* Empty media-library alt falls back to "<brand> logo". */
      logo: {
        src: "https://mcdermotts.ie/wp-content/uploads/king-koil.png",
        alt: "King Koil logo",
        width: 320,
        height: 96,
      },
    });
    expect(model).toMatchObject({
      kind: "mattress",
      eyebrow: "Mattress",
      facts: [
        { label: "Brand", value: "King Koil" },
        { label: "Firmness", value: "Medium-firm" },
        { label: "Height", value: "34 cm" },
        { label: "Care", value: "No-turn — no flipping needed" },
        { label: "Sizes", value: "Double · King · Super King" },
        { label: "Trial", value: "90-night comfort trial" },
      ],
    });
  });

  it("omits facts the editor left blank, and brand entirely when unset", () => {
    const model = mapModelDoc("mattress", {
      id: 9,
      slug: "basic",
      title: { rendered: "Basic" },
      acf: { firmness: "firm", sizes: false, brand_name: "", brand_logo: false },
    });
    expect(model?.facts).toEqual([{ label: "Firmness", value: "Firm" }]);
    expect(model?.brand).toBeUndefined();
  });

  it("keeps a name-only brand (own-label logo not uploaded)", () => {
    const model = mapModelDoc("sofa", {
      id: 10,
      slug: "henrik",
      title: { rendered: "Henrik" },
      acf: { brand_name: "La-Z-Boy" },
    });
    expect(model?.brand).toEqual({ name: "La-Z-Boy", logo: undefined });
    expect(model?.facts).toEqual([{ label: "Brand", value: "La-Z-Boy" }]);
  });
});
