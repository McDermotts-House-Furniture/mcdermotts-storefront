/* CMS-authored pages from WordPress custom post types, replacing the
   hardcoded lib/landing-data.ts once the mcdermotts-content plugin (see
   wp-plugin/ in the repo root) is installed with ACF Pro on mcdermotts.ie.

   Three types, one shared block library:
     wp/v2/landing-pages  → LandingPage (the existing /range template)
     wp/v2/sofa-models    → ModelDoc kind "sofa"     (/sofas/[slug])
     wp/v2/mattresses     → ModelDoc kind "mattress" (/mattresses/[slug])
   plus `belongs_to_model` on wp/v2/product linking a PDP up to its model.

   Every fetch degrades to null/[]: before the plugin is installed the
   endpoints 404 and callers fall back (range pages use the local data,
   model routes 404, PDPs simply omit the model link). ACF flexible-content
   layout names mirror the LandingBlock union — change both or neither. */

import { decodeEntities } from "./html";
import type { LandingBlock, LandingPage } from "./landing-data";

const WP_API_BASE = "https://mcdermotts.ie/wp-json/wp/v2";
const REVALIDATE_SECONDS = 3600;

export type ModelKind = "sofa" | "mattress";

const REST_BASE: Record<ModelKind, string> = {
  sofa: "sofa-models",
  mattress: "mattresses",
};

export const MODEL_PATH: Record<ModelKind, string> = {
  sofa: "/sofas",
  mattress: "/mattresses",
};

/* WP post_type names (plugin) → storefront kind. */
const POST_TYPE_KIND: Record<string, ModelKind> = {
  mcd_sofa_model: "sofa",
  mcd_mattress: "mattress",
};

/* Select/checkbox values arrive as the stored keys; labels live here so the
   REST payload stays stable if wording changes. Mirrors the plugin choices. */
const FIRMNESS_LABELS: Record<string, string> = {
  soft: "Soft",
  medium: "Medium",
  "medium-firm": "Medium-firm",
  firm: "Firm",
};
const TURN_LABELS: Record<string, string> = {
  "no-turn": "No-turn — no flipping needed",
  turnable: "Turnable — flip seasonally",
  rotate: "Rotate only",
};
const SIZE_LABELS: Record<string, string> = {
  single: "Single",
  "small-double": "Small Double",
  double: "Double",
  king: "King",
  "super-king": "Super King",
};

/** Brand identity on a model page — name feeds facts/index cards, the logo
    renders above the page title. */
export interface ModelBrand {
  name?: string;
  logo?: { src: string; alt: string; width?: number; height?: number };
}

/** A sofa-model or mattress page: hero + "at a glance" facts + shared blocks. */
export interface ModelDoc {
  kind: ModelKind;
  slug: string;
  title: string;
  eyebrow: string;
  standfirst: string;
  heroImage: string;
  heroAlt: string;
  brand?: ModelBrand;
  facts: { label: string; value: string }[];
  blocks: LandingBlock[];
}

/** Resolved product → model link for the PDP's range band. */
export interface ModelRef {
  kind: ModelKind;
  slug: string;
  title: string;
  standfirst?: string;
  href: string;
}

/* ---------------------------------------------------------------- helpers */

type Rec = Record<string, unknown>;

const asRec = (v: unknown): Rec | null =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;

const num = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return undefined;
};

/* Editors write one textarea; blank lines separate paragraphs. */
export function splitParagraphs(body: unknown): string[] {
  if (typeof body !== "string") return [];
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p !== "");
}

/* ACF image (return_format array, acf_format=standard) → src + alt (+ the
   intrinsic size, which fixed-size renders like the brand logo need). */
function imageOf(v: unknown): { src: string; alt: string; width?: number; height?: number } {
  const img = asRec(v);
  return {
    src: str(img?.url) ?? "",
    alt: str(img?.alt) ?? "",
    width: num(img?.width),
    height: num(img?.height),
  };
}

/* ---------------------------------------------------------------- mappers */

/* One flexible-content row → one LandingBlock. Unknown layouts and rows the
   editor left effectively empty map to null and are dropped. */
