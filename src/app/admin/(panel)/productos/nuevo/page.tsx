import type { Metadata } from "next";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductoForm } from "@/components/admin/producto-form";
import { AdminFormSkeleton } from "@/components/admin/admin-page-skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuevo producto | Panel La Óptica",
};

export interface LineaOption {
  id: string;
  nombre: string;
  tipo: { id: string; nombre: string };
}

/**
 * Alta de producto. Server Component: verifica el rol admin, carga las líneas
 * (agrupadas por Tipo para el selector) y renderiza el formulario.
 */
export default function NuevoProductoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Nuevo producto
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cargá los datos básicos, las variantes y sus imágenes.
        </p>
      </header>

      <Suspense fallback={<AdminFormSkeleton />}>
        <NuevoProductoSection />
      </Suspense>
    </div>
  );
}

async function NuevoProductoSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  let lineas;
  try {
    lineas = await prisma.linea.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: "asc" },
    });
  } catch (error) {
    console.error("No se pudieron cargar las líneas:", error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
        No se pudieron cargar las líneas. Intentá de nuevo en unos minutos.
      </div>
    );
  }

  return <ProductoForm lineas={lineas} />;
}