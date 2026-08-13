"use client";

/* Dev toggle pill (bottom-right) switching the SALE ON / EVERGREEN copy states.
   Only blocks 01 (Hero) and 03 (TopPicks) change; everything else is evergreen.
   Ships with SALE ON per CONTEXT.md decision 7. */

import { createContext, useContext, useState, type ReactNode } from "react";

interface SaleContextValue {
  sale: boolean;
  setSale: (sale: boolean) => void;
}

const SaleContext = createContext<SaleContextValue>({
  sale: true,
  setSale: () => {},
});

/** Read the current sale state inside blocks 01 + 03. */
export function useSale(): boolean {
  return useContext(SaleContext).sale;
}

export function SaleProvider({ children }: { children: ReactNode }) {
  const [sale, setSale] = useState(true);
  return <SaleContext.Provider value={{ sale, setSale }}>{children}</SaleContext.Provider>;
}

const pillButton =
  "cursor-pointer rounded-full border-0 bg-transparent px-4 py-[9px] font-sans text-[11px] font-bold uppercase tracking-[.1em] transition-[background-color,color] duration-[var(--dur-base)] ease-out";

export function SaleToggle() {
  const { sale, setSale } = useContext(SaleContext);
  return (
    <div
      role="group"
      aria-label="Sale state"
      className="fixed right-[18px] bottom-[18px] z-40 flex gap-[2px] rounded-full bg-darker p-1 shadow-raised"
    >
      <button
        type="button"
        aria-pressed={sale}
        onClick={() => setSale(true)}
        className={`${pillButton} ${sale ? "bg-gold text-ink" : "text-on-dark-muted"}`}
      >
        Sale on
      </button>
      <button
        type="button"
        aria-pressed={!sale}
        onClick={() => setSale(false)}
        className={`${pillButton} ${!sale ? "bg-gold text-ink" : "text-on-dark-muted"}`}
      >
        Evergreen
      </button>
    </div>
  );
}
