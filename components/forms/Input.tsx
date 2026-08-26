import type { ChangeEvent, FocusEvent } from "react";

/** Single-line text field with an uppercase label. The gold focus ring comes from the global :focus-visible rule. */
export interface InputProps {
  label?: string;
  type?: "text" | "email" | "tel" | "search";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  tone?: "light" | "dark";
  required?: boolean;
  name?: string;
  id?: string;
  hint?: string;
  /** Validation message shown beside the field, in text and colour (not
      colour alone) — errors need to be visible to someone who can't see
      colour at all, not just distinguishable from someone who can. Reuses
      the DS's one red (see Badge's "sale" tone) rather than inventing a
      second — this palette otherwise has none. */
  error?: string;
  autoComplete?: string;
  className?: string;
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  tone = "light",
  required,
  name,
  id,
  hint,
  error,
  autoComplete,
  className,
}: InputProps) {
  const dark = tone === "dark";
  const inputId = id || name || label;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className={`text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow ${
            dark ? "text-on-dark-muted" : "text-ink-soft"
          }`}
        >
          {label}
          {required ? " *" : ""}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`min-h-[var(--tap-min)] rounded-sm border px-4 py-3.5 text-[length:var(--fs-body)] transition-[border-color] duration-[var(--dur-base)] ease-out ${
          dark ? "bg-transparent text-linen" : "bg-white text-ink"
        } ${
          error
            ? "border-red focus:border-red"
            : dark
              ? "border-on-dark-border focus:border-gold"
              : "border-hairline focus:border-ink"
        }`}
      />
      {error ? (
        <p id={errorId} role="alert" className="m-0 text-[length:var(--fs-micro)] text-red">
          {error}
        </p>
      ) : hint ? (
        <p
          className={`m-0 text-[length:var(--fs-micro)] ${
            dark ? "text-on-dark-muted" : "text-ink-soft"
          }`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
