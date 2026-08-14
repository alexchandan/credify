import type { NextConfig } from "next";

const API_PROXY_TARGET = (
  process.env.API_PROXY_TARGET ?? "http://localhost:5000/api/v1"
).replace(/\/$/, "");

try {
  new URL(API_PROXY_TARGET);
} catch {
  throw new Error("API_PROXY_TARGET must be an absolute URL");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
