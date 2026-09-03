import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
      <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Encontrá tu marco ideal
        </h1>
        <p className="max-w-md text-base text-muted-foreground md:text-lg">
          Anteojos de sol, clip-ons, armazones y accesorios. Calidad y estilo
          para tu mirada.
        </p>
        <Button
          render={<Link href="/catalogo" />}
          nativeButton={false}
          variant="default"
          size="lg"
          className="px-6"
        >
          Ver Catálogo
        </Button>
      </div>

      <div className="hidden aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] lg:flex">
        <img
          src="/isologo.svg"
          alt="La Óptica"
          className="h-40 w-auto opacity-90 md:h-52"
        />
      </div>
    </section>
  );
}
