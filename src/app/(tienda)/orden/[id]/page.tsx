import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

import {
  ResumenOrden,
  type ItemResumen,
  type ResumenEntrega,
} from "@/components/checkout/resumen-orden";
import { OrdenPageSkeleton } from "@/components/checkout/orden-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { BotonMercadoPago } from "@/components/checkout/boton-mercado-pago";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  ALIAS_LA_OPTICA,
  CBU_LA_OPTICA,
  DIRECCION_LOCAL,
  HORARIO_LOCAL,
  TITULAR_CUENTA,
} from "@/lib/tienda-info";
import { CLASES_COLOR_ESTADO, ETIQUETAS_ESTADO } from "@/lib/orden-utils";
import { EstadoOrden } from "@/generated/prisma/enums";

async function ContenidoOrden({
  id,
  estadoPagoMp,
}: {
  id: string;
  estadoPagoMp?: string;
}) {
  let orden;
  try {
    orden = await prisma.orden.findUnique({
      where: { id },
      include: { items: true },
    });
  } catch (error) {
    console.error("No se pudo cargar la orden:", error);
  }

  if (!orden) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-foreground">
          No pudimos cargar tu pedido.
        </p>
        <p className="text-sm text-muted-foreground">
          Revisá el link o intentá de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const esOnline = orden.metodoPago === "MERCADO_PAGO";
  const estaPagada = orden.estado === EstadoOrden.PAGADO;
  const pagoAprobado = estaPagada || estadoPagoMp === "approved";
  const pagoPendiente =
    !pagoAprobado &&
    (estadoPagoMp === "pending" || estadoPagoMp === "in_process");
  const pagoRechazado =
    !pagoAprobado &&
    (estadoPagoMp === "failure" ||
      estadoPagoMp === "rejected" ||
      estadoPagoMp === "cancelled" ||
      estadoPagoMp === "nulled");

  const puedeReintentar =
    esOnline && !pagoAprobado && !pagoPendiente && !pagoRechazado;

  const entrega: ResumenEntrega =
    orden.metodoEnvio === "RETIRO_LOCAL"
      ? { tipo: "retiro" }
      : {
          tipo: "envio",
          calle: orden.dirCalle ?? "",
          numero: orden.dirNumero ?? "",
          departamento: orden.dirDepartamento ?? undefined,
          ciudad: orden.dirCiudad ?? "",
          provincia: orden.dirProvincia ?? "",
          codigoPostal: orden.dirCodigoPostal ?? "",
        };

  const pago =
    orden.metodoPago === "MERCADO_PAGO"
      ? { tipo: "online" as const }
      : orden.metodoPago === "TRANSFERENCIA"
        ? { tipo: "transferencia" as const }
        : { tipo: "efectivo_local" as const };

  const items: ItemResumen[] = orden.items.map((item) => ({
    nombre: item.nombreSnapshot,
    color: item.colorSnapshot ?? undefined,
    precio: Number(item.precioUnitario),
    cantidad: item.cantidad,
  }));

  const subtotal = Number(orden.subtotal);
  const costoEnvio = Number(orden.costoEnvio ?? 0);
  const total = Number(orden.total);
  const descuento = Math.max(subtotal - total + costoEnvio, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00848C]/10 text-[#00848C]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {esOnline && !pagoAprobado
              ? "Tu pedido se registró correctamente"
              : "¡Gracias por tu compra!"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu pedido{" "}
            <span className="font-semibold text-foreground">
              #{orden.numero}
            </span>{" "}
            {esOnline && !pagoAprobado
              ? "está pendiente de pago."
              : "fue confirmado."}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            CLASES_COLOR_ESTADO[orden.estado],
          )}
        >
          {ETIQUETAS_ESTADO[orden.estado]}
        </span>
      </div>

      <ResumenOrden
        datos={{
          nombre: orden.nombreContacto ?? orden.emailContacto,
          email: orden.emailContacto,
          telefono: orden.telefonoContacto ?? "—",
          dni: orden.dniContacto ?? "—",
        }}
        entrega={entrega}
        pago={pago}
        items={items}
        totales={{ subtotal, descuento, costoEnvio, total }}
      />

      <div className="mt-4 flex flex-col gap-4">
        {pago.tipo === "transferencia" && (
          <div className="rounded-xl border border-border p-4 text-sm">
            <h2 className="mb-2 text-sm font-semibold">
              Coordiná el pago por transferencia
            </h2>
            <p className="text-muted-foreground">
              Transferí el total de{" "}
              <span className="font-semibold text-foreground">
                ${total.toLocaleString("es-AR")}
              </span>{" "}
              a:
            </p>
            <dl className="mt-3 flex flex-col gap-1.5">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Titular</dt>
                <dd className="text-right font-medium">{TITULAR_CUENTA}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">CBU</dt>
                <dd className="text-right font-medium">{CBU_LA_OPTICA}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Alias</dt>
                <dd className="text-right font-medium">{ALIAS_LA_OPTICA}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Envianos el comprobante por WhatsApp para confirmar tu pedido.
            </p>
          </div>
        )}

        {entrega.tipo === "retiro" && (
          <div className="rounded-xl border border-border p-4 text-sm">
            <h2 className="mb-2 text-sm font-semibold">Retirá tu pedido</h2>
            <p>
              <span className="font-medium">{DIRECCION_LOCAL}</span>
            </p>
            <p className="mt-1 text-muted-foreground">
              Horario: {HORARIO_LOCAL}
            </p>
            {pago.tipo === "efectivo_local" && (
              <p className="mt-1 text-muted-foreground">
                Abonás en efectivo al retirar.
              </p>
            )}
          </div>
        )}

        {pago.tipo === "online" && (
          <div className="rounded-xl border border-border p-4 text-sm">
            {pagoAprobado ? (
              <>
                <h2 className="mb-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ¡Pago aprobado!
                </h2>
                <p className="text-muted-foreground">
                  Gracias por tu compra. Vamos a preparar tu pedido para el
                  envío o retiro.
                </p>
              </>
            ) : pagoPendiente ? (
              <>
                <h2 className="mb-1 text-sm font-semibold">
                  Estamos esperando la confirmación del pago
                </h2>
                <p className="text-muted-foreground">
                  Con Mercado Pago puede tardar unos minutos. Te avisamos
                  apenas se confirme.
                </p>
              </>
            ) : pagoRechazado ? (
              <>
                <h2 className="mb-1 text-sm font-semibold">
                  El pago no se pudo completar
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Podés volver a intentarlo con otro medio de pago.
                </p>
                <BotonMercadoPago
                  ordenId={orden.id}
                  total={Number(orden.total)}
                />
              </>
            ) : (
              <>
                <h2 className="mb-2 text-sm font-semibold">
                  Pagá online con Mercado Pago
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Te redirigimos al checkout seguro para completar el pago. Al
                  confirmarlo, tu pedido pasa al siguiente estado.
                </p>
                {puedeReintentar && (
                  <BotonMercadoPago
                    ordenId={orden.id}
                    total={Number(orden.total)}
                  />
                )}
              </>
            )}
          </div>
        )}

        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default async function OrdenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const estadoPagoMp = typeof status === "string" ? status : undefined;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
      <Suspense fallback={<OrdenPageSkeleton />}>
        <ContenidoOrden id={id} estadoPagoMp={estadoPagoMp} />
      </Suspense>
    </main>
  );
}