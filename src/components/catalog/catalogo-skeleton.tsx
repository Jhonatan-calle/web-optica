import { ProductCardSkeleton } from "@/components/catalog/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FiltrosSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}