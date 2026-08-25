import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPageView } from "@/components/landing/ModelPageView";
import { getModel, getModels } from "@/lib/wp-content";

/* Mattress pages — authored in WP admin (Mattress Pages), rendered here.
   Same shape as sofa models with mattress-specific facts (firmness, sizes,
   care, trial). */

interface MattressPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const models = await getModels("mattress");
  return models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: MattressPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModel("mattress", slug);
  if (!model) return {};
  return { title: model.title, description: model.standfirst };
}

export default async function MattressPage({ params }: MattressPageProps) {
  const { slug } = await params;
  const model = await getModel("mattress", slug);
  if (!model) notFound();
  return <ModelPageView model={model} indexHref="/mattresses" indexLabel="Mattresses" />;
}
