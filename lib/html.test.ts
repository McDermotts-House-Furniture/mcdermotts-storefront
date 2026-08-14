import { describe, expect, it } from "vitest";
import { decodeEntities } from "./html";

describe("decodeEntities", () => {
  it("decodes the mattress-size entities from the live category tree", () => {
    expect(decodeEntities("Double (4&#8217;6&#8243;) Mattress")).toBe("Double (4’6″) Mattress");
    expect(decodeEntities("Superking (6&#8217;0) Mattresses")).toBe("Superking (6’0) Mattresses");
  });

  it("decodes named entities", () => {
    expect(decodeEntities("Willis &amp; Gambier")).toBe("Willis & Gambier");
    expect(decodeEntities("McDermott&rsquo;s")).toBe("McDermott’s");
  });

  it("decodes hex entities", () => {
    expect(decodeEntities("&#x2019;")).toBe("’");
  });

  it("leaves unknown entities and plain text alone", () => {
    expect(decodeEntities("Fish &chips; 4 > 2")).toBe("Fish &chips; 4 > 2");
    expect(decodeEntities("Cófra")).toBe("Cófra");
  });
});
