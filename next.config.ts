import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray
  // package-lock.json in ~/ makes Next infer the home dir as root.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Cap the number of static-generation workers `next build` spawns.
    // Each worker is a full Node process that loads the whole app, so this
    // value is the main memory multiplier during the "Generating static
    // pages" phase. On this 16 GB Intel Mac, 4 still let the build + VS Code
    // + browser push the system into swap-thrash and a watchdog kernel panic,
    // so we drop to 2. Any value other than the default (= logical CPU count)
    // is honoured verbatim by Next. Lower to 1 if panics persist.
    cpus: 2,
  },
};

export default nextConfig;
