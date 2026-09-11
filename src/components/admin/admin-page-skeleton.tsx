import { Skeleton } from "@/components/ui/skeleton";

export function AdminFormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-9 w-64 rounded-md" />
      <Skeleton className="h-4 w-72 rounded-md" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-11 w-40 rounded-lg" />
    </div>
  );
}

export function AdminTabsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-9 w-64 rounded-md" />
      <Skeleton className="h-4 w-80 rounded-md" />
      <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
          >
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="ml-auto h-4 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}