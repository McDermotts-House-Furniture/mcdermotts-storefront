/* Header navigation with subcategory dropdowns. The top level stays the
   curated homepage nav; children come live from the Store API category tree
   (parent → child), so the menus track the real catalogue. */

import { homepage } from "@/lib/homepage-data";
import { getCategories, type StoreApiCategory } from "@/lib/store-api";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children: NavChild[];
}

const MAX_CHILDREN = 12;

const decodeEntities = (s: string) => s.replace(/&amp;/g, "&").replace(/&#038;/g, "&");

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
    return buildNavTree(homepage.nav, await getCategories());
  } catch {
    /* Header must render even if the catalogue is unreachable. */
    return homepage.nav.map((n) => ({ ...n, children: [] }));
  }
}
