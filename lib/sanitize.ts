import sanitizeHtml from "sanitize-html";

/* Product copy comes from McDermott's own WordPress, but sanitize anyway so a
   compromised CMS can't inject script into the storefront. Keeps the benign
   markup WooCommerce actually uses in descriptions. */
export function sanitizeProductHtml(html: string): string {
  return sanitizeHtml(html, {
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
