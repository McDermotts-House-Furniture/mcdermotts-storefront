# Editorial content lives in WordPress custom post types, not Sanity

The prototype's landing-page block model (`lib/landing-data.ts`) was deliberately shaped
as a future Sanity schema, but we dropped Sanity before adopting it (2026-08-25): all
imagery, product data and editor logins already live in the client's WordPress/WooCommerce
install, so a second CMS would add a vendor, a bill, a migration of the media library and
a second login for marketing — for no editing capability they actually need. Instead, the
`wp-plugin/mcdermotts-content` plugin registers three custom post types (landing pages,
sofa models, mattress pages) with code-registered ACF Pro field groups whose flexible-content
layouts mirror the `LandingBlock` union one-to-one, read unauthenticated via `wp/v2` and
mapped in `lib/wp-content.ts`.

## Consequences

- **The field/layout names are a WP↔storefront contract.** Rename or add fields in the
  plugin and `lib/wp-content.ts` together, or not at all.
- **ACF Pro is a paid dependency** of the WP install (flexible content + repeaters).
- Products are referenced from content (relationship field / `belongs_to_model`), never
  duplicated — prices and stock always come live from the Store API.
- The two hardcoded pages in `lib/landing-data.ts` remain as a fallback and keep the demo
  working while the plugin is not yet installed; retire them once WP authors real content.
- Sanity-grade live preview is forgone; WP revisions + ISR (~1h, or redeploy) is the
  editing loop. Revisit only if editors actually complain.
