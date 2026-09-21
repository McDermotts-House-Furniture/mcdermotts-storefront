import type { ReactNode } from "react";

/* Product stage — the PDP's two-column frame. The media column is sticky: on
   desktop the photography stays in view for the whole scroll while the detail
   column moves. Below lg the columns stack and stickiness is dropped.
   CSS-only — no resize listeners. */
export function ProductStage({ media, children }: { media: ReactNode; children: ReactNode }) {
  return (
    <div className="grid items-start gap-[var(--grid-gap)] lg:grid-cols-2 lg:gap-16">
      {/* min-w-0: this grid item's default min-width is auto (its content's
          natural size), not 0. Below lg it's the whole first row on its own
          — the mobile gallery's scroll-snap carousel (a flex row of `w-full`
          slides) resolves that `100%` against its own container's width,
          which is circular while this item is unconstrained, so it fell
          back to each slide's intrinsic size and dragged the whole grid,
          and the page along with it, wider than the viewport (Declan,
          2026-09-03: "still cant tap on any swatches... images are still
          on the left" — confirmed by measuring the actual DOM: the
          carousel <ul> alone was rendering at 1688px on a 390px screen). */}
      <div className="min-w-0 pdp-sticky-media">{media}</div>
      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  );
}
