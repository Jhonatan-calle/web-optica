import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/admin/producto-form";
import { obtenerProductoAdmin } from "@/app/admin/(panel)/productos/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar producto | Panel La Óptica",
};

/**
 * Edición de producto. Server Component: verifica el rol admin, carga el
 * producto completo (variantes + imágenes) y las líneas, y renderiza el
 * formulario en modo edición.
 */
export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  const [producto, lineas] = await Promise.all([
    obtenerProductoAdmin(id),
    prisma.linea.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!producto) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Editar producto
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modificá los datos, las variantes y sus imágenes.
        </p>
      </header>

      <ProductoForm lineas={lineas} producto={producto} />
    </div>
  );
}