import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { NewInMarket } from "@/components/home/NewInMarket";
import { getProperties, getFeaturedProperties } from "@/lib/properties";

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; beds?: string; baths?: string; propertyType?: string; price_min?: string; price_max?: string }>;
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const { locale } = await props.params;
  const page = parseInt(searchParams?.page ?? "1", 10);
  const query = searchParams?.q ?? "";
  const beds = searchParams?.beds ? parseInt(searchParams.beds, 10) : undefined;
  const baths = searchParams?.baths ? parseInt(searchParams.baths, 10) : undefined;
  const propertyType = searchParams?.propertyType;

  const priceMin = searchParams?.price_min ? parseInt(searchParams.price_min, 10) : undefined;
  const priceMax = searchParams?.price_max ? parseInt(searchParams.price_max, 10) : undefined;

  const [{ properties, currentPage, totalPages }, featuredProperties] =
    await Promise.all([getProperties(page, query, beds, baths, propertyType, priceMin, priceMax), getFeaturedProperties()]);

  const isFiltering = query !== "" || beds !== undefined || baths !== undefined || propertyType !== undefined || priceMin !== undefined || priceMax !== undefined;

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
          searchParams={searchParams}
        />
      </main>
    </>
  );
}
