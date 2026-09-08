"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  actualizarLinea,
  crearLinea,
  eliminarLinea,
  reordenarLineas,
} from "@/app/admin/(panel)/lineas/actions";
import {
  lineaFormSchema,
  type LineaFormValues,
  type LineaFormInput,
} from "@/lib/linea-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValueLabel,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface LineaRow {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  tipoId: string;
  tipoNombre: string;
  productosCount: number;
}

export type TipoOpcion = { id: string; nombre: string };

interface LineasManagerProps {
  lineas: LineaRow[];
  tipos: TipoOpcion[];
}

interface SortableRowProps {
  linea: LineaRow;
  reordenando: boolean;
  children: React.ReactNode;
}

function SortableRow({ linea, reordenando, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: linea.id });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(isDragging && "relative z-10 bg-accent/60 opacity-90")}
    >
      <TableCell className="w-10 pr-0">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={reordenando}
          title="Arrastrá para reordenar"
          aria-label={`Reordenar ${linea.nombre}`}
          className="cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </TableCell>
      {children}
    </TableRow>
  );
}

/**
 * Tabla de Líneas con dialogs de alta/edición y eliminación con reasignación
 * de productos a otra línea.
 */
export function LineasManager({ lineas, tipos }: LineasManagerProps) {
  const router = useRouter();

  const [items, setItems] = React.useState<LineaRow[]>(lineas);
  const [lineasSincronizadas, setLineasSincronizadas] =
    React.useState(lineas);
  if (lineas !== lineasSincronizadas) {
    setLineasSincronizadas(lineas);
    setItems(lineas);
  }
  const [dialogAbierto, setDialogAbierto] = React.useState(false);
  const [editando, setEditando] = React.useState<LineaRow | null>(null);
  const [eliminando, setEliminando] = React.useState<LineaRow | null>(null);
  const [moverA, setMoverA] = React.useState<string>("");
  const [guardando, setGuardando] = React.useState(false);
  const [reordenando, setReordenando] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<LineaFormInput, any, LineaFormValues>({
    resolver: zodResolver(lineaFormSchema),
    defaultValues: {
      tipoId: "",
      nombre: "",
      descripcion: "",
      imagenUrl: "",
    },
  });

  const opcionesMarcas = items.filter((l) => l.id !== eliminando?.id);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = items.findIndex((l) => l.id === active.id);
    const to = items.findIndex((l) => l.id === over.id);
    if (from === -1 || to === -1) return;

    const reordenadas = arrayMove(items, from, to);
    setItems(reordenadas);

    setReordenando(true);
    try {
      const resultado = await reordenarLineas(reordenadas.map((l) => l.id));
      if (!resultado.ok) {
        toast.error("No se pudo reordenar", { description: resultado.error });
        router.refresh();
        return;
      }
      toast.success("Orden actualizado");
    } catch (error) {
      console.error("Error al reordenar líneas:", error);
      toast.error("Ocurrió un error al reordenar las líneas.");
      router.refresh();
    } finally {
      setReordenando(false);
    }
  };

  const abrirAlta = () => {
    setEditando(null);
    form.reset({
      tipoId: "",
      nombre: "",
      descripcion: "",
      imagenUrl: "",
    });
    setMoverA("");
    setDialogAbierto(true);
  };

  const abrirEdicion = (linea: LineaRow) => {
    setEditando(linea);
    form.reset({
      tipoId: linea.tipoId,
      nombre: linea.nombre,
      descripcion: linea.descripcion ?? "",
      imagenUrl: linea.imagenUrl ?? "",
    });
    setDialogAbierto(true);
  };

  const onSubmit = async (values: LineaFormValues) => {
    setGuardando(true);
    try {
      const resultado = editando
        ? await actualizarLinea(editando.id, values)
        : await crearLinea(values);

      if (!resultado.ok) {
        toast.error("No se pudo guardar la línea", {
          description: resultado.error,
        });
        return;
      }

      toast.success(editando ? "Línea actualizada" : "Línea creada");
      setDialogAbierto(false);
      router.refresh();
    } catch (error) {
      console.error("Error al guardar línea:", error);
      toast.error("Ocurrió un error", {
        description: "No se pudo guardar la línea.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!eliminando) return;
    if (eliminando.productosCount > 0 && !moverA) {
      toast.error("Elegí a qué línea mover los productos");
      return;
    }
    setGuardando(true);
    try {
      const resultado = await eliminarLinea(eliminando.id, moverA || undefined);
      if (!resultado.ok) {
        toast.error("No se pudo eliminar la línea", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Línea eliminada");
      setEliminando(null);
      router.refresh();
    } catch (error) {
      console.error("Error al eliminar línea:", error);
      toast.error("Ocurrió un error", {
        description: "No se pudo eliminar la línea.",
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
          Nueva línea
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-12" />
                  <TableHead>Línea</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead className="w-10" />
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                      Todavía no hay líneas. Creá la primera para poder asignarla a un producto.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((linea) => (
                    <SortableRow key={linea.id} linea={linea} reordenando={reordenando}>
                      <TableCell>
                        {linea.imagenUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={linea.imagenUrl}
                            alt=""
                            className="size-10 rounded-md object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{linea.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{linea.tipoNombre}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{linea.productosCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Editar línea"
                          onClick={() => abrirEdicion(linea)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Eliminar línea"
                          onClick={() => {
                            setEliminando(linea);
                            setMoverA("");
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </SortableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      {/* ---------- Dialog alta / edición ---------- */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar línea" : "Nueva línea"}
            </DialogTitle>
            <DialogDescription>
              Una línea es una colección de productos dentro de un tipo (ej.
              &quot;Línea Sun&quot; dentro de &quot;Anteojo de Sol&quot;).
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linea-tipo">Tipo</Label>
              <Controller
                control={form.control}
                name="tipoId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="linea-tipo" aria-invalid={!!form.formState.errors.tipoId}>
                      <SelectValueLabel
                        opciones={tipos.map((tipo) => ({ value: tipo.id, label: tipo.nombre }))}
                        placeholder="Seleccioná un tipo"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Creá un tipo primero en la pestaña &quot;Tipos&quot;.
                        </div>
                      )}
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.tipoId && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.tipoId.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linea-nombre">Nombre</Label>
              <Input
                id="linea-nombre"
                placeholder="Ej. Línea Sun"
                {...form.register("nombre")}
                aria-invalid={!!form.formState.errors.nombre}
              />
              {form.formState.errors.nombre && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linea-descripcion">Descripción</Label>
              <Textarea
                id="linea-descripcion"
                rows={2}
                placeholder="Descripción breve de la colección (opcional)…"
                {...form.register("descripcion")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="linea-imagen">Imagen (URL)</Label>
                <Input
                  id="linea-imagen"
                  placeholder="https://…/linea-sun.jpg"
                  {...form.register("imagenUrl")}
                  aria-invalid={!!form.formState.errors.imagenUrl}
                />
                {form.formState.errors.imagenUrl && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.imagenUrl.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Opcional. La línea se agrega automáticamente al final del
                  orden y después podés reordenarla con el arrastre en la lista.
                </p>
              </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAbierto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="animate-spin" aria-hidden="true" />}
                {editando ? "Guardar cambios" : "Crear línea"}
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
            <DialogTitle>Eliminar línea</DialogTitle>
            <DialogDescription>
              ¿Eliminar la línea &quot;{eliminando?.nombre ?? ""}&quot;?
            </DialogDescription>
          </DialogHeader>

          {eliminando && eliminando.productosCount > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                La línea tiene {eliminando.productosCount}{" "}
                {eliminando.productosCount === 1 ? "producto asignado" : "productos asignados"}.
                Elegí a qué línea moverlos para poder eliminarla:
              </p>
              <Select
                value={moverA}
                onValueChange={(v) => setMoverA(v ?? "")}
              >
                <SelectTrigger className={cn(!moverA && "border-destructive/50 text-muted-foreground")}>
                  <SelectValueLabel
                    opciones={opcionesMarcas.map((linea) => ({
                      value: linea.id,
                      label: linea.nombre,
                    }))}
                    placeholder="Seleccioná la línea de destino"
                  />
                </SelectTrigger>
                <SelectContent>
                  {opcionesMarcas.map((linea) => (
                    <SelectItem key={linea.id} value={linea.id}>
                      {linea.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={
                guardando ||
                (eliminando?.productosCount ?? 0) > 0 && moverA === ""
              }
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