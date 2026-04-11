import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { NewInMarket } from "@/components/home/NewInMarket";
import { getProperties, getFeaturedProperties } from "@/lib/properties";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params?.page ?? "1", 10);

  const [{ properties, currentPage, totalPages }, featuredProperties] =
    await Promise.all([getProperties(page), getFeaturedProperties()]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />
        <FeaturedCollections properties={featuredProperties} />
        <NewInMarket
          properties={properties}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </main>
    </>
  );
}
