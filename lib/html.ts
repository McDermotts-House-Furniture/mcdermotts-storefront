/* WordPress HTML-encodes entity names in plain-text fields (category names,
   attribute terms: "Double (4&#8217;6&#8243;) Mattress", "Willis &amp; Gambier").
   One decoder, applied once where API data enters the app. Handles numeric
   entities (decimal + hex) and the named ones WP actually emits. */

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  prime: "′",
  Prime: "″",
  deg: "°",
  frac12: "½",
  reg: "®",
  trade: "™",
  copy: "©",
  eacute: "é",
  oacute: "ó",
  aacute: "á",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isNaN(code) || code <= 0 ? match : String.fromCodePoint(code);
    }
    return NAMED[entity] ?? NAMED[entity.toLowerCase()] ?? match;
  });
}
