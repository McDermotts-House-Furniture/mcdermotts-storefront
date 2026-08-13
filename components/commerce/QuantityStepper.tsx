"use client";

/* Minus / value / plus stepper. Both buttons are full 44px tap targets. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    "h-[var(--tap-min)] w-[var(--tap-min)] cursor-pointer border-0 bg-transparent text-[length:var(--fs-lead)] text-ink transition-colors duration-[var(--dur-base)] hover:text-gold-deep disabled:pointer-events-none disabled:opacity-45";

  return (
    <div
      role="group"
      aria-label="Quantity"
      className="inline-flex items-center rounded-sm border border-hairline bg-white"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => set(value - 1)}
        className={btn}
      >
        −
      </button>
      <span aria-live="polite" className="min-w-8 text-center font-bold">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => set(value + 1)}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
