"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { actualizarEstadoOrden } from "@/app/admin/(panel)/ordenes/actions";
import { EstadoOrden, MetodoEnvio } from "@/generated/prisma/enums";
import {
  CLASES_COLOR_ESTADO,
  ESTADOS_ORDEN,
  ETIQUETAS_ESTADO,
} from "@/lib/orden-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueLabel,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OrdenEstadoFormProps {
  ordenId: string;
  numero: number;
  estadoActual: EstadoOrden;
  trackingActual: string | null;
  metodoEnvio: MetodoEnvio;
}

const OPCIONES_ESTADO = ESTADOS_ORDEN.map((estado) => ({
  value: estado,
  label: ETIQUETAS_ESTADO[estado],
}));

/**
 * Formulario admin para actualizar el estado del pedido y el número de
 * seguimiento del correo.
 *
 * Reglas de negocio:
 * - CANCELADO exige confirmación con AlertDialog.
 * - DESPACHADO con envío por correo exige tracking (además se revalida en el
 *   servidor dentro de la Server Action).
 * - RETIRO_LOCAL deja el tracking deshabilitado.
 */
export function OrdenEstadoForm({
  ordenId,
  numero,
  estadoActual,
  trackingActual,
  metodoEnvio,
}: OrdenEstadoFormProps) {
  const router = useRouter();
  const [estado, setEstado] = React.useState<EstadoOrden>(estadoActual);
  const [tracking, setTracking] = React.useState(trackingActual ?? "");
  const [errorTracking, setErrorTracking] = React.useState<string | null>(null);
  const [dialogoCancelar, setDialogoCancelar] = React.useState(false);
  const [pendiente, startTransition] = React.useTransition();

  const esRetiro = metodoEnvio === MetodoEnvio.RETIRO_LOCAL;
  const trackingRequerido =
    !esRetiro && estado === EstadoOrden.DESPACHADO;

  const guardar = () => {
    setErrorTracking(null);
    startTransition(async () => {
      const resultado = await actualizarEstadoOrden(ordenId, {
        estado,
        trackingNumber: tracking,
      });
      if (!resultado.ok) {
        toast.error("No se pudo actualizar el pedido", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Pedido actualizado");
      router.refresh();
    });
  };

  const manejarGuardar = () => {
    if (trackingRequerido && tracking.trim() === "") {
      setErrorTracking(
        "El código de seguimiento es obligatorio al despachar por correo.",
      );
      return;
    }
    if (estado === EstadoOrden.CANCELADO) {
      setDialogoCancelar(true);
      return;
    }
    guardar();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Estado y seguimiento</CardTitle>
          <CardDescription>
            Actualizá el estado del pedido y adjuntá el código de seguimiento
            del correo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="orden-estado" className="text-sm font-medium">
                Estado del pedido
              </Label>
              <Badge
                variant="outline"
                className={cn("border-transparent", CLASES_COLOR_ESTADO[estado])}
              >
                {ETIQUETAS_ESTADO[estado]}
              </Badge>
            </div>
            <Select
              value={estado}
              onValueChange={(valor) => {
                setEstado(valor as EstadoOrden);
                setErrorTracking(null);
              }}
            >
              <SelectTrigger
                id="orden-estado"
                className="w-full"
                aria-label="Estado del pedido"
              >
                <SelectValueLabel opciones={OPCIONES_ESTADO} />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_ORDEN.map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {ETIQUETAS_ESTADO[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orden-tracking" className="text-sm font-medium">
              Número de seguimiento
            </Label>
            <Input
              id="orden-tracking"
              value={tracking}
              onChange={(e) => {
                setTracking(e.target.value);
                setErrorTracking(null);
              }}
              disabled={esRetiro}
              placeholder={
                esRetiro
                  ? "No aplica para retiro en local"
                  : "Ej. 3GL12345678"
              }
              aria-invalid={!!errorTracking}
            />
            {esRetiro ? (
              <p className="text-xs text-muted-foreground">
                Los pedidos de retiro en local no llevan código de
                seguimiento.
              </p>
            ) : trackingRequerido ? (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Obligatorio al despachar por correo.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Opcional: se completa al despachar por envío.
              </p>
            )}
            {errorTracking && (
              <p className="text-xs text-red-500">{errorTracking}</p>
            )}
          </div>

          <Button onClick={manejarGuardar} disabled={pendiente}>
            {pendiente && (
              <Loader2 className="animate-spin" aria-hidden="true" />
            )}
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={dialogoCancelar} onOpenChange={setDialogoCancelar}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Cancelar el pedido #{numero}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marca el pedido como cancelado y no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendiente}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendiente}
              onClick={() => {
                setDialogoCancelar(false);
                guardar();
              }}
            >
              {pendiente && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Confirmar cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}