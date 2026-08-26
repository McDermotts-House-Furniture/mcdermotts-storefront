import type { ShowroomAvailability, ShowroomStatus } from "@/lib/landing-data";

/* Compact, factual showroom-status line (sofa-section spec §5: "high and
   small" placement). Purely scannable — no softening language, that belongs
   lower down near the enquiry form. Three states need three distinct
   treatments (a skimming customer must tell "today" from "not yet" at a
   glance) but this palette has no red/green (see DeliveryNotice), so the
   distinction is weight + colour + wording, same idiom as DeliveryNotice's
   stock/lead/attention tones. */

const treatments: Record<ShowroomStatus, string> = {
  "on-display": "font-bold text-ink",
  "coming-soon": "font-bold text-gold-deep",
  "not-on-display": "text-ink-soft",
};

function label(status: ShowroomStatus, eta?: string): string {
  if (status === "on-display") return "On display";
  if (status === "coming-soon") return eta ? `Coming soon (${eta})` : "Coming soon";
  return "Not on display";
}

export function ShowroomStatusLine({
  status,
  className,
}: {
  status: ShowroomAvailability;
  className?: string;
}) {
  return (
    <p
      className={`m-0 text-[length:var(--fs-micro)] uppercase tracking-eyebrow ${className ?? ""}`}
    >
      <span className={treatments[status.castlebar]}>Castlebar: {label(status.castlebar, status.eta)}</span>
      <span aria-hidden className="mx-2 text-ink-soft">
        ·
      </span>
      <span className={treatments[status.ennis]}>Ennis: {label(status.ennis, status.eta)}</span>
    </p>
  );
}
