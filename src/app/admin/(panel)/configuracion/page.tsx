import type { Metadata } from "next";
import { Suspense } from "react";

import { obtenerConfiguracionAdmin } from "./actions";
import { ConfiguracionForm } from "@/components/admin/configuracion-form";
import { AdminFormSkeleton } from "@/components/admin/admin-page-skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración | Panel La Óptica",
};

/**
 * Página de configuración global de la tienda (cuotas y etiquetas).
 * El server action valida el guard de admin y devuelve los valores actuales.
 */
export default function ConfiguracionPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustes globales de la tienda: cuotas del pago online y etiquetas del
          catálogo.
        </p>
      </header>

      <Suspense fallback={<AdminFormSkeleton />}>
        <ConfiguracionSection />
      </Suspense>
    </div>
  );
}

async function ConfiguracionSection() {
  let valores;
  try {
    valores = await obtenerConfiguracionAdmin();
  } catch (error) {
    console.error("No se pudo cargar la configuración:", error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
        No se pudo cargar la configuración. Intentá de nuevo en unos minutos.
      </div>
    );
  }

  return <ConfiguracionForm valores={valores} />;
}