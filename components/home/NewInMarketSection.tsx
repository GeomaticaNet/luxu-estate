import { Suspense } from "react";
import { getProperties } from "@/lib/properties";
import { NewInMarket } from "./NewInMarket";
import { Skeleton, PropertyCardSkeleton } from "@/components/ui/Skeleton";

function NewInMarketSkeleton() {
  return (
    <section id="new-in-market" className="relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

async function NewInMarketSectionInner({ searchParams }: Props) {
  const page = parseInt(String(searchParams?.page ?? "1"), 10);
  const query = String(searchParams?.q ?? "");
  const beds = searchParams?.beds ? parseInt(String(searchParams.beds), 10) : undefined;
  const baths = searchParams?.baths ? parseInt(String(searchParams.baths), 10) : undefined;
  const propertyType = searchParams?.propertyType ? String(searchParams.propertyType) : undefined;
  const priceMin = searchParams?.price_min ? parseInt(String(searchParams.price_min), 10) : undefined;
  const priceMax = searchParams?.price_max ? parseInt(String(searchParams.price_max), 10) : undefined;
  const listingType = (searchParams?.type === "rent" ? "rent" : searchParams?.type === "all" ? "all" : "buy") as "buy" | "rent" | "all";

  const { properties, currentPage, totalPages } = await getProperties(
    page, query, beds, baths, propertyType, priceMin, priceMax, listingType
  );

  return (
    <NewInMarket
      properties={properties}
      currentPage={currentPage}
      totalPages={totalPages}
      searchParams={searchParams}
      listingType={listingType}
    />
  );
}

export function NewInMarketSection({ searchParams }: Props) {
  return (
    <Suspense fallback={<NewInMarketSkeleton />}>
      <NewInMarketSectionInner searchParams={searchParams} />
    </Suspense>
  );
}
