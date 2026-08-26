import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPageView } from "@/components/landing/ModelPageView";
import { getModel, getModels } from "@/lib/wp-content";

/* Sofa model pages — authored in WP admin (Sofa Models), rendered here.
   These sit alongside the Woo PDPs: the model page is the range story, the
   PDPs underneath stay the buyable products. */

interface SofaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const models = await getModels("sofa");
  return models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: SofaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModel("sofa", slug);
  if (!model) return {};
  return { title: model.title, description: model.standfirst };
}

export default async function SofaModelPage({ params }: SofaPageProps) {
  const { slug } = await params;
  const model = await getModel("sofa", slug);
  if (!model) notFound();
  return <ModelPageView model={model} indexHref="/sofas" indexLabel="Sofas" />;
}
