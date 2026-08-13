"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/forms/Input";

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
];

export interface OrderSnapshot {
  reference: string;
  placedAt: string;
  items: { name: string; quantity: number; priceMinorUnits: string }[];
  subtotalMinorUnits: string;
  name: string;
  email: string;
  town: string;
  county: string;
}

export const ORDER_SNAPSHOT_KEY = "mcd-order";

const REQUIRED_FIELDS = [
  ["fullName", "Tell us your name"],
  ["email", "We need an email for your order confirmation"],
  ["phone", "The delivery crew confirms the day by phone"],
  ["address1", "Where are we delivering to?"],
  ["town", "Which town or city?"],
  ["county", "Choose your county"],
] as const;

type FieldName = (typeof REQUIRED_FIELDS)[number][0];

const fieldControl =
  "min-h-[var(--tap-min)] w-full rounded-sm border border-hairline bg-white px-3 py-2 text-ink transition-colors duration-[var(--dur-base)] focus:border-strong";

const fieldLabel =
  "text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-eyebrow text-ink-soft";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-[length:var(--fs-small)] font-bold">
      {message}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="border-t-4 border-ink pt-4 text-[length:var(--fs-h4)] font-bold uppercase tracking-heading">
      {children}
    </h2>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, hydrated, subtotalMinorUnits, clear } = useCart();
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const submittedRef = useRef(false);

  /* Checkout with nothing in the cart goes back to the cart page —
     unless we just placed the order and are on our way to confirmation. */
  useEffect(() => {
    if (hydrated && items.length === 0 && !submittedRef.current) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nextErrors: Partial<Record<FieldName, string>> = {};

    for (const [field, message] of REQUIRED_FIELDS) {
      if (!String(data.get(field) ?? "").trim()) nextErrors[field] = message;
    }
    const email = String(data.get("email") ?? "");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "That email doesn't look right";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const snapshot: OrderSnapshot = {
      reference: `MCD-${String(Date.now()).slice(-6)}`,
      placedAt: new Date().toISOString(),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        priceMinorUnits: i.priceMinorUnits,
      })),
      subtotalMinorUnits,
      name: String(data.get("fullName")),
      email,
      town: String(data.get("town")),
      county: String(data.get("county")),
    };
    try {
      window.sessionStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      /* Snapshot is presentation-only; the flow still completes without it. */
    }
    submittedRef.current = true;
    clear();
    router.push("/checkout/confirmation");
  }

  return (
    <div className="grid items-start gap-[var(--grid-gap)] lg:grid-cols-[1fr_360px] lg:gap-12">
      <form onSubmit={handleSubmit} noValidate className="grid gap-10">
        <section className="grid gap-4">
          <SectionTitle>Contact</SectionTitle>
          <div>
            <Input label="Full name" name="fullName" autoComplete="name" required />
            <FieldError message={errors.fullName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input label="Email" name="email" type="email" autoComplete="email" required />
              <FieldError message={errors.email} />
            </div>
            <div>
              <Input label="Phone" name="phone" type="tel" autoComplete="tel" required />
              <FieldError message={errors.phone} />
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionTitle>Delivery address</SectionTitle>
          <div>
            <Input label="Address" name="address1" autoComplete="address-line1" required />
            <FieldError message={errors.address1} />
          </div>
          <Input label="Address line 2" name="address2" autoComplete="address-line2" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Input label="Town or city" name="town" autoComplete="address-level2" required />
              <FieldError message={errors.town} />
            </div>
            <div>
              <label className="grid gap-1">
                <span className={fieldLabel}>County</span>
                <select name="county" defaultValue="" className={`${fieldControl} cursor-pointer`}>
                  <option value="" disabled>
                    Choose
                  </option>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <FieldError message={errors.county} />
            </div>
            <Input label="Eircode" name="eircode" autoComplete="postal-code" />
          </div>
        </section>

        <section className="grid gap-4">
          <SectionTitle>Delivery notes</SectionTitle>
          <label className="grid gap-1">
            <span className={fieldLabel}>Anything the crew should know</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Narrow lane, third floor, dog friendly but loud…"
              className={`${fieldControl} resize-y`}
            />
          </label>
        </section>

        <section className="grid gap-4">
          <SectionTitle>Payment</SectionTitle>
          <p className="rounded-sm border border-hairline bg-stone px-4 py-3 text-[length:var(--fs-small)]">
            Prototype — payments not connected. No card is charged and no order is placed.
          </p>
          <fieldset disabled className="grid gap-4 border-0 p-0 opacity-45">
            <legend className="sr-only">Card details (disabled in the prototype)</legend>
            <label className="grid gap-1">
              <span className={fieldLabel}>Card number</span>
              <input className={fieldControl} placeholder="•••• •••• •••• ••••" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className={fieldLabel}>Expiry</span>
                <input className={fieldControl} placeholder="MM / YY" />
              </label>
              <label className="grid gap-1">
                <span className={fieldLabel}>Security code</span>
                <input className={fieldControl} placeholder="•••" />
              </label>
            </div>
          </fieldset>
        </section>

        <div>
          <Button type="submit" size="lg">
            Place your order
          </Button>
        </div>
      </form>
      <OrderSummary />
    </div>
  );
}
