"use client";

/* Site header — theme chrome. Wordmark, find-us link, live cart count, category
   nav with subcategory dropdowns (desktop only — the mobile nav scrolls
   horizontally, so taps go straight to the category page). The only sticky
   element on the page. No icons: the DS has none. */

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/core/Button";
import { useCart } from "@/components/cart/CartProvider";
import type { NavItem } from "@/lib/nav";

export function SiteHeader({ nav }: { nav: NavItem[] }) {
  const { count, hydrated } = useCart();
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-stone">
      <div className="mx-auto flex max-w-[var(--container-wide)] items-center justify-between gap-8 px-[var(--section-pad-x)] pt-[18px]">
        <Logo href="/" width={230} />
        <div className="flex items-center gap-6">
          <Link
            href="/#mcd-06-showrooms"
            className="inline-flex min-h-[var(--tap-min)] items-center text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink no-underline"
          >
            Find us
          </Link>
          <Button size="sm" variant="secondary" href="/cart">
            Cart{hydrated ? ` (${count})` : ""}
          </Button>
        </div>
      </div>
      <nav
        aria-label="Departments"
        className="mx-auto flex max-w-[var(--container-wide)] gap-6 overflow-x-auto px-[var(--section-pad-x)] pt-3.5 pb-4 lg:overflow-x-visible"
      >
        {nav.map((item) => (
          <div key={item.label} className="group relative">
            <Link
              href={item.href}
              aria-haspopup={item.children.length > 0 ? "true" : undefined}
              className="inline-flex min-h-[var(--tap-min)] items-end whitespace-nowrap border-b-2 border-transparent pb-1 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-[.1em] text-ink no-underline transition-[border-color] duration-[var(--dur-base)] ease-out group-hover:border-gold hover:border-gold"
            >
              {item.label}
            </Link>
            {item.children.length > 0 && (
              /* The pt-4 spacer bridges the hover gap to the nav's bottom
                 padding so the menu doesn't close crossing it. */
              <div className="pointer-events-none invisible absolute left-0 top-full z-30 pt-4 opacity-0 transition-[opacity,visibility] duration-[var(--dur-base)] ease-out lg:group-hover:pointer-events-auto lg:group-hover:visible lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:visible lg:group-focus-within:opacity-100">
                <ul className="m-0 min-w-56 list-none rounded-md border border-hairline bg-white p-2 shadow-raised">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="flex min-h-[var(--tap-min)] items-center whitespace-nowrap px-4 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-[.1em] text-ink no-underline transition-colors duration-[var(--dur-base)] hover:text-gold-deep"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-hairline pt-1">
                    <Link
                      href={item.href}
                      className="flex min-h-[var(--tap-min)] items-center whitespace-nowrap px-4 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-[.1em] text-gold-deep no-underline transition-colors duration-[var(--dur-base)] hover:text-ink"
                    >
                      Browse everything →
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}
