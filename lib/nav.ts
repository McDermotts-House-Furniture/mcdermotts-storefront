/* Header navigation with subcategory dropdowns. The top level stays the

   curated homepage nav; children come live from the Store API category tree
   (parent → child), so the menus track the real catalogue. */

import { decodeEntities } from "./html";

import { homepage } from "@/lib/homepage-data";
import { getCategories, type StoreApiCategory } from "@/lib/store-api";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  children: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children: NavChild[];
  /** Hand-authored multi-column override (see MEGA_MENUS below). When set, the
      header renders these columns instead of the flat auto-derived `children`. */
  sections?: NavSection[];
}

const MAX_CHILDREN = 12;

/* Sofas & Chairs mega menu — mirrors mcdermotts.ie's live nav structure
   (fetched 2026-08-25). "Browse All" and "Sofa Brands" point at /collection/
   stub pages (the future tag-driven collection pages aren't built yet);
   "Buy Sofas Online" points at the WooCommerce categories that already work
   here today. */
const SOFA_MEGA_MENU: NavSection[] = [
  {
    title: "Browse All Sofas & Chairs",
    children: [
      { label: "Full Collection", href: "/collection/full-collection" },
      { label: "Corner Sofa Collection", href: "/collection/corner-sofa-collection" },
      { label: "Leather Collection", href: "/collection/leather-collection" },
      { label: "Recliner Collection", href: "/collection/recliner-collection" },
      { label: "Lift & Tilt Chairs", href: "/collection/lift-and-tilt-chairs" },
      { label: "Sofa Bed Collection", href: "/collection/sofa-bed-collection" },
      { label: "Ennis Collection", href: "/collection/ennis-collection" },
    ],
  },
  {
    title: "Sofa Brands",
    children: [
      { label: "Fama", href: "/collection/fama" },
      { label: "Parker Knoll", href: "/collection/parker-knoll" },
      { label: "Orla Kiely", href: "/collection/orla-kiely" },
      { label: "Alexander & James", href: "/collection/alexander-and-james" },
      { label: "Stressless®", href: "/collection/stressless" },
      { label: "Aquaclean®", href: "/collection/aquaclean" },
      { label: "La-Z-Boy", href: "/collection/la-z-boy" },
    ],
  },
  {
    title: "Buy Sofas Online",
    children: [
      { label: "2 Seater Sofas", href: "/category/2-seater-sofas" },
      { label: "3 Seater Sofas", href: "/category/3-seater-sofas" },
      { label: "4 Seater Sofas", href: "/category/4-seater-sofas" },
      { label: "Armchairs & Snugglers", href: "/category/armchairs-and-snugglers" },
      { label: "Corner Sofas", href: "/category/corner-sofas" },
      { label: "Sofa Beds", href: "/category/sofabeds" },
      { label: "All Leather Sofas", href: "/category/leather-sofas" },
      { label: "All Fabric Sofas", href: "/category/fabric-sofas" },
      { label: "Footstools", href: "/category/footstools" },
    ],
  },
];

const MEGA_MENUS: Record<string, NavSection[]> = {
  "Sofas & Chairs": SOFA_MEGA_MENU,
};

/** Attach hand-authored multi-column menus where the flat auto-derived list isn't enough. */
export function withMegaMenus(tree: NavItem[]): NavItem[] {
  return tree.map((item) => (MEGA_MENUS[item.label] ? { ...item, sections: MEGA_MENUS[item.label] } : item));
}

export function buildNavTree(
  navConfig: readonly { label: string; href: string }[],
  categories: StoreApiCategory[],
): NavItem[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return navConfig.map((item) => {
    const slug = item.href.startsWith("/category/") ? item.href.slice("/category/".length) : null;
    const category = slug ? bySlug.get(slug) : undefined;
    const children = category
      ? categories
          .filter((c) => c.parent === category.id && c.count > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, MAX_CHILDREN)
          .map((c) => ({ label: decodeEntities(c.name), href: `/category/${c.slug}` }))
      : [];
    return { label: item.label, href: item.href, children };
  });
}

export async function getNavTree(): Promise<NavItem[]> {
  try {
    return withMegaMenus(buildNavTree(homepage.nav, await getCategories()));
  } catch {
    /* Header must render even if the catalogue is unreachable. Mega menus are
       hand-authored, not catalogue-derived, so they still work here. */
    return withMegaMenus(homepage.nav.map((n) => ({ ...n, children: [] })));
  }
}
