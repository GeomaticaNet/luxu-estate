export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-nordic-dark/5 rounded-lg ${className}`} />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-soft">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-6 border-t border-nordic-dark/5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
