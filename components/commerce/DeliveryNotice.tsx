import { TextLink } from "@/components/core/TextLink";

export type DeliveryTone = "stock" | "lead" | "attention";

/* Delivery and stock notice. Three tones, distinguished by the rule above and
   the label — not by coloured alert boxes: this palette has no red or green.
   `attention` earns the gold rule (one accent per section). */
const tones: Record<DeliveryTone, { rule: string; label: string }> = {
  stock: { rule: "border-ink", label: "text-ink-soft" },
  lead: { rule: "border-ink", label: "text-ink-soft" },
  attention: { rule: "border-gold", label: "text-gold-deep" },
};

export function DeliveryNotice({
  title,
  body,
  tone = "stock",
  action,
  actionHref,
  className,
}: {
  title: string;
  body?: string;
  tone?: DeliveryTone;
  action?: string;
  actionHref?: string;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <section className={`border-t-4 pt-4 ${t.rule} ${className ?? ""}`}>
      <p
        className={`m-0 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow ${t.label}`}
      >
        {title}
      </p>
      {body && (
        <p className="m-0 mt-2 max-w-[var(--measure-body)] text-[length:var(--fs-small)] leading-[var(--lh-body)]">
          {body}
        </p>
      )}
      {action && (
        <div className="mt-3">
          <TextLink href={actionHref ?? "#"}>{action}</TextLink>
        </div>
      )}
    </section>
  );
}
