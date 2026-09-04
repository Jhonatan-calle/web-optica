import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB]">
        <Skeleton className="h-24 w-24 rounded-lg" />
      </div>

      <Skeleton className="mt-3 h-4 w-3/4 rounded-md" />

      <div className="mt-1.5 flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>

      <Skeleton className="mt-1 h-3 w-24 rounded-md" />

      <Skeleton className="mt-3 h-8 w-full rounded-md" />
    </div>
  );
}
