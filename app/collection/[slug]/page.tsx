import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { SectionHeading } from "@/components/core/SectionHeading";
import { COLLECTIONS, getCollection } from "@/lib/collection-data";
import { getRangesByTags, type LandingPage } from "@/lib/landing-data";
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

/* Image fallback, 3-tier (spec §6): a config-specific photo beats the
   default image, which beats nothing — a default image with no note is
   never acceptable, since the customer filtered for that configuration and
   deserves to know whether the range actually comes that way. Only applies
   when the collection is itself a configuration (a "type" tag) — a brand or
   material collection has no "configuration" to be missing a photo of. */
function cardImageFor(
  range: LandingPage,
  queryTags: string[],
): { image: string; alt: string; descriptor?: string } {
  const typeTag = queryTags.map(getTag).find((t) => t?.kind === "type");
  if (typeTag) {
    const photo = range.configPhotos?.[typeTag.slug];
    if (photo) return { image: photo.src, alt: photo.alt };
    return {
      image: range.heroImage,
      alt: range.heroAlt,
      descriptor: `Also available as ${typeTag.label.toLowerCase()}`,
    };
  }
  return { image: range.heroImage, alt: range.heroAlt };
}

function brandFor(range: LandingPage): string | undefined {
  const brandTag = range.tags.map(getTag).find((t) => t?.kind === "brand");
  return brandTag?.label;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const ranges = getRangesByTags(collection.tags);

  return (
    <main>
      <div
        className="mx-auto w-full max-w-[var(--container-max)]"
        style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}
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
            className="mt-[var(--section-gap-title)] grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] p-0"
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
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
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
