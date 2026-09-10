"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer, Truck } from "lucide-react";
import { toast } from "sonner";

import { generarEtiquetaOrden } from "@/app/admin/(panel)/ordenes/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EtiquetaShipnowCardProps {
  ordenId: string;
  numero: number;
  tracking: string | null;
  etiquetaUrl: string | null;
}

/**
 * Card del detalle de la orden para generar la etiqueta de despacho Shipnow.
 *
 * Independiente del cambio de estado: genera el código de seguimiento (+ URL
 * de la etiqueta si la API real la devuelve) con un botón dedicado. Idempotente:
 * si la orden ya tiene tracking, el botón se deshabilita y se ofrece imprimir.
 *
 * "Imprimir etiqueta": abre `etiquetaUrl` (PDF real de Shipnow) si existe;
 * con modo Mock (etiquetaUrl = null) abre la vista imprimible local
 * (`/admin/shipnow/etiqueta/[ordenId]`).
 */
export function EtiquetaShipnowCard({
  ordenId,
  numero,
  tracking,
  etiquetaUrl,
}: EtiquetaShipnowCardProps) {
  const router = useRouter();
  const [pendiente, startTransition] = React.useTransition();
  const tieneTracking = Boolean(tracking);

  const generar = () => {
    startTransition(async () => {
      const resultado = await generarEtiquetaOrden(ordenId);
      if (!resultado.ok) {
        toast.error("No se pudo generar la etiqueta", {
          description: resultado.error,
        });
        return;
      }
      if (resultado.aviso) {
        toast.info(resultado.aviso);
      } else {
        toast.success("Etiqueta generada", {
          description: resultado.tracking
            ? `Código de seguimiento: ${resultado.tracking}`
            : undefined,
        });
      }
      router.refresh();
    });
  };

  const destinoImpresion = etiquetaUrl
    ? etiquetaUrl
    : `/admin/shipnow/etiqueta/${ordenId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4 text-[#00848C]" aria-hidden="true" />
          Etiqueta de despacho (Shipnow)
        </CardTitle>
        <CardDescription>
          Pedido #{numero}: generá el envío y el código de seguimiento para
          imprimir la etiqueta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tieneTracking ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Código de seguimiento
                </span>
                <span className="font-mono text-lg font-semibold">
                  {tracking}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  etiquetaUrl
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                )}
              >
                {etiquetaUrl ? "Shipnow" : "Simulación"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              nativeButton={false}
              title="Abrir la etiqueta de despacho en una pestaña nueva"
              render={
                <a
                  href={destinoImpresion}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Printer aria-hidden="true" />
              Imprimir etiqueta
            </Button>
          </>
        ) : (
          <>
            <Button onClick={generar} disabled={pendiente} className="w-fit">
              {pendiente && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {pendiente ? "Generando…" : "Generar etiqueta"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Genera el envío contra Shipnow y el código de seguimiento. En
              modo simulación la etiqueta es de prueba hasta validar la
              integración real con las credenciales de producción.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}