"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";
import { ORDER_SNAPSHOT_KEY, type OrderSnapshot } from "@/components/checkout/CheckoutForm";
import { formatEuro, lineTotalMinorUnits } from "@/lib/money";

/* The order snapshot is written once by the checkout form; sessionStorage never
   changes underneath this page, so subscribe is a no-op and the parse is cached
   to keep the snapshot referentially stable. */
const subscribe = () => () => {};
let cachedRaw: string | null = null;
let cachedOrder: OrderSnapshot | null = null;

function readOrder(): OrderSnapshot | null {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(ORDER_SNAPSHOT_KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedOrder = raw ? (JSON.parse(raw) as OrderSnapshot) : null;
    } catch {
      cachedOrder = null;
    }
  }
  return cachedOrder;
}

export function Confirmation() {
  const router = useRouter();
  const order = useSyncExternalStore(subscribe, readOrder, () => null);

  /* Arriving here without an order (deep link, refresh after the session
     ended) goes home. Guarded on the client only — the server snapshot is
     always null. */
  useEffect(() => {
    if (readOrder() === null) router.replace("/");
  }, [router]);

  if (!order) return null;

  return (
    <div className="mx-auto max-w-[var(--container-narrow)]">
      <EyebrowLabel>Order {order.reference} · Prototype</EyebrowLabel>
      <h1
        className="mt-2 uppercase"
        style={{
          fontSize: "var(--fs-h2)",
          fontWeight: 700,
          lineHeight: "var(--lh-heading)",
          letterSpacing: "var(--ls-heading)",
        }}
      >
        That&apos;s the easy part done
      </h1>
      <p className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)]">
        Thanks, {order.name.split(" ")[0]}. A confirmation is on its way to {order.email}.
        In the real build, this order would now be in WooCommerce with payment taken.
      </p>

      <div className="mt-10 rounded-md border border-hairline bg-white p-6 shadow-card">
        <h2 className="text-[length:var(--fs-h4)] font-bold uppercase tracking-heading">
          What you ordered
        </h2>
        <ul className="mt-4 grid list-none gap-2 p-0">
          {order.items.map((item) => (
            <li key={item.name} className="flex justify-between gap-4">
              <span>
                {item.name}
                {item.quantity > 1 && <span className="text-ink-soft"> × {item.quantity}</span>}
              </span>
              <span className="font-bold">
                {formatEuro(lineTotalMinorUnits(item.priceMinorUnits, item.quantity))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between gap-4 border-t border-hairline pt-3">
          <span className="font-bold uppercase tracking-heading">Total</span>
          <span className="text-[length:var(--fs-h3)] font-bold">
            {formatEuro(order.subtotalMinorUnits)}
          </span>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-[length:var(--fs-h4)] font-bold uppercase tracking-heading">
          What happens next
        </h2>
        <p className="mt-3 max-w-[var(--measure-body)]">
          Our own crews deliver and assemble everywhere in Ireland — led by a core team with
          140 years&apos; combined experience. We&apos;d ring ahead to agree a delivery day
          for {order.town}, Co. {order.county}, and there&apos;s one contribution fee with no
          surprise charges on the day.
        </p>
      </div>

      <div className="mt-10">
        <Button href="/">Back to the showroom</Button>
      </div>
    </div>
  );
}
