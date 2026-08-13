import Link from "next/link";

function pageHref(basePath: string, page: number, sort?: string): string {
  const params = new URLSearchParams();
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  basePath,
  page,
  totalPages,
  sort,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  sort?: string;
}) {
  if (totalPages <= 1) return null;

  const linkClasses =
    "inline-flex min-h-[var(--tap-min)] items-center rounded-sm border border-hairline bg-white px-5 text-[length:var(--fs-eyebrow)] font-bold uppercase tracking-button text-ink no-underline transition-colors duration-[var(--dur-base)] hover:border-strong";

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-5">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1, sort)} className={linkClasses}>
          Previous
        </Link>
      ) : (
        <span aria-hidden className={`${linkClasses} pointer-events-none opacity-45`}>
          Previous
        </span>
      )}
      <span className="text-[length:var(--fs-small)] text-ink-soft">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(basePath, page + 1, sort)} className={linkClasses}>
          Next
        </Link>
      ) : (
        <span aria-hidden className={`${linkClasses} pointer-events-none opacity-45`}>
          Next
        </span>
      )}
    </nav>
  );
}
