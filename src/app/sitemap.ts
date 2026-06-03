import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Public, indexable pages only.
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/menu", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/reservations", priority: 0.8 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
