import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 3600; // Re-generate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";
  const locales = ['es', 'en', 'pt'];

  const staticRoutes = ['', 'favorites', 'settings'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${siteUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.5,
      });
    }
  }

  const supabase = createPublicClient();
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('active', true);

  for (const locale of locales) {
    for (const property of properties ?? []) {
      entries.push({
        url: `${siteUrl}/${locale}/propiedades/${property.slug}`,
        lastModified: property.updated_at ? new Date(property.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
