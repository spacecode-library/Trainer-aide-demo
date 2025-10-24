import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'export' to support dynamic routes with client-side rendering
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
