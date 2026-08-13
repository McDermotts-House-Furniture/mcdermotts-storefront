/** One of three trust pillars under the review quote. Rule above, uppercase title, factual body. */
export interface TrustPillarProps {
  title?: string;
  body?: string;
  tone?: "light" | "dark";
  className?: string;
}

export function TrustPillar({ title, body, tone = "light", className }: TrustPillarProps) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-col gap-3 border-t-4 pt-5 ${dark ? "border-gold" : "border-ink"}${
        className ? ` ${className}` : ""
      }`}
    >
      <h3
        className={`m-0 text-[length:var(--fs-h4)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading ${
          dark ? "text-on-dark" : "text-ink"
        }`}
      >
        {title}
      </h3>
      <p
        className={`m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)] ${
          dark ? "text-on-dark-muted" : "text-ink-soft"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
