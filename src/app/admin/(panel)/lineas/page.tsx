import type { Metadata } from "next";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LineasManager, type LineaRow } from "@/components/admin/lineas-manager";
import { TiposManager, type TipoRow } from "@/components/admin/tipos-manager";
import { AdminTabsSkeleton } from "@/components/admin/admin-page-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Líneas y Tipos | Panel La Óptica",
};

/**
 * Gestión del catálogo (admin): Líneas (colecciones) y Tipos.
 *
 * Server Component que lee los datos con Prisma y los pasa a managers client
 * (tablas + dialogs de alta/edición/borrado). El fetch queda dentro de un
 * límite de Suspense para mostrar un skeleton mientras carga.
 */
export default function AdminLineasPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Líneas y Tipos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrupá el catálogo: tipos (ej. Anteojo de Sol) y sus líneas/colecciones.
        </p>
      </header>

      <Suspense fallback={<AdminTabsSkeleton />}>
        <LineasTab />
      </Suspense>
    </div>
  );
}

async function LineasTab() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  let lineas;
  let tipos;
  try {
    [lineas, tipos] = await Promise.all([
      prisma.linea.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          imagenUrl: true,
          tipoId: true,
          tipo: { select: { id: true, nombre: true } },
          _count: { select: { productos: true } },
        },
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      }),
      prisma.tipo.findMany({
        select: {
          id: true,
          nombre: true,
          _count: { select: { lineas: true } },
        },
        orderBy: { nombre: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("No se pudieron cargar líneas y tipos:", error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
        No se pudieron cargar las líneas y tipos. Intentá de nuevo en unos
        minutos.
      </div>
    );
  }

  const filasLineas: LineaRow[] = lineas.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    descripcion: l.descripcion,
    imagenUrl: l.imagenUrl,
    tipoId: l.tipoId,
    tipoNombre: l.tipo.nombre,
    productosCount: l._count.productos,
  }));

  const filasTipos: TipoRow[] = tipos.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    lineasCount: t._count.lineas,
  }));

  return (
    <Tabs defaultValue="lineas" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="lineas">Líneas</TabsTrigger>
        <TabsTrigger value="tipos">Tipos</TabsTrigger>
      </TabsList>
      <TabsContent value="lineas" className="pt-4">
        <LineasManager lineas={filasLineas} tipos={filasTipos} />
      </TabsContent>
      <TabsContent value="tipos" className="pt-4">
        <TiposManager tipos={filasTipos} />
      </TabsContent>
    </Tabs>
  );
}