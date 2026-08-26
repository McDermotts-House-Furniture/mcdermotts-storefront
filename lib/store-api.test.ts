import { describe, expect, it } from "vitest";
import { buildProductsUrl, formatPrice, sortToParams, type ProductSort } from "./store-api";

const eurPrices = {
  currency_code: "EUR",
  currency_symbol: "€",
  currency_minor_unit: 2,
  currency_decimal_separator: ".",
  currency_thousand_separator: ",",
  currency_prefix: "€",
  currency_suffix: "",
};

describe("formatPrice", () => {
  it("formats minor units into euro", () => {
    expect(formatPrice("33500", eurPrices)).toBe("€335.00");
  });

  it("groups thousands", () => {
    expect(formatPrice("129900", eurPrices)).toBe("€1,299.00");
  });

  it("handles zero", () => {
    expect(formatPrice("0", eurPrices)).toBe("€0.00");
  });

  it("respects a different minor unit", () => {
    expect(formatPrice("335", { ...eurPrices, currency_minor_unit: 0 })).toBe("€335");
  });
});

describe("sortToParams", () => {
  it.each<[ProductSort, string, string | undefined]>([
    ["popularity", "menu_order", undefined],
    ["newest", "date", undefined],
    ["price-asc", "price", "asc"],
    ["price-desc", "price", "desc"],
  ])("%s → orderby=%s order=%s", (sort, orderby, order) => {
    expect(sortToParams(sort)).toEqual(order ? { orderby, order } : { orderby });
  });
});

describe("buildProductsUrl", () => {
  it("builds the products endpoint with category, pagination and sort", () => {
    const url = new URL(
      buildProductsUrl({ category: 42, page: 2, perPage: 24, sort: "price-desc" }),
    );
    expect(url.origin + url.pathname).toBe(
      "https://mcdermotts.ie/wp-json/wc/store/v1/products",
    );
    expect(url.searchParams.get("category")).toBe("42");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("per_page")).toBe("24");
    expect(url.searchParams.get("orderby")).toBe("price");
    expect(url.searchParams.get("order")).toBe("desc");
  });

  it("omits params that are not set", () => {
    const url = new URL(buildProductsUrl({}));
    expect([...url.searchParams.keys()]).toEqual([]);
  });
});
