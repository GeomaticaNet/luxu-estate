import { Hero } from "@/components/home/Hero";
import { ScrollToHash } from "@/components/home/ScrollToHash";
import { MapSection } from "@/components/home/MapSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { NewInMarketSection } from "@/components/home/NewInMarketSection";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; beds?: string; baths?: string; propertyType?: string; price_min?: string; price_max?: string; type?: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";

  return {
    title: t("home_title"),
    description: t("home_description"),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        "es-AR": `${siteUrl}/es`,
        "en-US": `${siteUrl}/en`,
        "pt-BR": `${siteUrl}/pt`,
      },
    },
    openGraph: {
      title: t("home_title"),
      description: t("home_description"),
      url: `${siteUrl}/${locale}`,
      type: "website",
    },
  };
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams;

  return (
    <>
      <ScrollToHash />
      <Hero />
      <MapSection />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedSection searchParams={searchParams} />
      </main>
      <NewInMarketSection searchParams={searchParams} />
    </>
  );
}
