"use client";

import { useState } from "react";

import type { ImagenPublica } from "@/lib/catalog-types";
import { ImagenStore } from "@/components/ui/imagen-store";
import { cn } from "@/lib/utils";

export function ProductGallery({
  imagenes,
  nombre,
}: {
  imagenes: ImagenPublica[];
  nombre: string;
}) {
  const fuentes = imagenes.length > 0 ? imagenes : [{ url: "/isologo.svg" }];
  const [activa, setActiva] = useState(0);
  const indice = Math.min(activa, fuentes.length - 1);
  const imagenActiva = fuentes[indice];

  return (
    <div className="flex flex-col gap-3 md:sticky md:top-24">
      <div className="relative flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB]">
        <ImagenStore
          src={imagenActiva.url}
          alt={imagenActiva.alt ?? nombre}
          priority={indice === 0}
          sizes="(max-width: 767px) 100vw, 50vw"
          className="object-contain opacity-80"
        />
      </div>

      {fuentes.length > 1 && (
        <div className="flex gap-2">
          {fuentes.map((imagen, i) => (
            <button
              key={`${imagen.url}-${i}`}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Imagen ${i + 1} de ${imagen.alt ?? nombre}`}
              className={cn(
                "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-[#F9FAFB] transition-colors",
                i === indice
                  ? "ring-2 ring-[#00848C]"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <ImagenStore
                src={imagen.url}
                alt={imagen.alt ?? nombre}
                sizes="64px"
                className="object-contain"
                width={40}
                height={40}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}