import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { NewInMarket } from "@/components/home/NewInMarket";
import { getProperties, getFeaturedProperties } from "@/lib/properties";

interface HomePageProps {
  searchParams: Promise<{ page?: string; q?: string; beds?: string; baths?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params?.page ?? "1", 10);
  const query = params?.q ?? "";
  const beds = params?.beds ? parseInt(params.beds, 10) : undefined;
  const baths = params?.baths ? parseInt(params.baths, 10) : undefined;

  const [{ properties, currentPage, totalPages }, featuredProperties] =
    await Promise.all([getProperties(page, query, beds, baths), getFeaturedProperties()]);

  const isFiltering = query !== "" || beds !== undefined || baths !== undefined;

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />
        {!isFiltering && (
          <FeaturedCollections properties={featuredProperties} />
        )}
        <NewInMarket
          properties={properties}
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={params}
        />
      </main>
    </>
  );
}
