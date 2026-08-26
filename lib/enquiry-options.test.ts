import { describe, expect, it } from "vitest";
import {
  alongsideOptionsFor,
  hasFootstoolOption,
  mainPieceOptionsFor,
  materialOptionsFor,
  shouldShowAlongside,
} from "./enquiry-options";

describe("materialOptionsFor", () => {
  it("is absent entirely for fabric-only ranges", () => {
    expect(materialOptionsFor(["corner", "fabric"])).toEqual([]);
  });

  it("is absent entirely for leather-only ranges", () => {
    expect(materialOptionsFor(["corner", "leather"])).toEqual([]);
  });

  it("is absent when there are no material tags at all", () => {
    expect(materialOptionsFor(["corner", "chaise"])).toEqual([]);
  });

  it("offers Fabric / Leather when both are tagged", () => {
    expect(materialOptionsFor(["fabric", "leather"])).toEqual([
      "Fabric",
      "Leather",
      "Not sure yet, I'd like to see the options",
    ]);
  });

  it("offers Fabric / Aquaclean when both are tagged", () => {
    expect(materialOptionsFor(["fabric", "aquaclean"])).toEqual([
      "Fabric",
      "Aquaclean",
      "Not sure yet, I'd like to see the options",
    ]);
  });

  it("offers all three plus the unsure option when all three are tagged", () => {
    expect(materialOptionsFor(["fabric", "leather", "aquaclean"])).toEqual([
      "Fabric",
      "Leather",
      "Aquaclean",
      "Not sure yet, I'd like to see the options",
    ]);
  });
});

describe("mainPieceOptionsFor", () => {
  it("real data: Stax (no corner, chaise, chair or recliner tags) hides all of those options", () => {
    const options = mainPieceOptionsFor([
      "leather",
      "fabric",
      "4-seater",
      "3-seater",
      "2-seater",
      "snuggler",
      "alexander-and-james",
    ]);
    expect(options).toEqual([
      "2 seater",
      "3 seater",
      "4 seater",
      "Snuggler or cuddler",
      "Not sure yet, I'd like some advice",
    ]);
  });

  it("real data: Mack (corner + chaise + chair + accent-chair tags) offers every option", () => {
    const options = mainPieceOptionsFor([
      "corner",
      "chaise",
      "fabric",
      "3-seater",
      "2-5-seater",
      "2-seater",
      "snuggler",
      "chair",
      "accent-chair",
      "footstool",
      "foam-seat-cushions",
    ]);
    expect(options).toEqual([
      "2 seater",
      "3 seater",
      "Corner group",
      "Chaise sofa",
      "Snuggler or cuddler",
      "Chair or recliner",
      "Not sure yet, I'd like some advice",
    ]);
  });

  it("the catch-all always shows, even for a range with no type tags at all", () => {
    expect(mainPieceOptionsFor([])).toEqual(["Not sure yet, I'd like some advice"]);
  });

  it("'Chair or recliner' accepts either tag, not both", () => {
    expect(mainPieceOptionsFor(["chair"])).toContain("Chair or recliner");
    expect(mainPieceOptionsFor(["recliner"])).toContain("Chair or recliner");
  });

  it("a snuggler tag alone does not unlock 'Chair or recliner' — chair and snuggler are kept distinct", () => {
    expect(mainPieceOptionsFor(["snuggler"])).not.toContain("Chair or recliner");
  });
});

describe("alongsideOptionsFor", () => {
  it("real data: Stax offers only what its own tags cover, plus the two catch-alls", () => {
    const options = alongsideOptionsFor([
      "leather",
      "fabric",
      "4-seater",
      "3-seater",
      "2-seater",
      "snuggler",
      "alexander-and-james",
    ]);
    expect(options).toEqual(["Nothing else", "A 2 seater", "A 3 seater", "A snuggler", "Not sure yet"]);
  });

  it("'A chair' and 'Two chairs' both require the chair tag, not snuggler", () => {
    expect(alongsideOptionsFor(["snuggler"])).not.toContain("A chair");
    expect(alongsideOptionsFor(["snuggler"])).not.toContain("Two chairs");
    expect(alongsideOptionsFor(["chair"])).toContain("A chair");
    expect(alongsideOptionsFor(["chair"])).toContain("Two chairs");
  });

  it("the two catch-alls always show, even for a range with no type tags at all", () => {
    expect(alongsideOptionsFor([])).toEqual(["Nothing else", "Not sure yet"]);
  });
});

describe("shouldShowAlongside", () => {
  it("is hidden with nothing selected yet", () => {
    expect(shouldShowAlongside([])).toBe(false);
  });

  it("is hidden when 'Not sure yet, I'd like some advice' is among the selections", () => {
    expect(shouldShowAlongside(["Not sure yet, I'd like some advice"])).toBe(false);
    expect(shouldShowAlongside(["3 seater", "Not sure yet, I'd like some advice"])).toBe(false);
  });

  it("is hidden when 'Chair or recliner' is the only main piece selected", () => {
    expect(shouldShowAlongside(["Chair or recliner"])).toBe(false);
  });

  it("shows when 'Chair or recliner' is selected alongside something else", () => {
    expect(shouldShowAlongside(["Chair or recliner", "3 seater"])).toBe(true);
  });

  it("shows for an ordinary single or multi main-piece selection", () => {
    expect(shouldShowAlongside(["3 seater"])).toBe(true);
    expect(shouldShowAlongside(["Corner group", "4 seater"])).toBe(true);
  });
});

describe("hasFootstoolOption", () => {
  it("real data: Mack is tagged footstool", () => {
    expect(hasFootstoolOption(["corner", "chaise", "footstool"])).toBe(true);
  });

  it("real data: Stax is not tagged footstool, despite footstools existing in its catalogue", () => {
    expect(hasFootstoolOption(["leather", "fabric", "4-seater", "3-seater", "2-seater", "snuggler", "alexander-and-james"])).toBe(
      false,
    );
  });
});
