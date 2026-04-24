import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "ik.imagekit.io",       protocol: "https" },
      { hostname: "html.tailus.io",        protocol: "https" }, // hero-section SVG logos
      { hostname: "images.unsplash.com",   protocol: "https" }, // archive / media
    ],
  },
};

export default nextConfig;
