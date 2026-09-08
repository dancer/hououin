import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: () =>
    Promise.resolve([
      {
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
        source: "/:path*",
      },
      {
        headers: [{ key: "Cache-Control", value: "no-store, private" }],
        source: "/api/:path*",
      },
    ]),
  images: {
    remotePatterns: [{ hostname: "media.valorant-api.com", protocol: "https" }],
  },
};

export default nextConfig;
