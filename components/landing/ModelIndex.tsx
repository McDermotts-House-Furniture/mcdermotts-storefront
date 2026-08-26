import { notFound } from "next/navigation";
import { EditorialCard } from "@/components/cards/EditorialCard";
import { SectionHeading } from "@/components/core/SectionHeading";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { MODEL_PATH, getModels, type ModelKind } from "@/lib/wp-content";

/* Index of every published model page of one kind. 404s until content
   exists in WP (pre-plugin the endpoint itself 404s), so the route only
   surfaces once there is something to show. */
export async function ModelIndex({
  kind,
  title,
  standfirst,
}: {
  kind: ModelKind;
  title: string;
  standfirst: string;
}) {
  const models = await getModels(kind);
  if (models.length === 0) notFound();

  return (
    <main>
      <SectionBlock tone="linen">
        <Reveal>
          <SectionHeading title={title} standfirst={standfirst} />
        </Reveal>
        <Reveal order={2}>
          <ul
            className="mt-[var(--section-gap-title)] grid list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "var(--grid-gap)" }}
          >
            {models.map((model) => (
              <li key={model.slug}>
                <EditorialCard
                  eyebrow={model.brand?.name ?? model.eyebrow}
                  title={model.title}
                  excerpt={model.standfirst || undefined}
                  href={`${MODEL_PATH[kind]}/${model.slug}`}
                  image={model.heroImage || undefined}
                  alt={model.heroAlt}
                  cta="Explore the range"
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </SectionBlock>
    </main>
  );
}
