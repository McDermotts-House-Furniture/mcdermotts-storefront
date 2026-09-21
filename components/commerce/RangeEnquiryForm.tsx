"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/core/Button";
import { TextLink } from "@/components/core/TextLink";
import { Input } from "@/components/forms/Input";
import {
  alongsideOptionsFor,
  COUNTIES,
  hasFootstoolOption,
  LAYOUT_NUDGE_THRESHOLD,
  mainPieceOptionsFor,
  materialOptionsFor,
  SHOWROOM_PREFERENCES,
  shouldShowAlongside,
} from "@/lib/enquiry-options";
import type { ShowroomAvailability } from "@/lib/landing-data";

export interface RangeEnquiryFormProps {
  rangeName: string;
  /** The range's own tag slugs — decides whether "Fabric or leather?" shows
      at all, and with which options. */
  tags: string[];
  pageUrl: string;
  showroomStatus: ShowroomAvailability;
  phone?: string;
  phoneHref?: string;
  className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabelCls = "text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft";
const selectCls =
  "min-h-[var(--tap-min)] rounded-sm border bg-white px-4 py-3.5 text-[length:var(--fs-body)] text-ink transition-[border-color] duration-[var(--dur-base)] ease-out";
const checkboxCls = "h-5 w-5 flex-none accent-[var(--mcd-gold-deep)]";
/* min-h-8 (32px), not --tap-min (44px) — the full tap-target height forced a
   lot of empty vertical space around a single line of short text, which is
   what actually made these read as far apart, not the grid gap between them
   (Declan, 2026-08-26). 32px keeps a reasonable tap target without it. */
const checkboxLabelCls = "flex min-h-8 cursor-pointer items-center gap-3 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink";

/* Quote-request form (spec: "Range Page Quote Form", Declan, 2026-08-26).
   The core idea: a required free-text box produces "hi" and "price please"
   — people leave it blank because they don't know what's expected of them,
   not because they can't be bothered. So the page asks the actual question
   itself, with tick boxes, using what it already knows (the range, its
   tags) instead of asking the customer to compose an answer from nothing.

   "What's the main piece?" / "Anything alongside it?" are deliberately about
   the SHAPE of what a customer needs in the room (a 3 seater, a corner
   group, a chair alongside it), never about a range's individual modules —
   nobody shopping for a sofa knows they want two armless mediums and a
   left-hand corner unit, and asking would just push the salesperson's job
   onto the customer. Split into two questions rather than one long list
   (Declan, 2026-08-27): every realistic main-piece-plus-extra combination is
   about 33 options, a wall of tick boxes people abandon; two shorter
   questions generate the same combinations from 15 options, and the second
   question hides entirely where it wouldn't add anything (see
   shouldShowAlongside). Both lists are filtered by the range's own type tags
   — a range with no corner tag doesn't offer "Corner group", the same way it
   wouldn't show up on the corner collection page (see mainPieceOptionsFor /
   alongsideOptionsFor). The footstool checkbox is standalone, gated the same
   way (see hasFootstoolOption).

   "Fabric or leather?" is the opposite: conditional on the range's actual
   material tags, present only when there's a real choice (see
   materialOptionsFor). A range wrongly tagged as available in leather would
   actively invite a leather quote request for something that doesn't come
   in leather — a direct, sharper version of the false-positive-tagging
   problem the tag vocabulary's conservatism rule exists to prevent.

   Client-side only, following NewsletterSignup's own pattern — this
   prototype has no enquiry-handling backend yet; "submitted" is a stand-in
   for wherever this data would actually go. */
export function RangeEnquiryForm({
  rangeName,
  tags,
  pageUrl,
  showroomStatus,
  phone = "094 90 22500",
  phoneHref = "tel:0949022500",
  className,
}: RangeEnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [county, setCounty] = useState("");
  const [mainPieces, setMainPieces] = useState<string[]>([]);
  const [alongside, setAlongside] = useState("");
  const [footstool, setFootstool] = useState(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showroomPref, setShowroomPref] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mainPieceOptions = mainPieceOptionsFor(tags);
  const alongsideOptions = alongsideOptionsFor(tags);
  const showAlongside = shouldShowAlongside(mainPieces);
  const footstoolOption = hasFootstoolOption(tags);
  const materialOptions = materialOptionsFor(tags);
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
  const mainPieceError = attempted && mainPieces.length === 0 ? "Select at least one." : undefined;
  const alongsideError = attempted && showAlongside && !alongside ? "Select one." : undefined;
  const consentError = attempted && !consent ? "Please confirm you're happy for us to be in touch." : undefined;

  const toggle = (setter: typeof setMainPieces, current: string[], opt: string) =>
    setter(current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt]);

