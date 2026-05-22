import { PropertyCardSkeleton, FeaturedCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero skeleton */}
      <div className="py-12 md:py-16 max-w-3xl mx-auto text-center space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-nordic-dark/5 rounded-lg max-w-md mx-auto mb-4" />
          <div className="h-14 bg-nordic-dark/5 rounded-xl max-w-2xl mx-auto" />
          <div className="flex gap-3 justify-center mt-8">
            <div className="h-10 w-24 bg-nordic-dark/5 rounded-full" />
            <div className="h-10 w-24 bg-nordic-dark/5 rounded-full" />
            <div className="h-10 w-24 bg-nordic-dark/5 rounded-full" />
            <div className="h-10 w-24 bg-nordic-dark/5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Featured section skeleton */}
      <div className="mb-16">
        <div className="flex items-end justify-between mb-8">
          <div className="animate-pulse space-y-2">
            <div className="h-7 w-48 bg-nordic-dark/5 rounded-lg" />
            <div className="h-4 w-64 bg-nordic-dark/5 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FeaturedCardSkeleton />
          <FeaturedCardSkeleton />
        </div>
      </div>

      {/* New in Market skeleton */}
      <div>
        <div className="flex items-end justify-between mb-8">
          <div className="animate-pulse space-y-2">
            <div className="h-7 w-40 bg-nordic-dark/5 rounded-lg" />
            <div className="h-4 w-56 bg-nordic-dark/5 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
