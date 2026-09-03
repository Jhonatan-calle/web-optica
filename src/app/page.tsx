export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
        La Óptica
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        Anteojos de sol, clip-ons, armazones y accesorios. Tienda en línea en
        construcción.
      </p>
      <span className="inline-flex items-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground">
        Bienvenido
      </span>
    </main>
  );
}
