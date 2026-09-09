import type { Metadata } from "next";

import { obtenerConfiguracionAdmin } from "./actions";
import { ConfiguracionForm } from "@/components/admin/configuracion-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración | Panel La Óptica",
};

/**
 * Página de configuración global de la tienda (cuotas y etiquetas).
 * El server action valida el guard de admin y devuelve los valores actuales.
 */
export default async function ConfiguracionPage() {
  const valores = await obtenerConfiguracionAdmin();

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

      <ConfiguracionForm valores={valores} />
    </div>
  );
}