import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { SectionHeading } from "@/components/core/SectionHeading";
import { COLLECTIONS, getCollection } from "@/lib/collection-data";
import { getRangesByTags, matchesShowroom, type LandingPage } from "@/lib/landing-data";
import { getTag } from "@/lib/tags";

/* Tag-driven collection page (sofa-section spec, §6). A collection is just
   a saved query against range tags — nothing hand-picked, so a range that's
   retagged or taken off display drops out (or in) automatically. */

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return { title: `${collection.title} — McDermott's House Furnishers`, description: collection.standfirst };
}

/* "Corner", "Accent Chair" → "a corner", "an accent chair" — the descriptor
   below reads as a sentence fragment, so it needs the right indefinite
   article, not just a lowercased label. "Modular" is the one type tag that
   isn't a noun at all ("available as modular", not "available as a
   modular") — carved out rather than guessed at grammatically. */
function withArticle(label: string): string {
  if (label === "Modular") return label.toLowerCase();
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `${article} ${label.toLowerCase()}`;
}

/* Image fallback, 3-tier (spec §6): a config-specific photo beats the
   default image, which beats nothing — a default image with no note is
   never acceptable, since the customer filtered for that configuration and
   deserves to know whether the range actually comes that way. Only applies
   when the collection is itself a configuration (a "type" tag) — a brand or
   material collection has no "configuration" to be missing a photo of.

   The descriptor itself shows regardless of which branch fires (Declan,
   2026-08-27: Mack was missing it — it has a real corner photo, so the code
   used to treat that as reason enough to skip the note; Declan wants it on
   every card on the page, real photo or not). Wording dropped "Also" too —
   on a page you're already viewing because it's the corner collection,
   "also" says nothing "available as a corner" doesn't — capitalised as
   "Available…" instead, same day, once it was the first word standing
   alone rather than following "Also". */
function cardImageFor(
  range: LandingPage,
  queryTags: string[],
): { image: string; alt: string; descriptor?: string } {
  const typeTag = queryTags.map(getTag).find((t) => t?.kind === "type");
  if (typeTag) {
    const descriptor = `Available as ${withArticle(typeTag.label)}`;
    const photo = range.configPhotos?.[typeTag.slug];
    if (photo) return { image: photo.src, alt: photo.alt, descriptor };
    return { image: range.heroImage, alt: range.heroAlt, descriptor };
  }
  return { image: range.heroImage, alt: range.heroAlt };
}

function brandFor(range: LandingPage): string | undefined {
  const brandTag = (range.tags ?? []).map(getTag).find((t) => t?.kind === "brand");
  return brandTag?.label;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  /* Showroom filter stacks on top of the tag query, not instead of it — a
     collection can be both (e.g. corner sofas on display in Ennis), even
     though the two collections built so far each only use one. */
  const ranges = getRangesByTags(collection.tags).filter((r) => matchesShowroom(r, collection.showroom));

  return (
    <main>
      <div
        /* --container-wide, not --container-max (Declan, 2026-08-27: "are
           you able to make them any larger?") — same token the site header
           runs at (1440px vs 1280px), so each of the 3 desktop cards gets a
           bit more room without changing the column count. */
        className="mx-auto w-full max-w-[var(--container-wide)]"
        /* Top halved (Declan, 2026-08-27: "reduce the gap between the bottom
           of the header, and the breadcrumbs") — same fix as the category
           and product pages. Bottom and the sides unchanged. */
        style={{
          paddingTop: "calc(var(--section-pad-y) / 2)",
          paddingBottom: "var(--section-pad-y)",
          paddingLeft: "var(--section-pad-x)",
          paddingRight: "var(--section-pad-x)",
        }}
      >
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: "Home", href: "/" },
            { label: "Sofas & Chairs", href: "/category/all-sofas" },
            { label: collection.title },
          ]}
        />
        <SectionHeading level="h1" eyebrow={collection.eyebrow} title={collection.title} standfirst={collection.standfirst} />

        {ranges.length > 0 ? (
          <ul
            /* lg:grid-cols-3, not part of the base rule (Declan, 2026-08-27:
               "3 columns instead of 4... make no changes to mobile") — the
               fluid auto-fit rule below lg is untouched, so mobile and
               tablet keep whatever column count they already had; only the
               desktop breakpoint is pinned to a fixed 3 instead of however
               many 220px-min tiles happened to fit (4, in a --container-max
               row). */
            className="mt-[var(--section-gap-title)] grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] p-0 lg:grid-cols-3"
            style={{ gap: "var(--grid-gap)" }}
          >
            {ranges.map((range) => {
              const { image, alt, descriptor } = cardImageFor(range, collection.tags);
              return (
                <li key={range.slug}>
                  <ProductCard
                    brand={brandFor(range)}
                    title={range.title}
                    descriptor={descriptor}
                    href={`/range/${range.slug}`}
                    image={image}
                    alt={alt}
                    /* 33vw at lg+, not 25vw — matches the new 3-column desktop
                       grid; below lg unchanged (still whatever the fluid
                       auto-fit grid actually renders at tablet width). */
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-8 max-w-[var(--measure-body)] text-[length:var(--fs-lead)] text-ink-soft">
            Nothing currently matches this collection online — call Castlebar on 094 90 22500 and we
            can talk you through what&apos;s on the floor right now.
          </p>
        )}
      </div>
    </main>
  );
}
