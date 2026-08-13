import type { ReactNode } from "react";

/* Product stage — the PDP's two-column frame. The media column is sticky: on
   desktop the photography stays in view for the whole scroll while the detail
   column moves. Below lg the columns stack and stickiness is dropped.
   CSS-only — no resize listeners. */
export function ProductStage({ media, children }: { media: ReactNode; children: ReactNode }) {
  return (
    <div className="grid items-start gap-[var(--grid-gap)] lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-[calc(var(--header-height)+var(--sp-6))] lg:self-start">
        {media}
      </div>
      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  );
}
