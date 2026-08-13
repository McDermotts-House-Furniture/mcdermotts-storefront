"use client";

/* Site header — theme chrome. Wordmark, find-us link, live cart count, category nav.
   The only sticky element on the page. No icons: the DS has none. */

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/core/Button";
import { useCart } from "@/components/cart/CartProvider";
import { homepage } from "@/lib/homepage-data";

export function SiteHeader() {
  const { count, hydrated } = useCart();
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-linen">
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
        className="mx-auto flex max-w-[var(--container-wide)] gap-6 overflow-x-auto px-[var(--section-pad-x)] pt-3.5 pb-4"
      >
        {homepage.nav.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className="inline-flex min-h-[var(--tap-min)] items-end whitespace-nowrap border-b-2 border-transparent pb-1 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-[.1em] text-ink no-underline transition-[border-color] duration-[var(--dur-base)] ease-out hover:border-gold"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
