/* Throwaway T1 spot-check page — replaced by the real homepage in T4. */
export default function Home() {
  return (
    <main className="mx-auto max-w-[var(--container-max)] px-6 py-16">
      <p
        className="text-gold-deep uppercase tracking-eyebrow"
        style={{ fontSize: "var(--fs-eyebrow)", fontWeight: 700 }}
      >
        Token spot-check · T1
      </p>
      <h1
        className="uppercase"
        style={{
          fontSize: "var(--fs-hero)",
          fontWeight: "var(--font-weight-heading)" as React.CSSProperties["fontWeight"],
          lineHeight: "var(--lh-tight)",
          letterSpacing: "var(--ls-hero)",
        }}
      >
        Comfort, built to last
      </h1>
      <div className="mt-8 flex flex-wrap gap-4">
        <span className="border-hairline bg-linen inline-block border px-6 py-3">linen #F6F3ED</span>
        <span className="bg-stone inline-block px-6 py-3">stone #EAE4D9</span>
        <span className="bg-ink text-on-dark inline-block px-6 py-3">ink #211D17</span>
        <button
          type="button"
          className="bg-gold text-ink hover:bg-gold-hover tracking-button rounded-sm px-6 py-3 font-bold uppercase transition-colors duration-[220ms]"
        >
          Shop the Summer Sale
        </button>
      </div>
    </main>
  );
}
