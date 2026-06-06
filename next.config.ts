import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray
  // package-lock.json in ~/ makes Next infer the home dir as root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
