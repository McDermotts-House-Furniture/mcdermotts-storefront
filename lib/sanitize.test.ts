import { describe, expect, it } from "vitest";
import { sanitizeProductHtml } from "./sanitize";

/* Real short_description from mack-2-5-seater-sofa (fetched 2026-08-27) —
   the leftover Flatsome "row" button block, verbatim. */
const MACK_DESCRIPTION_WITH_LEGACY_BUTTON = `<p>An irresistably comfy sofa – backed up by a 25 year frame guarantee.</p>
<div class="row" id="row-992093275">


	<div id="col-792438208" class="col small-12 large-12">
				<div class="col-inner text-center box-shadow-1">



<a href="http://mcdermotts.ie/sofa-collection/mack-sofa-range/" class="button secondary is-underline expand">
		<span>View Mack &#8211; more information</span>
	<i class="icon-expand" aria-hidden="true"></i></a>



		</div>


#col-792438208 &gt; .col-inner {
  padding: 5px 5px 2px 5px;
  border-radius: 9px;
}
@media (min-width:550px) {
  #col-792438208 &gt; .col-inner {
    padding: 5px 5px 2px 5px;
  }
}

	</div>



</div>`;

describe("sanitizeProductHtml", () => {
  it("real data: strips the leftover Flatsome range-button block (link, icon and its raw CSS) from Mack's own description", () => {
    const out = sanitizeProductHtml(MACK_DESCRIPTION_WITH_LEGACY_BUTTON);
    expect(out).toContain("An irresistably comfy sofa");
    expect(out).not.toContain("col-inner");
    expect(out).not.toContain("View Mack");
    expect(out).not.toContain("more information");
    expect(out).not.toContain("mcdermotts.ie/sofa-collection");
    expect(out).not.toContain("padding:");
    expect(out).not.toContain("@media");
  });

  it("leaves an ordinary description with no legacy button completely untouched", () => {
    const html = "<p>A deep, comfortable sofa built for everyday use.</p>";
    expect(sanitizeProductHtml(html)).toBe(html);
  });

  it("still drops a real <script> tag — the allowlist sanitizer still runs after the strip", () => {
    const out = sanitizeProductHtml('<p>Copy</p><script>alert("x")</script>');
    expect(out).not.toContain("<script>");
    expect(out).toContain("<p>Copy</p>");
  });
});
