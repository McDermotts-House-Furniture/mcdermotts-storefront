import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Lets the dev server answer requests made from a phone on the LAN
     (Declan, 2026-09-05: testing at 192.168.1.149:3000) — without this,
     Next.js's default dev-only cross-origin protection 403s every JS chunk
     the page needs, so React never hydrates and NOTHING on the page
     responds to a tap (not just swatches — literally anything client-side).
     If the machine's LAN IP changes later, add the new one here too. */
  allowedDevOrigins: ["192.168.1.149"],
  images: {
    // Product/category imagery comes from the live WooCommerce media library.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mcdermotts.ie",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "www.mcdermotts.ie",
        pathname: "/wp-content/**",
      },
    ],
  },
};

export default nextConfig;
