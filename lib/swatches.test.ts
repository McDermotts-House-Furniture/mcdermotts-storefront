import { describe, expect, it } from "vitest";
import { parseSwatchMap } from "./swatches";

const html = `
<div class="rtwpvs-terms-wrapper image-variable-wrapper" data-attribute_name="attribute_pa_cofra-wood-finish">
  <div data-rtwpvs-tooltip="Bordo Finish" class="rtwpvs-term rtwpvs-image-term" title="Bordo Finish" data-term="bordo-finish">
    <span class="rtwpvs-term-span"> <img alt="Bordo Finish" src="https://mcdermotts.ie/wp-content/uploads/2026/03/Bordo-Finish-150x150.jpg" /> </span>
  </div>
  <div data-rtwpvs-tooltip="Natural Finish" class="rtwpvs-term rtwpvs-image-term selected" title="Natural Finish" data-term="natural-finish">
    <span class="rtwpvs-term-span"> <img alt="Natural Finish" src="https://mcdermotts.ie/wp-content/uploads/2026/03/Natural-Finish-150x150.jpg" /> </span>
  </div>
</div>
<div class="rtwpvs-terms-wrapper" data-attribute_name="attribute_pa_feet">
  <div class="rtwpvs-term" data-term="oak"><span><img src="https://mcdermotts.ie/oak.jpg" /></span></div>
</div>
<!-- the page repeats the form (mobile/desktop) — first occurrence wins -->
<div class="rtwpvs-terms-wrapper" data-attribute_name="attribute_pa_cofra-wood-finish">
  <div class="rtwpvs-term" data-term="bordo-finish"><span><img src="https://mcdermotts.ie/duplicate.jpg" /></span></div>
</div>
`;

describe("parseSwatchMap", () => {
  const map = parseSwatchMap(html);

  it("maps taxonomy → term → swatch src", () => {
    expect(map["pa_cofra-wood-finish"]["bordo-finish"]).toContain("Bordo-Finish-150x150");
    expect(map["pa_cofra-wood-finish"]["natural-finish"]).toContain("Natural-Finish-150x150");
    expect(map["pa_feet"].oak).toBe("https://mcdermotts.ie/oak.jpg");
  });

  it("keeps the first occurrence when the form repeats", () => {
    expect(map["pa_cofra-wood-finish"]["bordo-finish"]).not.toContain("duplicate");
  });

  it("returns an empty map for pages without swatch markup", () => {
    expect(parseSwatchMap("<html><body>plain page</body></html>")).toEqual({});
  });
});
