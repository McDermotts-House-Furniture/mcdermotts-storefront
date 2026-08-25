import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingBlocks } from "@/components/landing/LandingBlocks";
import { LandingHero } from "@/components/landing/LandingHero";
import { getLandingPage, getLandingSlugs, type LandingPage } from "@/lib/landing-data";
import { getWpLandingPage, getWpLandingSlugs } from "@/lib/wp-content";

/* Marketing landing template — the prototype twin of the Flatsome pages the
   marketing team builds per range (henrik-sofa-range, xtra-life-plus-1600…).
   Content comes from the WP `landing-pages` custom post type when the
   mcdermotts-content plugin is installed; until then (and for the two ported
   demo pages) lib/landing-data.ts is the fallback, so the demo never breaks. */

interface LandingProps {
  params: Promise<{ slug: string }>;
}

async function resolvePage(slug: string): Promise<LandingPage | null> {
  return (await getWpLandingPage(slug)) ?? getLandingPage(slug) ?? null;
}

export async function generateStaticParams() {
  const wpSlugs = await getWpLandingSlugs();
  const slugs = new Set([...getLandingSlugs(), ...wpSlugs]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LandingProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) return {};
  return { title: page.title, description: page.standfirst };
}

export default async function LandingPageRoute({ params }: LandingProps) {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) notFound();

  return (
    <main>
      <LandingHero
        eyebrow={page.eyebrow}
        title={page.title}
        standfirst={page.standfirst}
        heroImage={page.heroImage}
        heroAlt={page.heroAlt}
        crumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      />
      <LandingBlocks blocks={page.blocks} />
    </main>
  );
}
