import Link from "next/link";

import { obtenerColecciones } from "@/lib/catalog-utils";

export async function Collections() {
  let colecciones;
  try {
    colecciones = await obtenerColecciones();
  } catch (error) {
    console.error("No se pudieron cargar las colecciones:", error);
    return null;
  }

  if (colecciones.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">
        Colecciones
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {colecciones.map((collection) => (
          <Link
            key={collection.id}
            href={{ pathname: "/catalogo", query: { linea: collection.nombre } }}
            className="group flex flex-col overflow-hidden rounded-lg"
          >
            <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] transition-colors group-hover:bg-brand-muted">
              <img
                src={collection.imagenUrl}
                alt={collection.nombre}
                className="h-16 w-auto opacity-80"
              />
            </div>
            <span className="mt-3 text-sm font-medium md:text-base">
              {collection.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}