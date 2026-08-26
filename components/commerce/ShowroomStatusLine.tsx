import Link from "next/link";
import type { ShowroomAvailability, ShowroomStatus } from "@/lib/landing-data";

/* Compact, factual showroom-status line (sofa-section spec §5: "high and
   small" placement). Purely scannable — no softening language, that belongs
   lower down near the enquiry form. Three states need three distinct
   treatments (a skimming customer must tell "today" from "not yet" at a
   glance) but this palette has no red/green (see DeliveryNotice), so the
   distinction is weight + colour + wording, same idiom as DeliveryNotice's
   stock/lead/attention tones. */

/* Same target as the header/footer "Find us" links (Declan, 2026-08-25;
   repointed from the homepage anchor to the real Find Us page, 2026-08-27)
   — every "On display" reading links there, on every range page.
   Not-on-display and coming-soon stay plain text: there's nothing to visit
   yet. */
const FIND_US_HREF = "/about/find-us";

const treatments: Record<ShowroomStatus, string> = {
  "on-display": "font-bold text-ink",
  "coming-soon": "font-bold text-gold-deep",
  "not-on-display": "text-ink-soft",
};

function StatusLabel({ status, eta }: { status: ShowroomStatus; eta?: string }) {
  if (status === "on-display") {
    return (
      <Link href={FIND_US_HREF} className="underline decoration-1 underline-offset-2 hover:text-gold-deep">
        On display
      </Link>
    );
  }
  if (status === "coming-soon") return <>{eta ? `Coming soon (${eta})` : "Coming soon"}</>;
  return <>Not on display</>;
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
      <span className={treatments[status.castlebar]}>
        Castlebar: <StatusLabel status={status.castlebar} eta={status.eta} />
      </span>
      <span aria-hidden className="mx-2 text-ink-soft">
        ·
      </span>
      <span className={treatments[status.ennis]}>
        Ennis: <StatusLabel status={status.ennis} eta={status.eta} />
      </span>
    </p>
  );
}
