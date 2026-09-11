import { Suspense } from "react";

import { Hero } from "@/components/home/hero";
import { Collections } from "@/components/home/collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ValueBanner } from "@/components/home/value-banner";
import { CatalogoGridSkeleton } from "@/components/catalog/catalogo-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

function ColeccionesSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-hidden="true"
    >
      <Skeleton className="mb-6 h-8 w-48 rounded-md" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-lg bg-[#F9FAFB]"
          >
            <Skeleton className="h-16 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Suspense fallback={<ColeccionesSkeleton />}>
        <Collections />
      </Suspense>
      <Suspense fallback={<CatalogoGridSkeleton count={4} />}>
        <FeaturedProducts />
      </Suspense>
      <ValueBanner />
    </main>
  );
}