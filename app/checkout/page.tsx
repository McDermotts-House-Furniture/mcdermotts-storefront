import type { Metadata } from "next";
import { SectionHeading } from "@/components/core/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getShippingConfig } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const shipping = await getShippingConfig();
  return (
    <main
      className="mx-auto w-full max-w-[var(--container-max)]"
      style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
    >
      <SectionHeading level="h1" title="Checkout" />
      <div className="mt-[var(--section-gap-title)]">
        <CheckoutForm shipping={shipping} />
      </div>
    </main>
  );
}
