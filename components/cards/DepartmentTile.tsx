import Image from "next/image";
import Link from "next/link";

/** Photographic 3:4 category tile with a scrim and an uppercase label. Six on the homepage, never more. */
export interface DepartmentTileProps {
  label?: string;
  /** Category URL; internal paths ("/...") use next/link. */
  href?: string;
  image?: string;
  /** Meaningful alt text describing the room or product shown. */
  alt?: string;
  /** Skip lazy-loading for tiles above the fold. */
  eager?: boolean;
  /** next/image responsive sizes hint. */
  sizes?: string;
  className?: string;
}

export function DepartmentTile({
  label,
  href = "#",
  image,
  alt = "",
  eager = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
}: DepartmentTileProps) {
  const cls = [
    "group relative block aspect-[var(--ratio-tile)] overflow-hidden rounded-md bg-stone no-underline",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          priority={eager}
          className="object-cover transition-transform duration-[var(--dur-slow)] ease-out group-hover:scale-[1.035]"
        />
      ) : null}
      <span aria-hidden="true" className="absolute inset-0 bg-[image:var(--scrim-tile)]" />
      <span className="absolute inset-x-5 bottom-5 text-[length:var(--fs-h3)] font-bold uppercase tracking-heading text-white">
        {label}
      </span>
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}
