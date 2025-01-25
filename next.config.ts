import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  // 2) Put it in NEXT_PUBLIC_APP_VERSION
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

export default nextConfig;
