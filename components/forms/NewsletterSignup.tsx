"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../core/Button";
import { Input } from "./Input";

/** Newsletter block: heading, plain-spoken frequency promise, one field, one button. */
export interface NewsletterSignupProps {
  heading?: string;
  /** The promise, stated plainly — e.g. "One email a fortnight, no more." */
  promise?: string;
  cta?: string;
  tone?: "light" | "dark";
  onSubmit?: (email: string) => void;
  className?: string;
}

export function NewsletterSignup({
  heading = "Join the list",
  promise = "One email a fortnight, no more.",
  cta = "Sign me up",
  tone = "dark",
  onSubmit,
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const dark = tone === "dark";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    onSubmit?.(email);
  };

  return (
    <form
      onSubmit={submit}
      className={`flex max-w-[520px] flex-col gap-4${className ? ` ${className}` : ""}`}
    >
      <h2
        className={`m-0 text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading ${
          dark ? "text-on-dark" : "text-ink"
        }`}
      >
        {heading}
      </h2>
      <p
        className={`m-0 text-[length:var(--fs-body)] leading-[var(--lh-body)] ${
          dark ? "text-on-dark-muted" : "text-ink-soft"
        }`}
      >
        {promise}
      </p>
      {sent ? (
        <p
          className={`m-0 text-[length:var(--fs-body)] ${
            dark ? "text-gold" : "text-gold-deep"
          }`}
        >
          You&rsquo;re on the list. Talk soon.
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <Input
            tone={tone}
            type="email"
            name="newsletter-email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="flex-[1_1_240px]"
          />
          <Button type="submit">{cta}</Button>
        </div>
      )}
    </form>
  );
}
