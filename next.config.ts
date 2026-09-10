import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The supporter pages live under /dashboard/supporter/*. Redirect the
      // swapped path order (/supporter/dashboard/*) to the canonical routes.
      {
        source: "/supporter/dashboard/:path*",
        destination: "/dashboard/supporter/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