function mapBlock(raw: unknown): LandingBlock | null {
  const row = asRec(raw);
  if (!row) return null;
  switch (row.acf_fc_layout) {
    case "editorial": {
      const paragraphs = splitParagraphs(row.body);
      if (paragraphs.length === 0) return null;
      return { type: "editorial", title: str(row.title), paragraphs };
    }
    case "features": {
      const items = (Array.isArray(row.items) ? row.items : [])
        .map((item) => {
          const r = asRec(item);
          const title = str(r?.title);
          const body = str(r?.body);
          return title && body ? { title, body } : null;
        })
        .filter((i): i is { title: string; body: string } => i !== null);
      if (items.length === 0) return null;
      return { type: "features", title: str(row.title) ?? "Key features", items };
    }
    case "specs": {
      const items = (Array.isArray(row.items) ? row.items : [])
        .map((item) => {
          const r = asRec(item);
          const label = str(r?.label);
          const value = str(r?.value);
          return label && value ? { label, value } : null;
        })
        .filter((i): i is { label: string; value: string } => i !== null);
      if (items.length === 0) return null;
      return { type: "specs", title: str(row.title) ?? "Detail", items };
    }
    case "products": {
      /* Relationship (return_format id) → number[]; tolerate embedded posts. */
      const ids = (Array.isArray(row.products) ? row.products : [])
        .map((p) => num(p) ?? num(asRec(p)?.ID))
        .filter((id): id is number => id !== undefined);
      const search = str(row.search);
      if (ids.length === 0 && !search) return null;
      return {
        type: "products",
        title: str(row.title) ?? "Shop the range",
        standfirst: str(row.standfirst),
        ids: ids.length > 0 ? ids : undefined,
        search: ids.length > 0 ? undefined : search,
      };
    }
    case "showroom": {
      const body = str(row.body);
      if (!body) return null;
      return { type: "showroom", title: str(row.title) ?? "See it in the showroom", body };
    }
    case "call_cta":
      return { type: "callCta", title: str(row.title) ?? "Talk to the team", body: str(row.body) };
    default:
      return null;
  }
}

export function mapBlocks(raw: unknown): LandingBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapBlock).filter((b): b is LandingBlock => b !== null);
}

interface WpDoc {
  id?: unknown;
  slug?: unknown;
  title?: { rendered?: unknown };
  acf?: unknown;
}

function docBasics(doc: WpDoc) {
  const slug = str(doc.slug);
  const title = str(doc.title?.rendered);
  if (!slug || !title) return null;
  const acf = asRec(doc.acf) ?? {};
  return { slug, title: decodeEntities(title), acf };
}

export function mapLandingDoc(doc: WpDoc): LandingPage | null {
  const basics = docBasics(doc);
  if (!basics) return null;
  const { slug, title, acf } = basics;
  const hero = imageOf(acf.hero_image);
  return {
    slug,
    title,
    eyebrow: str(acf.eyebrow) ?? "Introducing…",
    standfirst: str(acf.standfirst) ?? "",
    heroImage: hero.src,
    heroAlt: hero.alt || title,
    blocks: mapBlocks(acf.blocks),
  };
}

export function mapModelDoc(kind: ModelKind, doc: WpDoc): ModelDoc | null {
  const basics = docBasics(doc);
  if (!basics) return null;
  const { slug, title, acf } = basics;
  const hero = imageOf(acf.hero_image);

  const brandName = str(acf.brand_name);
  const logo = imageOf(acf.brand_logo);
  const brand: ModelBrand | undefined =
    brandName || logo.src
      ? {
          name: brandName,
          logo: logo.src ? { ...logo, alt: logo.alt || `${brandName ?? title} logo` } : undefined,
        }
      : undefined;

  const facts: { label: string; value: string }[] = [];
  const fact = (label: string, value: string | undefined) => {
    if (value) facts.push({ label, value });
  };
  fact("Brand", brandName);
  if (kind === "sofa") {
    fact("Fabrics", str(acf.fabric_note));
    const configurations = (Array.isArray(acf.configurations) ? acf.configurations : [])
      .map((c) => str(asRec(c)?.name))
      .filter((n): n is string => n !== undefined);
    fact("Configurations", configurations.join(" · ") || undefined);
    fact("Guarantee", str(acf.guarantee));
  } else {
    fact("Firmness", FIRMNESS_LABELS[str(acf.firmness) ?? ""]);
    fact("Height", str(acf.mattress_height));
    fact("Care", TURN_LABELS[str(acf.turn_type) ?? ""]);
    const sizes = (Array.isArray(acf.sizes) ? acf.sizes : [])
      .map((s) => SIZE_LABELS[str(s) ?? ""])
      .filter((s): s is string => s !== undefined);
    fact("Sizes", sizes.join(" · ") || undefined);
    fact("Trial", str(acf.trial));
  }

  return {
    kind,
    slug,
    title,
    eyebrow: str(acf.eyebrow) ?? (kind === "sofa" ? "Sofa range" : "Mattress"),
    standfirst: str(acf.standfirst) ?? "",
    heroImage: hero.src,
    heroAlt: hero.alt || title,
    brand,
    facts,
    blocks: mapBlocks(acf.blocks),
  };
}

