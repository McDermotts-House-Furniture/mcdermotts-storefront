import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
