import type { NextConfig } from "next";

// The deployed site's address opens the Saransh EPK (app/epk).
// Temporary (non-permanent) redirect; the YieldIt homepage code is untouched in app/page.tsx.
// To restore the YieldIt homepage at "/", delete the redirects() block below.
const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/epk", permanent: false }];
  },
};

export default nextConfig;
