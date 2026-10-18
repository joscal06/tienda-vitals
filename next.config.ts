import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // La API (ProductSeeder) usa imágenes de picsum.photos, que redirige a fastly.picsum.photos.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Hay otro package-lock.json en la carpeta padre: se fija la raíz del proyecto.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
