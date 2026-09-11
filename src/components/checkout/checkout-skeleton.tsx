import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6" aria-hidden="true">
      <Skeleton className="mb-6 h-8 w-48 rounded-md" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}