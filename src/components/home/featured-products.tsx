"use client";

import { ProductCard } from "@/components/catalog/product-card";
import { MOCK_PRODUCTOS } from "@/lib/mock-products";

export function FeaturedProducts() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">
        Productos Destacados
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {MOCK_PRODUCTOS.map((producto) => (
          <ProductCard key={producto.varianteId} producto={producto} />
        ))}
      </div>
    </section>
  );
}
