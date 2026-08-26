"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface SubcategoryLink {
  label: string;
  href: string;
}

/**
 * Scrollable subcategory chip bar — the six parent department pages only
 * (Declan, 2026-08-27: "all sofas, mattresses, bedroom furniture, living
 * room, dining room, and accessories"), not every category page.
 *
 * Right-edge fade (Declan, 2026-08-27: "always a subcategory pill half
 * showing on the right side, making it obvious there are more scrollable
 * items") — same technique SlidingGallery already uses for its photo strip:
 * a background-colour gradient over whatever pill sits at the boundary,
 * shown only while there's genuinely more to scroll (tracked via scroll
 * position, not just assumed). A real pill still overflows the visible
 * edge underneath it — the fade doesn't fake that, it makes the real cutoff
 * unmistakable instead of leaving it to whatever the exact pixel widths
 * happen to line up to.
 */
export function SubcategoryNav({ items }: { items: SubcategoryLink[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  /* False, not true, before the first measurement (Declan's "always" —
     SlidingGallery does the same for its own end-of-scroll state): assuming
     there IS more to scroll avoids a flash of no fade on first paint,
     corrected the instant the effect below measures the real overflow. */
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);
  /* clientX/scrollLeft at pointerdown, not state — read/written every
     pointermove, no need to re-render on each one. */
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  /* Past this many px of movement, a pointerdown-then-up on a pill is a
     drag, not a click — the click that still fires on release gets
     cancelled below, otherwise dragging across the strip and happening to
     release over a different pill would navigate there. */
  const dragMoved = useRef(false);

  const updateEnd = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtEnd(el.scrollLeft >= maxScroll - 4);
  };

  useEffect(() => {
    updateEnd();
    window.addEventListener("resize", updateEnd);
    return () => window.removeEventListener("resize", updateEnd);
  }, [items]);

  /* Hiding the native scrollbar (below) removed the only way a plain
     desktop mouse — no touchpad, no touch screen — could move this strip at
     all: a vertical wheel doesn't scroll a horizontal-only region by
     default, and there's no built-in click-and-drag on a div (Declan,
     2026-08-27: "currently isnt scrollable or draggable on desktop").
     Native listener + { passive: false }, not React's onWheel — wheel
     handlers React attaches are passive by default, so preventDefault()
     inside one is silently ignored. */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      /* Only take over a plain vertical scroll — an already-horizontal
         gesture (trackpad two-finger swipe, shift+wheel) passes through
         untouched, exactly like it did before. */
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* Click-and-drag, mouse only — touch/pen fall straight through to native
     scrolling untouched (that already worked). */
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    setDragging(true);
    dragMoved.current = false;
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!dragging) return;
    const el = scrollerRef.current;
    if (!el) return;
    const delta = e.clientX - dragStart.current.x;
    if (Math.abs(delta) > 5) dragMoved.current = true;
    el.scrollLeft = dragStart.current.scrollLeft - delta;
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!dragging) return;
    setDragging(false);
    scrollerRef.current?.releasePointerCapture(e.pointerId);
  };
  /* Capture phase, before the pill's own <Link> click handler runs. */
  const onClickCapture = (e: React.MouseEvent<HTMLUListElement>) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragMoved.current = false;
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label="Subcategories" className="relative mt-6">
      <ul
        ref={scrollerRef}
        onScroll={updateEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={`m-0 flex list-none gap-3 overflow-x-auto p-0 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {items.map((item) => (
          <li key={item.href} className="flex-none">
            {/* draggable={false} (Declan, 2026-08-27: drag only worked
                between the pills, not starting on one, on desktop) — links
                are natively draggable in every browser by default (drag one
                to a tab, the address bar…), and that built-in gesture was
                winning over the custom pointer-drag handlers on the <ul>,
                so a pointerdown starting on a pill itself never got there. */}
            <Link
              href={item.href}
              draggable={false}
              className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-hairline bg-white px-4 text-[length:var(--fs-small)] font-bold text-ink no-underline transition-colors duration-[var(--dur-base)] hover:border-ink hover:bg-stone"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {!atEnd && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-stone to-transparent"
        />
      )}
    </nav>
  );
}
