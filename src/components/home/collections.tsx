import Link from "next/link";

import { MOCK_PRODUCTOS } from "@/lib/mock-products";

const HREF_POR_LINEA: Record<string, string> = {
  "Línea Sun": "/catalogo/sol",
  "Línea Clip-on": "/catalogo/clip-ons",
  "Línea Recetados": "/catalogo/recetados",
};

const COLECCIONES = MOCK_PRODUCTOS.reduce((acc, producto) => {
  const linea = producto.linea;
  if (!acc.some((c) => c.nombre === linea.nombre)) {
    acc.push({
      nombre: linea.nombre,
      tipo: linea.tipo.nombre,
      imagenUrl: linea.imagenUrl ?? "/isologo.svg",
      href: HREF_POR_LINEA[linea.nombre] ?? "/catalogo",
    });
  }
  return acc;
}, [] as { nombre: string; tipo: string; imagenUrl: string; href: string }[]);

export function Collections() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">
        Colecciones
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {COLECCIONES.map((collection) => (
          <Link
            key={collection.nombre}
            href={collection.href}
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