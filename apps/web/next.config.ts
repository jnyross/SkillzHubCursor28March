import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skill-builder/db", "@skill-builder/shared", "@skill-builder/ui"],
};

export default nextConfig;
