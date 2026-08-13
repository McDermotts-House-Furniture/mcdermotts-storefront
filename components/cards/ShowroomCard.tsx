import { Fragment } from "react";
import { EyebrowLabel } from "../core/EyebrowLabel";
import { TextLink } from "../core/TextLink";

/**
 * Showroom card: address, opening hours, directions and phone.
 * Hours appear here and nowhere else on the page.
 */
export interface ShowroomCardProps {
  /** e.g. "Co. Mayo · Flagship". */
  eyebrow?: string;
  name?: string;
  address?: string;
  hours?: Array<{ days: string; time: string }>;
  /** Small caveat under the hours, e.g. bank-holiday note. */
  note?: string;
  directionsHref?: string;
  phone?: string;
  phoneHref?: string;
  className?: string;
}

export function ShowroomCard({
  eyebrow,
  name,
  address,
  hours = [],
  note,
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
      {eyebrow ? <EyebrowLabel>{eyebrow}</EyebrowLabel> : null}
      <h3 className="m-0 text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading">
        {name}
      </h3>
      <p className="m-0 text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink-soft">
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
      <div className="mt-1 flex flex-wrap gap-6">
        <TextLink href={directionsHref}>Get directions</TextLink>
        {phone ? (
          <TextLink href={phoneHref || "tel:" + phone.replace(/\s/g, "")} arrow={false}>
            {phone}
          </TextLink>
        ) : null}
      </div>
    </article>
  );
}
