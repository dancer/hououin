import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "media.valorant-api.com", protocol: "https" }],
  },
};

export default nextConfig;
