import type { Metadata } from "next";
import { Confirmation } from "@/components/checkout/Confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <main
      className="mx-auto w-full max-w-[var(--container-max)]"
      style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
    >
      <Confirmation />
    </main>
  );
}
