import Image from "next/image";
import { Breadcrumbs } from "@/components/commerce/Breadcrumbs";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";

/* Full-bleed photographic hero shared by every CMS-authored page type
   (landing pages, sofa models, mattresses) — extracted from /range/[slug].
   Pages authored without a hero image yet fall back to the dark ground. */
export function LandingHero({
  eyebrow,
  title,
  standfirst,
  heroImage,
  heroAlt,
  crumbs,
  brandLogo,
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
  heroImage: string;
  heroAlt: string;
  crumbs: { label: string; href?: string }[];
  /** Optional brand mark above the title (sofa models / mattresses). */
  brandLogo?: { src: string; alt: string; width?: number; height?: number };
}) {
  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-darker">
      {heroImage && (
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
      <div
        className="relative mx-auto w-full max-w-[var(--container-max)]"
        style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
      >
        <Breadcrumbs className="mb-6 text-on-dark-muted" items={crumbs} />
        {brandLogo && (
          /* Logos are unpredictable on photography — a quiet white plate keeps
             dark marks legible without fighting the scrim. */
          <div className="mb-5">
            <span className="inline-flex items-center rounded-md bg-white/95 px-4 py-3">
              <Image
                src={brandLogo.src}
                alt={brandLogo.alt}
                width={brandLogo.width ?? 160}
                height={brandLogo.height ?? 48}
                className="h-10 w-auto"
              />
            </span>
          </div>
        )}
        <EyebrowLabel tone="dark">{eyebrow}</EyebrowLabel>
        <h1 className="m-0 mt-2 max-w-[16ch] text-[length:var(--fs-hero)] font-bold uppercase leading-[var(--lh-tight)] tracking-hero text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-[var(--measure-lead)] text-[length:var(--fs-lead)] leading-[var(--lh-lead)] text-on-dark">
          {standfirst}
        </p>
      </div>
    </section>
  );
}
