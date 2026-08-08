import { createPublicClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Re-generate every hour

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";
  const locales = ["es", "en", "pt"];
  const staticRoutes = ["", "favorites", "settings"];

  const entries: { url: string; lastmod: string; changefreq: string; priority: string }[] = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${siteUrl}${path}`,
        lastmod: new Date().toISOString(),
        changefreq: route === "" ? "daily" : "weekly",
        priority: route === "" ? "1.0" : "0.5",
      });
    }
  }

  const supabase = createPublicClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, created_at")
    .eq("active", true);

  for (const locale of locales) {
    for (const property of properties ?? []) {
      entries.push({
        url: `${siteUrl}/${locale}/propiedades/${property.slug}`,
        lastmod: property.created_at ? new Date(property.created_at).toISOString() : new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
