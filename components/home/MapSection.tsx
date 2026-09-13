import { Suspense } from "react";
import { getMapProperties } from "@/lib/properties";
import { PropertiesMapSection } from "./PropertiesMapSection";
import { Skeleton } from "@/components/ui/Skeleton";

function MapSkeleton() {
  return (
    <section className="pt-12 md:pt-16 pb-10 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-[380px] md:h-[500px] rounded-2xl" />
      </div>
    </section>
  );
}

async function MapSectionInner() {
  const mapProperties = await getMapProperties();
  return <PropertiesMapSection properties={mapProperties} />;
}

export function MapSection() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapSectionInner />
    </Suspense>
  );
}
