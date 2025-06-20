import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  future: {
    webpack5: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: config => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
