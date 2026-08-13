import type { Metadata } from "next";
import { CartPageBody } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your cart",
};

export default function CartPage() {
  return <CartPageBody />;
}
