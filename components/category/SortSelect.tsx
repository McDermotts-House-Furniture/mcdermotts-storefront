"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/lib/store-api";

const options: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

export function SortSelect({ current }: { current: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-3">
      <span className="text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft">
        Sort by
      </span>
      <select
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          params.set("sort", e.target.value);
          params.delete("page"); // a new order restarts at page 1
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="min-h-[var(--tap-min)] cursor-pointer rounded-sm border border-hairline bg-white px-3 py-2 text-[length:var(--fs-small)] text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
