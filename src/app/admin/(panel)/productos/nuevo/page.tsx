import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/admin/producto-form";

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
export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const lineas = await prisma.linea.findMany({
    select: { id: true, nombre: true, tipo: { select: { id: true, nombre: true } } },
    orderBy: { nombre: "asc" },
  });

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

      <ProductoForm lineas={lineas} />
    </div>
  );
}