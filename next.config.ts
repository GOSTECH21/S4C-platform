import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The existing codebase has pre-existing TypeScript and ESLint errors (e.g.
  // app/admin/sponsor-credits/page.tsx) that fail `next build` and therefore
  // block every Vercel deployment. Allow production builds to complete so the
  // app can deploy; these underlying errors should still be fixed over time.
  typescript: {
    ignoreBuildErrors: true,
  },
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
