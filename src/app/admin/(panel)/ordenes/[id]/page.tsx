import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PackageCheck, Truck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
import { MetodoEnvio } from "@/generated/prisma/enums";
import { formatearFecha, formatearPesos } from "@/lib/format-utils";
import {
  CLASES_COLOR_ESTADO,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ENVIO,
  ETIQUETAS_PAGO,
} from "@/lib/orden-utils";
import { DIRECCION_LOCAL } from "@/lib/tienda-info";
import { OrdenEstadoForm } from "@/components/admin/orden-estado-form";
import { EtiquetaShipnowCard } from "@/components/admin/etiqueta-shipnow-card";
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalle de pedido | Panel La Óptica",
};

interface DetalleOrdenPageProps {
  params: Promise<{ id: string }>;
}

const FECHA_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Detalle de un pedido del panel admin: desglose de productos (snapshot de
 * precio/variante), datos de contacto + DNI, dirección de envío/retiro y un
 * formulario para actualizar el estado y el número de seguimiento.
 */
export default async function DetalleOrdenPage({
  params,
}: DetalleOrdenPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esAdmin(user)) {
    redirect("/");
  }

  let orden;
  try {
    orden = await prisma.orden.findUnique({
      where: { id },
      include: { items: true },
    });
  } catch (error) {
    console.error("No se pudo cargar la orden:", error);
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No pudimos cargar el pedido.
        </p>
        <p className="text-sm text-muted-foreground">
          Intentá de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  if (!orden) {
    notFound();
  }

  const esRetiro = orden.metodoEnvio === MetodoEnvio.RETIRO_LOCAL;
  const subtotal = Number(orden.subtotal);
  const costoEnvio = Number(orden.costoEnvio ?? 0);
  const total = Number(orden.total);
  const descuento = Math.max(subtotal - total + costoEnvio, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/ordenes" />}
          className="-ml-2 w-fit"
        >
          <ArrowLeft aria-hidden="true" />
          Volver a órdenes
        </Button>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Pedido #{orden.numero}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "border-transparent",
              CLASES_COLOR_ESTADO[orden.estado],
            )}
          >
            {ETIQUETAS_ESTADO[orden.estado]}
          </Badge>
          <Badge variant="secondary">
            {ETIQUETAS_PAGO[orden.metodoPago]}
          </Badge>
          <Badge variant="outline">
            {ETIQUETAS_ENVIO[orden.metodoEnvio]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Creado el {formatearFecha(orden.createdAt, FECHA_TIMEZONE)}.
        </p>
      </header>

      {orden.alertaStock && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <span aria-hidden="true">⚠️</span>
          <p>
            <span className="font-semibold">Faltó stock</span> para completar
            este pedido al momento de la confirmación del pago. Revisá la
            variante y regularizá el stock o contactá al cliente.
          </p>
        </div>
      )}

      <OrdenEstadoForm
        ordenId={orden.id}
        numero={orden.numero}
        estadoActual={orden.estado}
        trackingActual={orden.trackingNumber}
        metodoEnvio={orden.metodoEnvio}
      />

      {!esRetiro && (
        <EtiquetaShipnowCard
          ordenId={orden.id}
          numero={orden.numero}
          tracking={orden.trackingNumber}
          etiquetaUrl={orden.etiquetaUrl}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-1 text-sm">
              <FilaDato etiqueta="Nombre" valor={orden.nombreContacto ?? "—"} />
              <FilaDato etiqueta="Email" valor={orden.emailContacto} />
              <FilaDato
                etiqueta="Teléfono"
                valor={orden.telefonoContacto ?? "—"}
              />
              <FilaDato etiqueta="DNI" valor={orden.dniContacto ?? "—"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {esRetiro ? (
                <PackageCheck className="size-4 text-[#00848C]" />
              ) : (
                <Truck className="size-4 text-[#00848C]" />
              )}
              Logística
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="font-medium">{ETIQUETAS_ENVIO[orden.metodoEnvio]}</p>
            {esRetiro ? (
              <p className="text-muted-foreground">{DIRECCION_LOCAL}</p>
            ) : (
              <div className="text-muted-foreground">
                <p>
                  {orden.dirCalle} {orden.dirNumero}
                  {orden.dirDepartamento ? `, ${orden.dirDepartamento}` : ""}
                </p>
                <p>
                  {orden.dirCiudad}, {orden.dirProvincia} · CP{" "}
                  {orden.dirCodigoPostal}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            Desglose con el snapshot del precio y la variante al momento de la
            compra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {orden.items.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">
                Sin productos.
              </li>
            )}
            {orden.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.nombreSnapshot}</p>
                  {item.colorSnapshot && (
                    <p className="text-xs text-muted-foreground">
                      Color: {item.colorSnapshot}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.cantidad} × {formatearPesos(Number(item.precioUnitario))}
                  </p>
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatearPesos(Number(item.subtotal))}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card size="sm" className="lg:w-1/2">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatearPesos(subtotal)}
            </span>
          </div>
          {descuento > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#00848C]">Descuento transferencia</span>
              <span className="font-medium tabular-nums text-[#00848C]">
                −{formatearPesos(descuento)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Costo de envío</span>
            <span className="font-medium tabular-nums">
              {costoEnvio > 0 ? formatearPesos(costoEnvio) : "Gratis"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatearPesos(total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  );
}