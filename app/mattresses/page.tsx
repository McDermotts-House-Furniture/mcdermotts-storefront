import type { Metadata } from "next";
import { ModelIndex } from "@/components/landing/ModelIndex";

export const metadata: Metadata = {
  title: "Mattresses",
  description: "Our mattress lines — firmness, sizes and what each one is built from.",
};

export default function MattressesIndexPage() {
  return (
    <ModelIndex
      kind="mattress"
      title="Mattresses"
      standfirst="Find the right feel — from soft to firm, single to super king."
    />
  );
}
