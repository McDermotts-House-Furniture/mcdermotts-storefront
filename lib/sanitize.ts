import sanitizeHtml from "sanitize-html";

/* Leftover Flatsome/UX-Builder "row" button block (Declan, 2026-08-27: "it
   is not on every sofa because not every sofa has or deserves a range
   page") — a real "View [Range] – more information" button that used to
   link back to the live WordPress range page, plus its own per-instance
   CSS (`#col-<id> > .col-inner { ... }`), both stuck as literal content
   inside the description rather than a real <style> block or theme
   shortcode. The allowlist below already drops the wrapping <div>s (div
   isn't an allowed tag), but that only strips tags, not text — the <a> and
   the raw CSS text survive as-is otherwise: a real (if unstyled and now
   pointed at the *old* WordPress URL) link sitting right next to garbled
   CSS. Superseded properly by rangeLinksFor()/RangeLink (lib/merchandising)
   once a range has a real /range/ page — stripped here rather than
   half-rendered. Removed before the allowlist sanitizer runs, on the raw
   HTML, since this is content sanitize-html has no way to distinguish from
   real prose once div tags are gone. */
const LEGACY_RANGE_BUTTON = /<div[^>]*\bid="row-\d+"[^>]*>(?:[\s\S]*?<\/div>){3}/gi;

function stripLegacyRangeButton(html: string): string {
  return html.replace(LEGACY_RANGE_BUTTON, "");
}

/* Product copy comes from McDermott's own WordPress, but sanitize anyway so a
   compromised CMS can't inject script into the storefront. Keeps the benign
   markup WooCommerce actually uses in descriptions. */
export function sanitizeProductHtml(html: string): string {
  return sanitizeHtml(stripLegacyRangeButton(html), {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "s", "ul", "ol", "li",
      "h2", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td",
      "img", "a", "span", "figure", "figcaption",
    ],
    allowedAttributes: {
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href"],
    },
    allowedSchemes: ["https", "http"],
    transformTags: {
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}
