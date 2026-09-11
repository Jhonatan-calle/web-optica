import {
  Banknote,
  CreditCard,
  Landmark,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import type { TipoPago } from "@/lib/checkout-schema";
import type { Totales } from "@/lib/pago-utils";
import { DIRECCION_LOCAL } from "@/lib/tienda-info";

export interface ItemResumen {
  nombre: string;
  color?: string;
  precio: number;
  cantidad: number;
}

export interface ResumenContacto {
  nombre: string;
  email: string;
  telefono: string;
  dni: string;
}

export type ResumenEntrega =
  | {
      tipo: "envio";
      calle: string;
      numero: string;
      departamento?: string;
      ciudad: string;
      provincia: string;
      codigoPostal: string;
    }
  | {
      tipo: "retiro";
    };

export interface ResumenOrdenProps {
  datos: ResumenContacto;
  entrega: ResumenEntrega;
  pago: { tipo: TipoPago };
  items: ItemResumen[];
  totales: Totales;
}

const ETIQUETAS_PAGO: Record<TipoPago, { etiqueta: string; detalle?: string }> = {
  online: {
    etiqueta: "Pago online",
    detalle: "Se procesa con Mercado Pago al confirmar la compra",
  },
  transferencia: { etiqueta: "Transferencia bancaria" },
  efectivo_local: { etiqueta: "Efectivo al retirar en el local" },
};

export function ResumenOrden({
  datos,
  entrega,
  pago,
  items,
  totales,
}: ResumenOrdenProps) {
  const pagoInfo = ETIQUETAS_PAGO[pago.tipo];
  const IconoPago =
    pago.tipo === "online"
      ? CreditCard
      : pago.tipo === "transferencia"
        ? Landmark
        : Banknote;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4">
        <h2 className="mb-2 text-sm font-semibold">Datos de contacto</h2>
        <p className="text-sm">
          {datos.nombre} · {datos.email}
        </p>
        <p className="text-sm text-muted-foreground">
          {datos.telefono} · DNI {datos.dni}
        </p>
      </div>

      <div className="rounded-xl border border-border p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          {entrega.tipo === "envio" ? (
            <Truck className="h-4 w-4 text-[#00848C]" />
          ) : (
            <PackageCheck className="h-4 w-4 text-[#00848C]" />
          )}
          Método de entrega
        </h2>
        {entrega.tipo === "envio" ? (
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">
              Envío a domicilio · Shipnow · {entrega.calle} {entrega.numero}
              {entrega.departamento ? `, ${entrega.departamento}` : ""}
            </p>
            <p className="text-muted-foreground">
              {entrega.ciudad}, {entrega.provincia} · CP {entrega.codigoPostal}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">Retiro en el local (gratis)</p>
            <p className="text-muted-foreground">{DIRECCION_LOCAL}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <IconoPago className="h-4 w-4 text-[#00848C]" />
          Método de pago
        </h2>
        <p className="text-sm">{pagoInfo.etiqueta}</p>
        {pagoInfo.detalle && (
          <p className="text-sm text-muted-foreground">{pagoInfo.detalle}</p>
        )}
      </div>

      <div className="rounded-xl border border-border p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="h-4 w-4 text-[#00848C]" />
          Productos
        </h2>
        <ul className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start justify-between gap-3 text-sm">
              <p>
                <span className="font-medium">
                  {item.cantidad} × {item.nombre}
                </span>
                {item.color && (
                  <span className="block text-xs text-muted-foreground">
                    Color: {item.color}
                  </span>
                )}
              </p>
              <span className="shrink-0 font-medium">
                ${(item.precio * item.cantidad).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-border p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            ${totales.subtotal.toLocaleString("es-AR")}
          </span>
        </div>
        {totales.descuento > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[#00848C]">Descuento transferencia</span>
            <span className="font-medium text-[#00848C]">
              −${totales.descuento.toLocaleString("es-AR")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Costo de envío</span>
          <span className="font-medium">
            {totales.costoEnvio > 0
              ? `$${totales.costoEnvio.toLocaleString("es-AR")}`
              : "Gratis"}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-semibold">
            ${totales.total.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </div>
  );
}