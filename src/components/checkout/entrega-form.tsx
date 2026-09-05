"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Truck } from "lucide-react";
import { toast } from "sonner";

import { entregaSchema, type EntregaFormValues } from "@/lib/checkout-schema";
import { calcularTarifaEnvio } from "@/lib/envio-utils";
import { useCheckoutStore, type EntregaPersistida } from "@/lib/checkout-store";
import { DIRECCION_LOCAL, HORARIO_LOCAL } from "@/lib/tienda-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type EstadoCotizacion =
  | { estado: "invalido" }
  | { estado: "sin_cobertura" }
  | { estado: "ok"; precio: number };

export function EntregaForm() {
  const setEntrega = useCheckoutStore((state) => state.setEntrega);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntregaFormValues>({
    resolver: zodResolver(entregaSchema) as unknown as Resolver<EntregaFormValues>,
    defaultValues: { tipo: "retiro" },
  });

  const tipo = watch("tipo");
  const cp = watch("codigoPostal");
  const [cotizado, setCotizado] = useState<EstadoCotizacion | null>(null);

  useEffect(() => {
    setCotizado(null);
  }, [tipo]);

  const calcularEnvio = () => {
    setCotizado(calcularTarifaEnvio(cp ?? ""));
  };

  const onSubmit = (values: EntregaFormValues) => {
    if (values.tipo === "retiro") {
      setEntrega({ tipo: "retiro" });
      toast.success("Retiro en el local seleccionado", {
        description: "El siguiente paso (pago) llega pronto.",
      });
      return;
    }

    const tarifa =
      cotizado?.estado === "ok"
        ? cotizado
        : calcularTarifaEnvio(values.codigoPostal);

    if (tarifa.estado !== "ok") {
      toast.error("Calculá tu envío primero", {
        description: "Ingresá tu código postal y tocá Calcular.",
      });
      return;
    }

    const entrega: EntregaPersistida = {
      tipo: "envio",
      calle: values.calle.trim(),
      numero: values.numero.trim(),
      departamento: values.departamento?.trim() || undefined,
      ciudad: values.ciudad.trim(),
      provincia: values.provincia.trim(),
      codigoPostal: values.codigoPostal.trim(),
      costoEnvio: tarifa.precio,
    };
    setEntrega(entrega);
    toast.success("Datos de entrega guardados", {
      description: "El siguiente paso (pago) llega pronto.",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <RadioGroup>
        <RadioGroupItem
          id="entrega-envio"
          value="envio"
          {...register("tipo")}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="h-4 w-4 text-[#00848C]" />
            Envío a Domicilio
          </span>
          <span className="text-xs text-muted-foreground">
            Entregamos a todo el país. El costo se calcula según tu código
            postal.
          </span>
        </RadioGroupItem>

        <RadioGroupItem
          id="entrega-retiro"
          value="retiro"
          {...register("tipo")}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Store className="h-4 w-4 text-[#00848C]" />
            Retiro en el Local
          </span>
          <span className="text-xs text-muted-foreground">
            Retiro gratis en La Óptica · {DIRECCION_LOCAL}
          </span>
          <span className="text-xs text-muted-foreground">
            Horario: {HORARIO_LOCAL}
          </span>
        </RadioGroupItem>
      </RadioGroup>

      {tipo === "envio" && (
        <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold">Dirección de envío</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entrega-calle">Calle</Label>
            <Input
              id="entrega-calle"
              placeholder="Av. San Martín"
              autoComplete="address-line1"
              aria-invalid={!!errors.calle}
              aria-describedby={
                errors.calle ? "entrega-calle-error" : undefined
              }
              {...register("calle")}
            />
            {errors.calle?.message && (
              <p id="entrega-calle-error" className="text-xs text-red-500">
                {errors.calle.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entrega-numero">Número</Label>
              <Input
                id="entrega-numero"
                placeholder="123"
                inputMode="numeric"
                autoComplete="address-line2"
                aria-invalid={!!errors.numero}
                aria-describedby={
                  errors.numero ? "entrega-numero-error" : undefined
                }
                {...register("numero")}
              />
              {errors.numero?.message && (
                <p id="entrega-numero-error" className="text-xs text-red-500">
                  {errors.numero.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entrega-departamento">
                Departamento <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="entrega-departamento"
                placeholder="3° B"
                autoComplete="address-line2"
                {...register("departamento")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entrega-ciudad">Ciudad</Label>
              <Input
                id="entrega-ciudad"
                placeholder="Río Cuarto"
                autoComplete="address-level2"
                aria-invalid={!!errors.ciudad}
                aria-describedby={
                  errors.ciudad ? "entrega-ciudad-error" : undefined
                }
                {...register("ciudad")}
              />
              {errors.ciudad?.message && (
                <p id="entrega-ciudad-error" className="text-xs text-red-500">
                  {errors.ciudad.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entrega-provincia">Provincia</Label>
              <Input
                id="entrega-provincia"
                placeholder="Córdoba"
                autoComplete="address-level1"
                aria-invalid={!!errors.provincia}
                aria-describedby={
                  errors.provincia ? "entrega-provincia-error" : undefined
                }
                {...register("provincia")}
              />
              {errors.provincia?.message && (
                <p id="entrega-provincia-error" className="text-xs text-red-500">
                  {errors.provincia.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entrega-cp">Código postal</Label>
            <div className="flex gap-2">
              <Input
                id="entrega-cp"
                placeholder="5800"
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={!!errors.codigoPostal}
                aria-describedby={
                  errors.codigoPostal ? "entrega-cp-error" : undefined
                }
                {...register("codigoPostal")}
              />
              <Button type="button" variant="outline" onClick={calcularEnvio}>
                Calcular
              </Button>
            </div>
            {errors.codigoPostal?.message && (
              <p id="entrega-cp-error" className="text-xs text-red-500">
                {errors.codigoPostal.message}
              </p>
            )}
            <div className="min-h-6 text-sm">
              {cotizado?.estado === "invalido" && (
                <p className="text-[#B91C1C]">
                  Ingresá un código postal válido de 4 dígitos.
                </p>
              )}
              {cotizado?.estado === "sin_cobertura" && (
                <p className="text-muted-foreground">
                  No encontramos envío para ese código postal. Consultanos por
                  WhatsApp.
                </p>
              )}
              {cotizado?.estado === "ok" && (
                <p className="text-muted-foreground">
                  Envío estimado:{" "}
                  <span className="font-semibold text-foreground">
                    ${cotizado.precio.toLocaleString("es-AR")}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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