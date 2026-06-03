import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private / authenticated / API areas out of search results.
        disallow: ["/admin", "/api", "/auth", "/checkout", "/orders", "/profile", "/reservations/manage"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
