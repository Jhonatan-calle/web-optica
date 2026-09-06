"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CreditCard, Landmark } from "lucide-react";
import { toast } from "sonner";

import { pagoSchema, type PagoFormValues } from "@/lib/checkout-schema";
import { calcularTotales } from "@/lib/pago-utils";
import { calcularCuotas } from "@/lib/product-utils";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import {
  ALIAS_LA_OPTICA,
  CBU_LA_OPTICA,
  DIRECCION_LOCAL,
  TITULAR_CUENTA,
} from "@/lib/tienda-info";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PagoForm() {
  const setPago = useCheckoutStore((state) => state.setPago);
  const entrega = useCheckoutStore((state) => state.entrega);
  const items = useCartStore((state) => state.items);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema) as unknown as Resolver<PagoFormValues>,
    defaultValues: { tipo: "online" },
  });

  const tipo = watch("tipo");

  const costoEnvio = entrega?.tipo === "envio" ? (entrega.costoEnvio ?? 0) : 0;
  const esRetiro = entrega?.tipo === "retiro";

  const totales = useMemo(
    () => calcularTotales(items, costoEnvio, tipo),
    [items, costoEnvio, tipo],
  );
  const totalesOnline = useMemo(
    () => calcularTotales(items, costoEnvio, "online"),
    [items, costoEnvio],
  );

  const copiarCBU = async () => {
    try {
      await navigator.clipboard.writeText(CBU_LA_OPTICA);
      toast.success("CBU copiado");
    } catch {
      toast.error("No se pudo copiar el CBU");
    }
  };

  const onSubmit = (values: PagoFormValues) => {
    setPago(values);
    if (values.tipo === "online") {
      toast.success("Pago online seleccionado", {
        description: "La conexión con Mercado Pago llega en la Fase 3.",
      });
    } else if (values.tipo === "transferencia") {
      toast.success("Transferencia seleccionada", {
        description: "El descuento ya está aplicado al total.",
      });
    } else {
      toast.success("Pago en el local seleccionado", {
        description: "La confirmación del pedido llega pronto.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <RadioGroup>
        <RadioGroupItem
          id="pago-online"
          value="online"
          {...register("tipo")}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="h-4 w-4 text-[#00848C]" />
            Pago Online
          </span>
          <span className="text-xs text-muted-foreground">
            Tarjeta de crédito, débito o dinero en cuenta. Serás redirigido a
            Mercado Pago para finalizar.
          </span>
          <span className="text-xs font-medium text-foreground">
            {calcularCuotas(totalesOnline.total)}
          </span>
        </RadioGroupItem>

        <RadioGroupItem
          id="pago-transferencia"
          value="transferencia"
          {...register("tipo")}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Landmark className="h-4 w-4 text-[#00848C]" />
            Transferencia Bancaria
          </span>
          <span className="text-xs text-muted-foreground">
            Transferís y nos enviás el comprobante. Tu descuento se aplica
            automáticamente.
          </span>
          {totales.descuento > 0 && (
            <span className="text-xs font-medium text-[#00848C]">
              Ahorrás ${totales.descuento.toLocaleString("es-AR")}
            </span>
          )}
        </RadioGroupItem>

        <RadioGroupItem
          id="pago-efectivo-local"
          value="efectivo_local"
          disabled={!esRetiro}
          {...register("tipo")}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Banknote className="h-4 w-4 text-[#00848C]" />
            Efectivo al retirar en el local
          </span>
          <span className="text-xs text-muted-foreground">
            Pagás cuando pasás a buscar tu pedido por La Óptica.
          </span>
          {!esRetiro && (
            <span className="text-xs text-muted-foreground">
              Disponible solo si elegiste retiro en el local.
            </span>
          )}
        </RadioGroupItem>
      </RadioGroup>

      {tipo === "transferencia" && (
        <div className="flex flex-col gap-1 rounded-xl border border-border p-4 text-sm">
          <p className="mb-2 font-semibold">Datos para transferir</p>
          <p>
            <span className="text-muted-foreground">Alias:</span>{" "}
            <span className="font-medium">{ALIAS_LA_OPTICA}</span>
          </p>
          <p>
            <span className="text-muted-foreground">CBU:</span>{" "}
            <span className="font-mono font-medium">{CBU_LA_OPTICA}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Titular:</span>{" "}
            <span className="font-medium">{TITULAR_CUENTA}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 self-start"
            onClick={copiarCBU}
          >
            Copiar CBU
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Envíanos el comprobante por WhatsApp para confirmar tu pedido.
          </p>
        </div>
      )}

      {tipo === "efectivo_local" && esRetiro && (
        <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
          Te esperamos en {DIRECCION_LOCAL} para retirar y pagar tu pedido.
        </p>
      )}

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
            {costoEnvio > 0
              ? `$${costoEnvio.toLocaleString("es-AR")}`
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

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={isSubmitting}
      >
        Continuar
      </Button>
    </form>
  );
}