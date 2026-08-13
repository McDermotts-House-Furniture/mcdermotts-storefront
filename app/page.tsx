/* Homepage — nine blocks per the DS ui_kits/homepage brief (T4).
   Chrome (SiteHeader/SiteFooter) lives in app/layout.tsx. */

import { Departments } from "@/components/home/Departments";
import { ExclusiveBrands } from "@/components/home/ExclusiveBrands";
import { Hero } from "@/components/home/Hero";
import { Inspiration } from "@/components/home/Inspiration";
import { Newsletter } from "@/components/home/Newsletter";
import { SaleProvider, SaleToggle } from "@/components/home/SaleToggle";
import { Showrooms } from "@/components/home/Showrooms";
import { TopPicks } from "@/components/home/TopPicks";
import { Trust } from "@/components/home/Trust";
import { UnderOurRoof } from "@/components/home/UnderOurRoof";

export default function Home() {
  return (
    <SaleProvider>
      <main>
        <Hero />
        <Departments />
        <TopPicks />
        <ExclusiveBrands />
        <Inspiration />
        <Showrooms />
        <Trust />
        <UnderOurRoof />
        <Newsletter />
      </main>
      <SaleToggle />
    </SaleProvider>
  );
}
