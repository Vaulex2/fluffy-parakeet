/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // L-03: Pinned to this project's Supabase hostname — wildcard removed
        // to prevent proxying images from arbitrary Supabase projects.
        protocol: "https",
        hostname: "vczkclhdepdvnbmggeax.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
