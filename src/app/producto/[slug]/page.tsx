import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { MOCK_PRODUCTOS } from "@/lib/mock-products";

export function generateStaticParams() {
  return MOCK_PRODUCTOS.map((producto) => ({ slug: producto.slug }));
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = MOCK_PRODUCTOS.find((p) => p.slug === slug);

  if (!producto) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery
          imagen={producto.variantes[0].imagenes[0].url}
          nombre={producto.nombre}
        />
        <ProductInfo producto={producto} />
      </div>
    </main>
  );
}
