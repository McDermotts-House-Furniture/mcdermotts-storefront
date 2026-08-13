import { describe, expect, it } from "vitest";
import { normalizeDimension } from "./acf";

describe("normalizeDimension", () => {
  it("adds the cm unit to bare numbers", () => {
    expect(normalizeDimension("Height", "82")).toEqual({ label: "Height", value: "82", unit: "cm" });
  });

  it('strips a written "cm" and keeps the unit slot', () => {
    expect(normalizeDimension("Width", "95cm")).toEqual({ label: "Width", value: "95", unit: "cm" });
    expect(normalizeDimension("Width", "95 cm")).toEqual({ label: "Width", value: "95", unit: "cm" });
  });

  it("passes non-numeric values through verbatim without inventing a unit", () => {
    expect(normalizeDimension("Depth", "48cm (60cm with handles)")).toEqual({
      label: "Depth",
      value: "48cm (60cm with handles)",
    });
  });

  it("rejects empty and non-string values", () => {
    expect(normalizeDimension("Height", "")).toBeNull();
    expect(normalizeDimension("Height", null)).toBeNull();
    expect(normalizeDimension("Height", undefined)).toBeNull();
  });

  it("accepts numeric field values", () => {
    expect(normalizeDimension("Height", 82)).toEqual({ label: "Height", value: "82", unit: "cm" });
  });
});
