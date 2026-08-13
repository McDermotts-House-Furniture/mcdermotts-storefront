/* Per-term swatch images from the live site's rtwpvs plugin (Variation
   Swatches for WooCommerce). The plugin stores them as term meta with no REST
   exposure, but the rendered product page carries the full mapping:

     <div class="rtwpvs-terms-wrapper ..." data-attribute_name="attribute_pa_x">
       <div class="rtwpvs-term ..." data-term="slug">…<img src="swatch.jpg"/>…

   So we read the page server-side (cached 1h) and parse it. Markup-coupled by
   design — if the plugin changes, this returns null and the PDP falls back to
   variation-image swatches / text chips. The clean long-term fix is exposing
   the term meta via REST in WP. */

const REVALIDATE_SECONDS = 3600;

/** taxonomy ("pa_cofra-wood-finish") → term slug → swatch image URL */
export type SwatchMap = Record<string, Record<string, string>>;

export function parseSwatchMap(html: string): SwatchMap {
  const map: SwatchMap = {};
  const wrapperRe = /data-attribute_name="attribute_([^"]+)"/g;
  const wrappers: { taxonomy: string; start: number }[] = [];
  for (let m = wrapperRe.exec(html); m; m = wrapperRe.exec(html)) {
    wrappers.push({ taxonomy: m[1], start: m.index });
  }
  wrappers.forEach((wrapper, i) => {
    const end = wrappers[i + 1]?.start ?? Math.min(html.length, wrapper.start + 50_000);
    const segment = html.slice(wrapper.start, end);
    const termRe = /data-term="([^"]+)"[^>]*>[\s\S]{0,300}?<img[^>]*src="([^"]+)"/g;
    for (let t = termRe.exec(segment); t; t = termRe.exec(segment)) {
      const [, term, src] = t;
      map[wrapper.taxonomy] ??= {};
      map[wrapper.taxonomy][term] ??= src;
    }
  });
  return map;
}

export async function getSwatchImages(permalink: string): Promise<SwatchMap | null> {
  try {
    const res = await fetch(permalink, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const map = parseSwatchMap(await res.text());
    return Object.keys(map).length > 0 ? map : null;
  } catch {
    return null;
  }
}
