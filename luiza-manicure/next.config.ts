import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600],
    imageSizes: [96, 160, 256, 384],
    qualities: [75, 82],
  },
  poweredByHeader: false,
};

export default nextConfig;