  /* The old single-list nudge threshold, now counted across both questions
     together (Declan, 2026-08-27) — Q2 is single-select, so it contributes
     at most one. */
  const selectionCount = mainPieces.length + (alongside ? 1 : 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    /* Honeypot: a bot fills every field, including this hidden one. Respond
       as if it succeeded — never process it, never tell it why. */
    if (honeypot) {
      setSubmitted(true);
      return;
    }
    if (
      !name ||
      !emailValid ||
      !phoneNumber ||
      !county ||
      mainPieces.length === 0 ||
      (showAlongside && !alongside) ||
      !consent
    )
      return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className={`rounded-md border border-hairline bg-surface-card p-6 sm:p-8${className ? ` ${className}` : ""}`}
      >
        <p className="m-0 max-w-[var(--measure-body)] text-[length:var(--fs-body)] leading-[var(--lh-body)] text-ink">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""} — that&apos;s gone through to{" "}
          {showroomPref ? showroomPref : "our team"}, and we&apos;ll come back to you within one working day
          with pricing for the {rangeName} range. If it&apos;s urgent, ring Castlebar on{" "}
          <a href={phoneHref} className="text-ink underline hover:text-gold-deep">
            {phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-hairline bg-surface-card p-6 sm:p-8${className ? ` ${className}` : ""}`}>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
        {/* Honeypot — visually hidden, not display:none (some spam bots skip
            display:none fields), innocuous name a real customer would never
            fill in. */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="range-enquiry-company">Company</label>
          <input
            id="range-enquiry-company"
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
          <label htmlFor="range-enquiry-county" className={fieldLabelCls}>
            Delivery location *
          </label>
          <select
            id="range-enquiry-county"
            name="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            required
            aria-invalid={countyError ? true : undefined}
            aria-describedby="range-enquiry-county-note"
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
            id="range-enquiry-county-note"
            role={countyError ? "alert" : undefined}
            className={`m-0 text-[length:var(--fs-micro)] ${countyError ? "text-red" : "text-ink-soft"}`}
          >
            {countyError ?? "So we can include delivery in your quote."}
          </p>
        </div>

        {/* Placeholder cell on the wide breakpoint so the county field
            above doesn't stretch across both columns alone. */}
        <div aria-hidden className="hidden sm:block" />

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0 sm:col-span-2">
          <legend className={`p-0 ${fieldLabelCls}`}>What&apos;s the main piece? *</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {mainPieceOptions.map((opt) => (
              <label key={opt} className={checkboxLabelCls}>
                <input
                  type="checkbox"
                  checked={mainPieces.includes(opt)}
                  onChange={() => toggle(setMainPieces, mainPieces, opt)}
                  className={checkboxCls}
                />
                {opt}
              </label>
            ))}
          </div>
          {mainPieceError ? (
            <p role="alert" className="m-0 text-[length:var(--fs-micro)] text-red">
              {mainPieceError}
            </p>
          ) : null}
        </fieldset>

        {showAlongside ? (
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0 sm:col-span-2">
            <legend className={`p-0 ${fieldLabelCls}`}>Anything alongside it? *</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {alongsideOptions.map((opt) => (
                <label key={opt} className={checkboxLabelCls}>
                  <input
                    type="radio"
                    name="alongside"
                    checked={alongside === opt}
                    onChange={() => setAlongside(opt)}
                    className={checkboxCls}
                  />
                  {opt}
                </label>
              ))}
            </div>
            {alongsideError ? (
              <p role="alert" className="m-0 text-[length:var(--fs-micro)] text-red">
                {alongsideError}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {footstoolOption ? (
          <label className={`sm:col-span-2 ${checkboxLabelCls}`}>
            <input
              type="checkbox"
              checked={footstool}
              onChange={(e) => setFootstool(e.target.checked)}
              className={checkboxCls}
            />
            and a footstool
          </label>
        ) : null}

        {/* Never blocks submission, never styled as an error — a suggestion,
            not a problem. A soft grow/fade rather than a hard cut in and out
            (Declan, 2026-08-26) — always mounted, not conditionally
            rendered, so the transition below actually has something to
            animate between rather than needing an enter-animation
            workaround; max-height stands in for height, which can't be
            transitioned to/from auto directly. Counts selections across both
            questions together (Declan, 2026-08-27). */}
        <p
          aria-hidden={selectionCount < LAYOUT_NUDGE_THRESHOLD}
          className={`m-0 overflow-hidden rounded-sm bg-linen px-4 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft transition-[opacity,max-height,padding-top,padding-bottom] duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-reduce:transition-none sm:col-span-2 ${
            selectionCount >= LAYOUT_NUDGE_THRESHOLD ? "max-h-28 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
          }`}
        >
          Happy to price a few of these. If you can narrow it to two or three, we&apos;ll usually get back
          to you quicker.
        </p>

        {materialOptions.length > 0 ? (
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0 sm:col-span-2">
            <legend className={`p-0 ${fieldLabelCls}`}>Fabric or leather?</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {materialOptions.map((opt) => (
                <label key={opt} className={checkboxLabelCls}>
                  <input
                    type="checkbox"
                    checked={materials.includes(opt)}
                    onChange={() => toggle(setMaterials, materials, opt)}
                    className={checkboxCls}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="range-enquiry-message" className={fieldLabelCls}>
            Anything else we should know?
          </label>
          <ul className="m-0 list-disc pl-5 text-[length:var(--fs-micro)] leading-[var(--lh-body)] text-ink-soft">
            <li>Roughly how much wall space there is, especially for a corner</li>
            <li>Which side the corner or chaise should sit on, looking at it from the room</li>
            <li>Anything awkward about getting furniture into the house</li>
          </ul>
          <textarea
            id="range-enquiry-message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-sm border border-hairline bg-white px-4 py-3.5 text-[length:var(--fs-body)] text-ink transition-[border-color] duration-[var(--dur-base)] ease-out focus:border-ink"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="range-enquiry-showroom" className={fieldLabelCls}>
            Which showroom suits you?
          </label>
          <select
            id="range-enquiry-showroom"
            name="showroom"
            value={showroomPref}
            onChange={(e) => setShowroomPref(e.target.value)}
            className={`${selectCls} border-hairline focus:border-ink`}
          >
            <option value="">No preference</option>
            {SHOWROOM_PREFERENCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="flex items-start gap-3 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className={`mt-0.5 ${checkboxCls}`}
            />
            <span>
              I&apos;m happy for McDermott&apos;s to contact me about this enquiry, per the{" "}
              <TextLink href="#top" arrow={false} className="inline">
                privacy policy
              </TextLink>
              . *
            </span>
          </label>
          {consentError ? (
            <p role="alert" className="m-0 text-[length:var(--fs-micro)] text-red">
              {consentError}
            </p>
          ) : null}
        </div>

        {/* Hidden context, attached automatically — never shown. mainPiece /
            alongside / footstool are listed as separate fields rather than
            folded into one free-text summary (Declan, 2026-08-27), so
            whatever eventually sends the notification email can lay them
            out on their own lines, e.g.:
              Main piece:    Corner group, 3 seater
              Alongside:     A chair
              Footstool:     Yes
            No enquiry-handling backend exists yet — see the file comment
            above — so this is the shape that data would take, not a real
            send. */}
        <input type="hidden" name="range" value={rangeName} />
        <input type="hidden" name="pageUrl" value={pageUrl} />
        <input type="hidden" name="showroomStatusCastlebar" value={showroomStatus.castlebar} />
        <input type="hidden" name="showroomStatusEnnis" value={showroomStatus.ennis} />
        <input type="hidden" name="mainPiece" value={mainPieces.join(", ")} />
        <input type="hidden" name="alongside" value={showAlongside ? alongside : ""} />
        <input type="hidden" name="footstool" value={footstool ? "Yes" : "No"} />

        <div className="sm:col-span-2">
          <Button type="submit">Get a quote</Button>
        </div>
      </form>
    </div>
  );
}
