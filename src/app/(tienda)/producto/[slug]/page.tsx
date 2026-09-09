import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { obtenerProductoPublicoPorSlug } from "@/lib/catalog-utils";
import { obtenerConfigGlobal } from "@/lib/config-utils";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let producto;
  let config;
  try {
    [producto, config] = await Promise.all([
      obtenerProductoPublicoPorSlug(slug),
      obtenerConfigGlobal(),
    ]);
  } catch (error) {
    console.error("No se pudo cargar el producto:", error);
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">
            No pudimos cargar el producto.
          </p>
          <p className="text-sm text-muted-foreground">
            Intentá de nuevo en unos minutos.
          </p>
        </div>
      </main>
    );
  }

  if (!producto) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery
          imagenes={producto.variantes[0].imagenes}
          nombre={producto.nombre}
        />
        <ProductInfo
          producto={producto}
          configCuotas={config.cuotas}
          diasNuevo={config.diasNuevo}
        />
      </div>
    </main>
  );
}