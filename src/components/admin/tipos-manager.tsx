"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  crearTipo,
  eliminarTipo,
  renombrarTipo,
} from "@/app/admin/(panel)/lineas/actions";
import { tipoFormSchema, type TipoFormValues } from "@/lib/linea-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TipoRow {
  id: string;
  nombre: string;
  lineasCount: number;
}

/**
 * Tabla de Tipos con dialogs de alta/edición y eliminación protegida
 * (bloqueada si el tipo tiene líneas asignadas).
 */
export function TiposManager({ tipos }: { tipos: TipoRow[] }) {
  const router = useRouter();

  const [dialogAlta, setDialogAlta] = React.useState(false);
  const [editando, setEditando] = React.useState<TipoRow | null>(null);
  const [eliminando, setEliminando] = React.useState<TipoRow | null>(null);
  const [guardando, setGuardando] = React.useState(false);

  const form = useForm<TipoFormValues>({
    resolver: zodResolver(tipoFormSchema),
    defaultValues: { nombre: "" },
  });

  const abrirAlta = () => {
    setEditando(null);
    form.reset({ nombre: "" });
    setDialogAlta(true);
  };

  const abrirEdicion = (tipo: TipoRow) => {
    setEditando(tipo);
    form.reset({ nombre: tipo.nombre });
    setDialogAlta(true);
  };

  const onSubmit = async (values: TipoFormValues) => {
    setGuardando(true);
    try {
      const resultado = editando
        ? await renombrarTipo(editando.id, values)
        : await crearTipo(values);

      if (!resultado.ok) {
        toast.error("No se pudo guardar el tipo", {
          description: resultado.error,
        });
        return;
      }

      toast.success(editando ? "Tipo actualizado" : "Tipo creado");
      setDialogAlta(false);
      router.refresh();
    } catch (error) {
      console.error("Error al guardar tipo:", error);
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar el tipo.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!eliminando || eliminando.lineasCount > 0) return;
    setGuardando(true);
    try {
      const resultado = await eliminarTipo(eliminando.id);
      if (!resultado.ok) {
        toast.error("No se pudo eliminar el tipo", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Tipo eliminado");
      setEliminando(null);
      router.refresh();
    } catch (error) {
      console.error("Error al eliminar tipo:", error);
      toast.error("Ocurrió un error", {
        description: "No se pudo eliminar el tipo.",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={abrirAlta}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo tipo
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Líneas</TableHead>
              <TableHead className="w-10" />
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                  Todavía no hay tipos. Creá el primero para poder agrupar líneas.
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{tipo.lineasCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Editar tipo"
                      onClick={() => abrirEdicion(tipo)}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Eliminar tipo"
                      onClick={() => setEliminando(tipo)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------- Dialog alta / edición ---------- */}
      <Dialog open={dialogAlta} onOpenChange={setDialogAlta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar tipo" : "Nuevo tipo"}</DialogTitle>
            <DialogDescription>
              Los tipos agrupan líneas (ej. &quot;Anteojo de Sol&quot;, &quot;Clip-on&quot;).
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo-nombre">Nombre</Label>
              <Input
                id="tipo-nombre"
                placeholder="Ej. Anteojo de Sol"
                {...form.register("nombre")}
                aria-invalid={!!form.formState.errors.nombre}
              />
              {form.formState.errors.nombre && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAlta(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="animate-spin" aria-hidden="true" />}
                {editando ? "Guardar cambios" : "Crear tipo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Dialog eliminar ---------- */}
      <Dialog
        open={eliminando !== null}
        onOpenChange={(open) => !open && setEliminando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tipo</DialogTitle>
            <DialogDescription>
              ¿Eliminar el tipo &quot;{eliminando?.nombre ?? ""}&quot;?
            </DialogDescription>
          </DialogHeader>

          {eliminando && eliminando.lineasCount > 0 ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              No se puede eliminar: tiene {eliminando.lineasCount}{" "}
              {eliminando.lineasCount === 1 ? "línea asignada" : "líneas asignadas"}.
              Mové sus líneas a otro tipo antes de eliminarlo.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEliminando(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={guardando || (eliminando?.lineasCount ?? 0) > 0}
              onClick={confirmarEliminacion}
            >
              {guardando && <Loader2 className="animate-spin" aria-hidden="true" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}