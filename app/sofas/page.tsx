import type { Metadata } from "next";
import { ModelIndex } from "@/components/landing/ModelIndex";

export const metadata: Metadata = {
  title: "Sofa ranges",
  description: "Every sofa range under our roof — comfort, cover options and configurations.",
};

export default function SofasIndexPage() {
  return (
    <ModelIndex
      kind="sofa"
      title="Sofa ranges"
      standfirst="Every range under our roof — and on the floor in Castlebar and Ennis."
    />
  );
}
