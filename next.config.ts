import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  transpilePackages: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  serverExternalPackages: [],

  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co;
      connect-src 'self' *.supabase.co *.supabase.in fonts.gstatic.com fonts.googleapis.com cdnjs.cloudflare.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' blob: data: *.supabase.co *.supabase.in;
      font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_SITE_URL || "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
