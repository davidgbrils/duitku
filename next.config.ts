import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dev dari IP jaringan lokal (mis. pengujian dari device lain).
  // Tanpa ini, Next.js 16 memblokir resource dev (chunk/HMR) untuk host cross-origin.
  allowedDevOrigins: ["192.168.56.1"],
};

export default nextConfig;
