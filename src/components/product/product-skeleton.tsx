import { Skeleton } from "@/components/ui/skeleton";

export function ProductPageSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12" aria-hidden="true">
      <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB]">
        <Skeleton className="h-32 w-40 rounded-lg" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="mt-2 h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}