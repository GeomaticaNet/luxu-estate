import { Suspense } from "react";
import { getFeaturedProperties } from "@/lib/properties";
import { FeaturedCollections } from "./FeaturedCollections";
import { Skeleton, FeaturedCardSkeleton } from "@/components/ui/Skeleton";

function FeaturedSkeleton() {
  return (
    <section className="mb-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeaturedCardSkeleton />
        <FeaturedCardSkeleton />
        <FeaturedCardSkeleton />
      </div>
    </section>
  );
}

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

async function FeaturedSectionInner() {
  const featuredProperties = await getFeaturedProperties();
  return <FeaturedCollections properties={featuredProperties} />;
}

export function FeaturedSection({ searchParams }: Props) {
  const isFiltering = searchParams
    ? Object.keys(searchParams).some(
        (k) =>
          k !== "page" &&
          k !== "type" &&
          searchParams[k] !== undefined &&
          searchParams[k] !== ""
      )
    : false;

  if (isFiltering) return null;

  return (
    <Suspense fallback={<FeaturedSkeleton />}>
      <FeaturedSectionInner />
    </Suspense>
  );
}
