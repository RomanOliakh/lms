import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray
  // package-lock.json in ~/ makes Next infer the home dir as root.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Cap build worker count so `next build` doesn't saturate all 16 cores
    // and freeze the machine. Leaves headroom for the OS / editor.
    cpus: 4,
  },
};

export default nextConfig;
