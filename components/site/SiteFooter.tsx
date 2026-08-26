/* Site footer — theme chrome. Opening hours live in block 06 only, never here.
   Shop links resolve to internal category routes (slugs verified in lib/homepage-data);
   the rest keep the kit's placeholder targets or known mcdermotts.ie pages. */

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { TextLink } from "@/components/core/TextLink";

interface FooterLink {
  label: string;
  href: string;
}

const cols: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Shop",
    links: [
      { label: "Sofas", href: "/category/all-sofas" },
      { label: "Mattresses", href: "/category/all-mattresses" },
      { label: "Dining tables", href: "/category/dining-room-furniture" },
      { label: "Living room", href: "/category/living-room-furniture" },
      { label: "Accessories", href: "/category/all-accessories" },
      { label: "Outlet", href: "/category/cracking-brand-clearance" },
    ],
  },
  {
    title: "More information",
    links: [
      { label: "Get in touch", href: "#top" },
      { label: "About us", href: "https://mcdermotts.ie/about/" },
      { label: "Find us", href: "/about/find-us" },
      { label: "Delivery information", href: "#top" },
      { label: "Returns policy", href: "#top" },
      { label: "Careers at McDermott's", href: "#top" },
    ],
  },
  {
    title: "Our top brands",
    links: [
      { label: "Fama", href: "#top" },
      { label: "XOOON", href: "/category/xooon-ireland" },
      { label: "Stressless", href: "#top" },
      { label: "Parker Knoll", href: "#top" },
      { label: "Harrison Spinks", href: "#top" },
      { label: "Willis & Gambier", href: "#top" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const cls =
    "text-[length:var(--fs-small)] text-on-dark-muted no-underline transition-[color] duration-[var(--dur-base)] ease-out hover:text-on-dark";
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={cls}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={cls}>
      {link.label}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-dark px-[var(--section-pad-x)] py-[var(--section-pad-y-tight)] text-on-dark">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-10 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,1fr))]">
        <div className="flex flex-col gap-4">
          <Logo width={200} className="text-on-dark" />
          <p className="m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-on-dark-muted">
            Family-run on Spencer Street, Castlebar since 1964, and on Station Road, Ennis since
            2025.
          </p>
          <TextLink tone="dark" href="mailto:sales@mcdermotts.ie" arrow={false}>
            sales@mcdermotts.ie
          </TextLink>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-3">
            <h2 className="m-0 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-gold">
              {c.title}
            </h2>
            {c.links.map((l) => (
              <FooterLinkItem key={l.label} link={l} />
            ))}
          </nav>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[var(--container-max)] text-[length:var(--fs-micro)] uppercase tracking-eyebrow text-on-dark-muted">
        Copyright 2026 &copy; McDermott&rsquo;s House Furnishers
      </p>
    </footer>
  );
}
