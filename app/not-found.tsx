import { Button } from "@/components/core/Button";
import { EyebrowLabel } from "@/components/core/EyebrowLabel";

export default function NotFound() {
  return (
    <main
      className="mx-auto flex w-full max-w-[var(--container-narrow)] flex-col items-start justify-center"
      style={{ padding: "var(--section-pad-y) var(--section-pad-x)", minHeight: "50vh" }}
    >
      <EyebrowLabel>404</EyebrowLabel>
      <h1
        className="mt-2 uppercase"
        style={{
          fontSize: "var(--fs-h2)",
          fontWeight: 700,
          lineHeight: "var(--lh-heading)",
          letterSpacing: "var(--ls-heading)",
        }}
      >
        This page has been discontinued
      </h1>
      <p className="mt-4 max-w-[var(--measure-body)] text-ink-soft">
        Like the best floor models, it&apos;s gone and it isn&apos;t coming back. The
        departments are all still where you left them.
      </p>
      <div className="mt-8">
        <Button href="/">Back to the showroom</Button>
      </div>
    </main>
  );
}
