import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all hostnames
      },
    ],
    // Remove unoptimized: true for SSR deployments
  },
  
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  
  // Optimize package bundling
  serverExternalPackages: [
    // Add any large packages that don't need bundling
    'sharp',
    'canvas',
    'jsdom'
  ],
};

export default nextConfig;