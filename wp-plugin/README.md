# McDermott's Content Types — WordPress plugin

Adds three headless content types to the live WordPress/WooCommerce install, authored in
WP admin and rendered by the Next.js storefront (nothing changes on the Flatsome site):

| WP admin menu   | REST endpoint             | Storefront route      |
| --------------- | ------------------------- | --------------------- |
| Landing Pages   | `wp/v2/landing-pages`     | `/range/[slug]`       |
| Sofa Models     | `wp/v2/sofa-models`       | `/sofas/[slug]`       |
| Mattress Pages  | `wp/v2/mattresses`        | `/mattresses/[slug]`  |

It also adds a **"Belongs to model"** field to every WooCommerce product (Product edit
screen, "Storefront: model link" box). Set it and the storefront product page shows a
"Part of the range" band linking up to the model page.

All field groups are registered in code — there is nothing to build in the ACF admin UI.

## Install (once)

1. **Buy + install ACF Pro** (advancedcustomfields.com → licences). Upload via
   Plugins → Add New → Upload Plugin, activate, enter the licence key.
   The free ACF is not enough — the field groups use Flexible Content and Repeaters (Pro).
2. Upload `mcdermotts-content.zip` the same way and activate it.
   (If ACF Pro is missing you'll see a red admin notice instead of broken screens.)
3. Sanity-check: open `https://mcdermotts.ie/wp-json/wp/v2/landing-pages` in a browser —
   an empty JSON array `[]` means it's live.

No storefront deploy is needed — the Next.js site already reads these endpoints and falls
back gracefully while they're empty. New/edited pages appear within the ISR window
(~1 hour) or immediately after a redeploy.

## Authoring

- **Title** = the page heading; **slug** (URL) is edited under the title. Publish to go live.
- Every type has: eyebrow, standfirst, hero image (alt text comes from the media library),
  and a **Page blocks** builder — Editorial, Feature grid, Specification list, Product grid,
  Showroom CTA, Call CTA. Blocks can be added in any order and reordered by drag.
- **Product grid**: pick products from the searchable list — prices/stock always render
  live from the shop. The "catalogue search" text field is a fallback used only when no
  products are picked. Showroom-only ranges: pick nothing and the grid simply doesn't render.
- **Sofa Models** add: fabric note, configurations, guarantee → the "At a glance" panel.
- **Mattress Pages** add: firmness, height, care (no-turn/turnable), sizes, trial → same panel.
- Both also take a **brand name + logo**: the name leads the "At a glance" panel and the
  index cards; the logo (transparent PNG/SVG from the media library) sits above the page
  title on a white plate. Leave both blank for own-label ranges.
- Editorial body: separate paragraphs with a blank line.

## Changing the schema later

Field names and block layout names are a contract with the storefront
(`storefront/lib/wp-content.ts` + this plugin). Rename/add fields in both places or neither.
