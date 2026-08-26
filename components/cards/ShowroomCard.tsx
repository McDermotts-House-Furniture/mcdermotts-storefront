import { Fragment } from "react";
import { Button } from "../core/Button";
import { EyebrowLabel } from "../core/EyebrowLabel";

/**
 * Showroom card: address, opening hours, directions and phone. Optional
 * description/parking paragraphs for the full Find Us page (2026-08-27); the
 * homepage's compact teaser card leaves both unset. Hours appear only here,
 * wherever this card is used.
 */
export interface ShowroomCardProps {
  /** e.g. "Co. Mayo · Flagship". */
  eyebrow?: string;
  name?: string;
  /** Longer intro paragraph, between the name and the address — for the full
      Find Us page; the homepage's compact teaser card doesn't set this. */
  description?: string;
  /** Silent looping showroom clip (mp4), above the eyebrow — same footage as
      the live Find Us page. Decorative: autoplay/loop/muted, no controls, no
      poster. The homepage teaser card doesn't set this either. */
  videoSrc?: string;
  /** Multiple lines (street / town, county / eircode) join with a real line
      break, `\n`; a single line renders exactly as it always did. */
  address?: string;
  hours?: Array<{ days: string; time: string }>;
  /** Small caveat under the hours, e.g. bank-holiday note. */
  note?: string;
  /** Parking instructions, between the hours and the directions/phone links
      — for the full Find Us page; the homepage teaser doesn't set this. */
  parking?: string;
  directionsHref?: string;
  phone?: string;
  phoneHref?: string;
  className?: string;
}

export function ShowroomCard({
  eyebrow,
  name,
  description,
  videoSrc,
  address,
  hours = [],
  note,
  parking,
  directionsHref = "#",
  phone,
  phoneHref,
  className,
}: ShowroomCardProps) {
  return (
    <article
      className={`flex flex-col gap-4 rounded-md border border-hairline bg-white p-8 shadow-card${
        className ? ` ${className}` : ""
      }`}
    >
      {videoSrc ? (
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="aspect-[2/1] w-full rounded-md object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
      {eyebrow ? <EyebrowLabel>{eyebrow}</EyebrowLabel> : null}
      <h3 className="m-0 text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading">
        {name}
      </h3>
      {description ? (
        <p className="m-0 text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink-soft">
          {description}
        </p>
      ) : null}
      <p className="m-0 whitespace-pre-line text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink-soft">
        {address}
      </p>
      <dl className="m-0 grid grid-cols-[1fr_auto] gap-y-2 border-y border-hairline py-4 text-[length:var(--fs-small)]">
        {hours.map((h, i) => (
          <Fragment key={i}>
            <dt className="m-0 text-ink-soft">{h.days}</dt>
            <dd className="m-0 font-bold">{h.time}</dd>
          </Fragment>
        ))}
      </dl>
      {note ? (
        <p className="m-0 text-[length:var(--fs-micro)] text-ink-soft">{note}</p>
      ) : null}
      {parking ? (
        <p className="m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft">
          {parking}
        </p>
      ) : null}
      {/* Real buttons, not text links (Declan, 2026-08-27: "one of the most
          viewed pages on the website and these buttons need to be visible
          and strong CTA") — solid gold "Get directions", outlined "Call…",
          same pairing Button already uses for a primary/secondary pair
          elsewhere on the site. White text on "Get directions" specifically
          (Declan, 2026-08-27, after being flagged that Button's own primary
          variant deliberately never does this — gold's too light for white
          text to clear accessible contrast) — overridden here only, not in
          Button.tsx, so every other gold button on the site keeps the dark
          text the rule exists for. !text-white, not text-white: same
          specificity as Button's own text-ink, so an unmodified override
          isn't guaranteed to win the cascade. */}
      <div className="mt-1 flex flex-wrap gap-4">
        <Button href={directionsHref} className="!text-white">
          Get directions
        </Button>
        {phone ? (
          <Button href={phoneHref || "tel:" + phone.replace(/\s/g, "")} variant="secondary">
            Call {phone}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
