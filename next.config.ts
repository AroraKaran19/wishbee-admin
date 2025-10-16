import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  experimental: {
    // Disable LightningCSS
    useLightningcss: false,
  },
};

export default nextConfig;
