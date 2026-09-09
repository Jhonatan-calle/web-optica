"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { guardarConfiguracion } from "@/app/admin/(panel)/configuracion/actions";
import {
  configuracionSchema,
  type ConfiguracionFormInput,
  type ConfiguracionFormValues,
} from "@/lib/configuracion-schema";
import type { ValoresConfiguracion } from "@/app/admin/(panel)/configuracion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * Formulario de configuración global de la tienda (cuotas + días de la
 * etiqueta "NUEVO"). Guarda las claves en la tabla `Configuracion`.
 */
export function ConfiguracionForm({
  valores,
}: {
  valores: ValoresConfiguracion;
}) {
  const router = useRouter();
  const [guardando, setGuardando] = React.useState(false);

  const form = useForm<ConfiguracionFormInput, unknown, ConfiguracionFormValues>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      cuotasCantidad: valores.cuotasCantidad,
      cuotasConInteres: valores.cuotasConInteres,
      diasProductoNuevo: valores.diasProductoNuevo,
    },
  });

  const onSubmit = async (values: ConfiguracionFormValues) => {
    setGuardando(true);
    try {
      const resultado = await guardarConfiguracion(values);
      if (!resultado.ok) {
        toast.error("No se pudo guardar la configuración", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Configuración guardada");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar la configuración.",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <section className="space-y-4 rounded-lg border border-border bg-background p-5">
        <div>
          <h2 className="text-sm font-semibold">Pago online</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Se muestra en las cards del catálogo, el detalle del producto y el
            checkout.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="config-cuotas-cantidad">Cantidad de cuotas</Label>
          <Input
            id="config-cuotas-cantidad"
            type="number"
            min={1}
            max={12}
            inputMode="numeric"
            {...form.register("cuotasCantidad", { valueAsNumber: true })}
            aria-invalid={!!form.formState.errors.cuotasCantidad}
          />
          {form.formState.errors.cuotasCantidad && (
            <p className="text-xs text-red-500">
              {form.formState.errors.cuotasCantidad.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="config-cuotas-interes">Cuotas con interés</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Si está activo, el precio y las cuotas llevan recargo de interés.
            </p>
          </div>
          <Controller
            control={form.control}
            name="cuotasConInteres"
            render={({ field }) => (
              <Switch
                id="config-cuotas-interes"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
            )}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-background p-5">
        <div>
          <h2 className="text-sm font-semibold">Etiquetas del catálogo</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            La etiqueta &quot;10% OFF&quot; se calcula automáticamente del precio
            vs. el precio de transferencia de cada variante y no es configurable.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="config-dias-nuevo">
            Días para la etiqueta &quot;NUEVO&quot;
          </Label>
          <Input
            id="config-dias-nuevo"
            type="number"
            min={1}
            max={365}
            inputMode="numeric"
            {...form.register("diasProductoNuevo", { valueAsNumber: true })}
            aria-invalid={!!form.formState.errors.diasProductoNuevo}
          />
          {form.formState.errors.diasProductoNuevo && (
            <p className="text-xs text-red-500">
              {form.formState.errors.diasProductoNuevo.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Un producto muestra &quot;NUEVO&quot; si se creó hace este número de
            días o menos. Ej. 21 días.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" aria-hidden="true" />}
          Guardar configuración
        </Button>
      </div>
    </form>
  );
}