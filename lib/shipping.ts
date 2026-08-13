/* Delivery pricing from WooCommerce's own shipping zones (wc/v3, read-only
   key in WC_CONSUMER_KEY/SECRET — server only, never sent to the browser).
   Zones are county-keyed flat rates; Woo evaluates zones in order and the
   first zone containing the county wins (Clare sits in two zones — order
   resolves it). Click & Collect (free local_pickup) exists in every zone.
   If the env vars are absent or the fetch fails, callers get null and the
   checkout falls back to the policy line with no figure. */

const WC_API_BASE = "https://mcdermotts.ie/wp-json/wc/v3";
const REVALIDATE_SECONDS = 3600;

/* WooCommerce Ireland state codes → county names (as the checkout select shows them). */
export const IE_COUNTIES: Record<string, string> = {
  CW: "Carlow", CN: "Cavan", CE: "Clare", CO: "Cork", DL: "Donegal", D: "Dublin",
  G: "Galway", KY: "Kerry", KE: "Kildare", KK: "Kilkenny", LS: "Laois", LM: "Leitrim",
  LK: "Limerick", LD: "Longford", LH: "Louth", MO: "Mayo", MH: "Meath", MN: "Monaghan",
  OY: "Offaly", RN: "Roscommon", SO: "Sligo", TA: "Tipperary", WD: "Waterford",
  WH: "Westmeath", WX: "Wexford", WW: "Wicklow",
};

export interface ZoneData {
  id: number;
  locations: { type: string; code: string }[];
  methods: {
    method_id: string;
    enabled: boolean;
    title: string;
    costMinorUnits: string | null;
  }[];
}

export interface CountyRate {
  title: string;
  costMinorUnits: string;
}

export interface PickupOption {
  title: string;
}

export interface ShippingConfig {
  /** County name → delivery rate. First matching zone wins, mirroring Woo. */
  countyRates: Record<string, CountyRate>;
  /** Free collection options (same in every zone). */
  pickup: PickupOption[];
}

/* Pure: zones (in Woo priority order) → county rate map + pickup options. */
export function buildShippingConfig(zones: ZoneData[]): ShippingConfig {
  const countyRates: Record<string, CountyRate> = {};
  const pickupTitles = new Set<string>();

  for (const zone of zones) {
    const flatRate = zone.methods.find(
      (m) => m.enabled && m.method_id === "flat_rate" && m.costMinorUnits !== null,
    );
    for (const method of zone.methods) {
      if (method.enabled && method.method_id === "local_pickup") pickupTitles.add(method.title);
    }
    if (!flatRate) continue;
    for (const location of zone.locations) {
      if (location.type !== "state" || !location.code.startsWith("IE:")) continue;
      const county = IE_COUNTIES[location.code.slice(3)];
      if (!county || countyRates[county]) continue; // first zone wins
      countyRates[county] = { title: flatRate.title, costMinorUnits: flatRate.costMinorUnits! };
    }
  }

  return { countyRates, pickup: [...pickupTitles].map((title) => ({ title })) };
}

const decodeEntities = (s: string) => s.replace(/&amp;/g, "&").replace(/&#038;/g, "&");

/* Woo flat_rate cost is a euro string like "29" or "29.50" → minor units. */
function euroToMinorUnits(cost: string): string | null {
  const match = cost.trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  return `${match[1]}${(match[2] ?? "").padEnd(2, "0")}`;
}

interface WcMethod {
  method_id: string;
  enabled: boolean;
  settings?: { title?: { value?: string }; cost?: { value?: string } };
}

export async function getShippingConfig(): Promise<ShippingConfig | null> {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) return null;

  const auth = { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` };
  const opts = { headers: auth, next: { revalidate: REVALIDATE_SECONDS } };

  try {
    const zonesRes = await fetch(`${WC_API_BASE}/shipping/zones`, opts);
    if (!zonesRes.ok) return null;
    const zones = (await zonesRes.json()) as { id: number }[];

    const zoneData: ZoneData[] = await Promise.all(
      zones.map(async (zone) => {
        const [locationsRes, methodsRes] = await Promise.all([
          fetch(`${WC_API_BASE}/shipping/zones/${zone.id}/locations`, opts),
          fetch(`${WC_API_BASE}/shipping/zones/${zone.id}/methods`, opts),
        ]);
        const locations = locationsRes.ok
          ? ((await locationsRes.json()) as ZoneData["locations"])
          : [];
        const methods = methodsRes.ok ? ((await methodsRes.json()) as WcMethod[]) : [];
        return {
          id: zone.id,
          locations,
          methods: methods.map((m) => ({
            method_id: m.method_id,
            enabled: m.enabled,
            title: decodeEntities(m.settings?.title?.value ?? m.method_id),
            costMinorUnits: m.settings?.cost?.value ? euroToMinorUnits(m.settings.cost.value) : null,
          })),
        };
      }),
    );

    return buildShippingConfig(zoneData);
  } catch {
    return null;
  }
}
