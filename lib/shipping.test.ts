import { describe, expect, it } from "vitest";
import { buildShippingConfig, type ZoneData } from "./shipping";

/* Mirrors the live zone layout (2026-08-13): Mayo €29; Galway/Sligo/Roscommon
   €39; Leitrim/Clare €49; a €59 zone that ALSO lists Clare (Woo zone order
   resolves the clash); €79 for the far south; a zero zone with nothing enabled. */
const zones: ZoneData[] = [
  {
    id: 1,
    locations: [
      { type: "state", code: "IE:SO" },
      { type: "state", code: "IE:RN" },
      { type: "state", code: "IE:G" },
    ],
    methods: [
      { method_id: "free_shipping", enabled: false, title: "Free", costMinorUnits: null },
      { method_id: "flat_rate", enabled: true, title: "McDermott's Delivery & Assembly", costMinorUnits: "3900" },
      { method_id: "local_pickup", enabled: true, title: "Click & Collect - Castlebar", costMinorUnits: null },
      { method_id: "local_pickup", enabled: true, title: "Click & Collect - Ennis", costMinorUnits: null },
    ],
  },
  {
    id: 11,
    locations: [{ type: "state", code: "IE:MO" }],
    methods: [
      { method_id: "flat_rate", enabled: true, title: "McDermott's Delivery & Assembly", costMinorUnits: "2900" },
      { method_id: "local_pickup", enabled: true, title: "Click & Collect - Castlebar", costMinorUnits: null },
    ],
  },
  {
    id: 12,
    locations: [
      { type: "state", code: "IE:LM" },
      { type: "state", code: "IE:CE" },
    ],
    methods: [
      { method_id: "flat_rate", enabled: true, title: "McDermott's Delivery & Assembly", costMinorUnits: "4900" },
    ],
  },
  {
    id: 6,
    locations: [
      { type: "state", code: "IE:CE" },
      { type: "state", code: "IE:D" },
    ],
    methods: [
      { method_id: "flat_rate", enabled: true, title: "McDermotts Delivery & Assembly", costMinorUnits: "5900" },
    ],
  },
  {
    id: 0,
    locations: [],
    methods: [{ method_id: "local_pickup", enabled: false, title: "Local pickup", costMinorUnits: null }],
  },
];

describe("buildShippingConfig", () => {
  const config = buildShippingConfig(zones);

  it("maps counties to their zone's flat rate", () => {
    expect(config.countyRates.Mayo).toMatchObject({ costMinorUnits: "2900" });
    expect(config.countyRates.Galway).toMatchObject({ costMinorUnits: "3900" });
    expect(config.countyRates.Dublin).toMatchObject({ costMinorUnits: "5900" });
  });

  it("resolves a county in two zones to the earlier zone, like Woo", () => {
    expect(config.countyRates.Clare).toMatchObject({ costMinorUnits: "4900" });
  });

  it("ignores disabled methods", () => {
    expect(Object.values(config.countyRates).every((r) => r.costMinorUnits !== null)).toBe(true);
  });

  it("collects unique pickup options", () => {
    expect(config.pickup.map((p) => p.title).sort()).toEqual([
      "Click & Collect - Castlebar",
      "Click & Collect - Ennis",
    ]);
  });

  it("leaves unmapped counties absent", () => {
    expect(config.countyRates.Kerry).toBeUndefined();
  });
});
