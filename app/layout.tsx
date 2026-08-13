import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: {
    default: "McDermott's House Furnishers — Castlebar & Ennis",
    template: "%s — McDermott's House Furnishers",
  },
  description:
    "Family-run furniture showrooms in Castlebar and Ennis since 1964. Sofas, mattresses, bedroom, dining and living furniture, delivered and assembled nationwide by our own crews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.variable}>
      <body>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
