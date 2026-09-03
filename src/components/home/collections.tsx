import Link from "next/link";

const COLLECTIONS = [
  { name: "Línea Sun", href: "/catalogo/sol" },
  { name: "Línea Clip-on", href: "/catalogo/clip-ons" },
  { name: "Línea Recetados", href: "/catalogo/recetados" },
];

export function Collections() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">
        Colecciones
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.href}
            href={collection.href}
            className="group flex flex-col overflow-hidden rounded-lg"
          >
            <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] transition-colors group-hover:bg-brand-muted">
              <img
                src="/isologo.svg"
                alt=""
                aria-hidden="true"
                className="h-16 w-auto opacity-80"
              />
            </div>
            <span className="mt-3 text-sm font-medium md:text-base">
              {collection.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
