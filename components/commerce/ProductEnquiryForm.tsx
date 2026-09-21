"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/forms/Input";
import { COUNTIES } from "@/lib/enquiry-options";

export interface ProductEnquiryFormProps {
  productName: string;
  pageUrl: string;
  phone?: string;
  phoneHref?: string;
  className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabelCls = "text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft";
const selectCls =
  "min-h-[var(--tap-min)] rounded-sm border bg-white px-4 py-3.5 text-[length:var(--fs-body)] text-ink transition-[border-color] duration-[var(--dur-base)] ease-out";

/* Lightweight product-question form (Declan, 2026-08-27: "like the query
   form in the sofa collection pages but not with so much detail — i think
   only needed is name, email address, phone number, delivery location and
   a question box") — RangeEnquiryForm's five simplest fields, none of its
   range-specific ones (no layout/material pickers, no showroom
   preference — there's no range or tags to condition them on here, just one
   product). Client-side only, same as every other form on this site so far
   (Declan confirmed, 2026-08-27): no real backend behind it yet, "submitted"
   is a stand-in for wherever this would actually send. */
export function ProductEnquiryForm({
  productName,
  pageUrl,
  phone = "094 90 22500",
  phoneHref = "tel:0949022500",
  className,
}: ProductEnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [county, setCounty] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = EMAIL_RE.test(email);

  const nameError = attempted && !name ? "Enter your name." : undefined;
  const emailError =
    (attempted || emailTouched) && !email
      ? "Enter your email address."
      : (attempted || emailTouched) && !emailValid
        ? "Enter a valid email address."
        : undefined;
  const phoneError = attempted && !phoneNumber ? "Enter a phone number." : undefined;
  const countyError = attempted && !county ? "Select a county." : undefined;
  const messageError = attempted && !message ? "Let us know what you'd like to ask." : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    /* Honeypot: a bot fills every field, including this hidden one. Respond
       as if it succeeded — never process it, never tell it why. */
    if (honeypot) {
      setSubmitted(true);
      return;
    }
    if (!name || !emailValid || !phoneNumber || !county || !message) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={className}>
        <p className="m-0 max-w-[var(--measure-body)] text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""} — that&apos;s gone through to our team, and
          we&apos;ll come back to you within one working day about the {productName}. If it&apos;s
          urgent, ring Castlebar on{" "}
          <a href={phoneHref} className="text-ink underline hover:text-gold-deep">
            {phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={`grid gap-5 sm:grid-cols-2 ${className ?? ""}`}>
      {/* Honeypot — visually hidden, not display:none (some spam bots skip
          display:none fields), innocuous name a real customer would never
          fill in. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="product-enquiry-company">Company</label>
        <input
          id="product-enquiry-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={nameError}
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        required
        error={emailError}
        autoComplete="email"
      />
      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
        error={phoneError}
        autoComplete="tel"
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="product-enquiry-county" className={fieldLabelCls}>
          Delivery location *
        </label>
        <select
          id="product-enquiry-county"
          name="county"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          required
          aria-invalid={countyError ? true : undefined}
          aria-describedby="product-enquiry-county-note"
          className={`${selectCls} ${countyError ? "border-red focus:border-red" : "border-hairline focus:border-ink"}`}
        >
          <option value="">Select a county</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p
          id="product-enquiry-county-note"
          role={countyError ? "alert" : undefined}
          className={`m-0 text-[length:var(--fs-micro)] ${countyError ? "text-red" : "text-ink-soft"}`}
        >
          {countyError ?? "So we can factor delivery into our reply."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label htmlFor="product-enquiry-message" className={fieldLabelCls}>
          Your question *
        </label>
        <textarea
          id="product-enquiry-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "product-enquiry-message-error" : undefined}
          className={`rounded-sm border bg-white px-4 py-3.5 text-[length:var(--fs-body)] text-ink transition-[border-color] duration-[var(--dur-base)] ease-out ${
            messageError ? "border-red focus:border-red" : "border-hairline focus:border-ink"
          }`}
        />
        {messageError ? (
          <p id="product-enquiry-message-error" role="alert" className="m-0 text-[length:var(--fs-micro)] text-red">
            {messageError}
          </p>
        ) : null}
      </div>

      {/* Hidden context, attached automatically — never shown. */}
      <input type="hidden" name="product" value={productName} />
      <input type="hidden" name="pageUrl" value={pageUrl} />

      <div className="sm:col-span-2">
        <Button type="submit">Send your question</Button>
      </div>
    </form>
  );
}