/* ---------------------------------------------------------------- fetchers */

/* Same defence as lib/store-api: the WP host intermittently answers with an
   HTML error page, so validate the content type and retry once. Unlike the
   Store API these endpoints may legitimately not exist yet (plugin not
   installed), so failure is null, never a throw. */
async function wpFetchJson(url: string): Promise<unknown | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("json")) continue;
      return await res.json();
    } catch {
      /* retry once, then give up */
    }
  }
  return null;
}

function collectionUrl(restBase: string, params: Record<string, string>): string {
  const url = new URL(`${WP_API_BASE}/${restBase}`);
  url.searchParams.set("acf_format", "standard");
  url.searchParams.set("_fields", "id,slug,title,acf");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

async function fetchDocs(restBase: string, params: Record<string, string> = {}): Promise<WpDoc[]> {
  const json = await wpFetchJson(collectionUrl(restBase, { per_page: "100", ...params }));
  return Array.isArray(json) ? (json as WpDoc[]) : [];
}

export async function getWpLandingPage(slug: string): Promise<LandingPage | null> {
  const docs = await fetchDocs("landing-pages", { slug });
  return docs[0] ? mapLandingDoc(docs[0]) : null;
}

export async function getWpLandingSlugs(): Promise<string[]> {
  const docs = await fetchDocs("landing-pages");
  return docs.map((d) => str(d.slug)).filter((s): s is string => s !== undefined);
}

export async function getModel(kind: ModelKind, slug: string): Promise<ModelDoc | null> {
  const docs = await fetchDocs(REST_BASE[kind], { slug });
  return docs[0] ? mapModelDoc(kind, docs[0]) : null;
}

export async function getModels(kind: ModelKind): Promise<ModelDoc[]> {
  const docs = await fetchDocs(REST_BASE[kind]);
  return docs.map((d) => mapModelDoc(kind, d)).filter((m): m is ModelDoc => m !== null);
}

const refOf = (model: ModelDoc): ModelRef => ({
  kind: model.kind,
  slug: model.slug,
  title: model.title,
  standfirst: model.standfirst || undefined,
  href: `${MODEL_PATH[model.kind]}/${model.slug}`,
});

/* The product's ACF `belongs_to_model` value (post_object, return_format id).
   Normally a bare id; tolerate an embedded post object too. */
export async function resolveModelRef(ref: unknown): Promise<ModelRef | null> {
  const embedded = asRec(ref);
  const id = num(ref) ?? num(embedded?.ID);
  if (embedded) {
    const kind = POST_TYPE_KIND[str(embedded.post_type) ?? ""];
    const slug = str(embedded.post_name);
    const title = str(embedded.post_title);
    if (kind && slug && title) {
      return {
        kind,
        slug,
        title: decodeEntities(title),
        href: `${MODEL_PATH[kind]}/${slug}`,
      };
    }
  }
  if (id === undefined) return null;
  /* Only the id: it belongs to one of two types — ask both, take the hit. */
  const [sofas, mattresses] = await Promise.all([
    fetchDocs(REST_BASE.sofa, { include: String(id) }),
    fetchDocs(REST_BASE.mattress, { include: String(id) }),
  ]);
  const model =
    (sofas[0] && mapModelDoc("sofa", sofas[0])) ||
    (mattresses[0] && mapModelDoc("mattress", mattresses[0]));
  return model ? refOf(model) : null;
}
