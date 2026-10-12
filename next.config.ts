import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; keep it out of the bundle (also in Next's default list).
  serverExternalPackages: ["better-sqlite3"],
  devIndicators: false,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
