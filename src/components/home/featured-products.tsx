import { ProductCard } from "@/components/catalog/product-card";
import { obtenerDestacados } from "@/lib/catalog-utils";
import { obtenerConfigCuotas } from "@/lib/config-utils";

export async function FeaturedProducts() {
  let destacados;
  let configCuotas;
  try {
    [destacados, configCuotas] = await Promise.all([
      obtenerDestacados(),
      obtenerConfigCuotas(),
    ]);
  } catch (error) {
    console.error("No se pudieron cargar los destacados:", error);
    return null;
  }

  if (destacados.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">
        Productos Destacados
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {destacados.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            configCuotas={configCuotas}
          />
        ))}
      </div>
    </section>
  );
}