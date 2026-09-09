"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import {
  crearProducto,
  editarProducto,
  type ProductoAdmin,
} from "@/app/admin/(panel)/productos/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValueLabel,
} from "@/components/ui/select";
import { generarSlug } from "@/lib/slug-utils";
import {
  editarProductoFormSchema,
  type EditarProductoFormValues,
  type EditarProductoFormInput,
  type VarianteFormValues,
  type ImagenEditableFormValues,
} from "@/lib/producto-schema";

import {
  ARCHIVOS_ACEPTADOS,
  BUCKET_PRODUCTOS,
  MAX_ARCHIVO_MB,
  subirImagenSupabase,
} from "@/lib/upload-utils";

export interface LineaOption {
  id: string;
  nombre: string;
  tipo: { id: string; nombre: string };
}

interface ProductoFormProps {
  lineas: LineaOption[];
  producto?: ProductoAdmin;
}

/**
 * Formulario de producto (panel admin).
 *
 * - Tab 1: datos básicos (nombre → slug autogenerado con override, línea, textos).
 * - Tab 2: variantes dinámicas (react-hook-form useFieldArray).
 * - Tab 3: imágenes por variante (subida a Supabase Storage, bucket 'productos').
 *
 * Sin prop `producto` actúa como alta (crea); con `producto` actúa como edición:
 * precarga los datos existentes y llama a la server action `editarProducto`,
 * que sincroniza variantes/imágenes y limpia los archivos huérfanos de Storage.
 */
export function ProductoForm({ lineas, producto }: ProductoFormProps) {
  const router = useRouter();
  const [subiendo, setSubiendo] = React.useState(false);
  const esEdicion = !!producto;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EditarProductoFormInput, any, EditarProductoFormValues>({
    resolver: zodResolver(editarProductoFormSchema),
    defaultValues: {
      nombre: "",
      slug: "",
      lineaId: "",
      descripcion: "",
      dimensiones: "",
      garantia: "",
      activo: true,
      destacado: false,
      variantes: [
        {
          color: "",
          material: "",
          sku: "",
          precio: undefined,
          precioTransferencia: undefined,
          stock: 0,
          imagenes: [],
        },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const variantes = useFieldArray({
    control,
    name: "variantes",
  });

  const slug = watch("slug");
  const slugEditado = React.useRef(false);
  const imagenesPorVariante = React.useRef<Record<number, File[]>>({});

  // En modo edición precarga los datos existentes (variantes e imágenes con id).
  React.useEffect(() => {
    if (producto) {
      slugEditado.current = true;
      form.reset({
        nombre: producto.nombre,
        slug: producto.slug,
        lineaId: producto.lineaId,
        descripcion: producto.descripcion ?? "",
        dimensiones: producto.dimensiones ?? "",
        garantia: producto.garantia ?? "",
        activo: producto.activo,
        destacado: producto.destacado,
        variantes: producto.variantes.map((v) => ({
          id: v.id,
          color: v.color ?? "",
          material: v.material ?? "",
          sku: v.sku ?? "",
          precio: v.precio,
          precioTransferencia: v.precioTransferencia ?? undefined,
          stock: v.stock,
          imagenes: v.imagenes.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
          })),
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto]);

  // Autogenera el slug desde el nombre mientras el usuario no lo edite a mano.
  const actualizarSlug = (valor: string) => {
    if (!slugEditado.current) {
      setValue("slug", generarSlug(valor), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: EditarProductoFormValues) => {
    setSubiendo(true);
    try {
      const variantesConImagenes = await Promise.all(
        values.variantes.map(async (variante, i) => {
          const archivos = imagenesPorVariante.current[i] ?? [];
          const urls = await subirArchivos(archivos, values.slug, i);
          return { ...variante, imagenes: [...variante.imagenes, ...urls] };
        }),
      );
      imagenesPorVariante.current = {};

      const resultado = esEdicion
        ? await editarProducto(producto.id, {
            ...values,
            variantes: variantesConImagenes,
          })
        : await crearProducto({
            ...values,
            variantes: variantesConImagenes,
          });

      if (!resultado.ok) {
        toast.error(
          esEdicion
            ? "No se pudo actualizar el producto"
            : "No se pudo crear el producto",
          { description: resultado.error },
        );
        return;
      }

      toast.success(
        esEdicion ? "Producto actualizado" : "Producto creado",
        {
          description: esEdicion
            ? "Los cambios se guardaron correctamente."
            : "El producto se guardó correctamente.",
        },
      );
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("bucket not found")
      ) {
        toast.error("Falta configurar el almacenamiento", {
          description:
            "Ejecutá supabase/storage_bucket.sql en el SQL Editor de Supabase para crear el bucket de imágenes.",
        });
      } else {
        toast.error("Ocurrió un error", {
          description: esEdicion
            ? "No se pudieron guardar los cambios. Probá de nuevo."
            : "No se pudo crear el producto. Probá de nuevo.",
        });
      }
    } finally {
      setSubiendo(false);
    }
  };

  const subirArchivos = async (
    archivos: File[],
    slugProducto: string,
    indiceVariante: number,
  ) => {
    if (archivos.length === 0) return [];

    const urls: { url: string }[] = [];

    for (const archivo of archivos) {
      const extension = archivo.name.split(".").pop() ?? "jpg";
      const ruta = `${BUCKET_PRODUCTOS}/${slugProducto}/variante-${indiceVariante + 1}/${crypto.randomUUID()}.${extension}`;
      const url = await subirImagenSupabase(archivo, ruta);
      urls.push({ url });
    }

    return urls;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <Tabs defaultValue="basicos" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="basicos">Datos básicos</TabsTrigger>
          <TabsTrigger value="variantes">Variantes</TabsTrigger>
          <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
        </TabsList>

        {/* ---------------------- TAB 1: DATOS BÁSICOS ---------------------- */}
        <TabsContent value="basicos" className="pt-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Campo label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
                <Input
                  id="nombre"
                  placeholder="Ej. Anteojo de Sol Classic"
                  {...register("nombre", {
                    onChange: (e) => actualizarSlug(e.target.value),
                  })}
                  aria-invalid={!!errors.nombre}
                />
              </Campo>

              <Campo
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Se genera solo desde el nombre; podés editarlo."
              >
                <Input
                  id="slug"
                  placeholder="anteojo-de-sol-classic"
                  {...register("slug", { onChange: () => void (slugEditado.current = true) })}
                  aria-invalid={!!errors.slug}
                />
              </Campo>

              <Campo label="Línea" htmlFor="linea" error={errors.lineaId?.message}>
                <Controller
                  control={control}
                  name="lineaId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="linea" aria-invalid={!!errors.lineaId}>
                        <SelectValueLabel
                          opciones={lineas.map((linea) => ({
                            value: linea.id,
                            label: linea.nombre,
                          }))}
                          placeholder="Seleccioná una línea"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {agruparPorTipo(lineas).map(({ tipo, lineasDeTipo }) => (
                          <SelectGroup key={tipo}>
                            <SelectLabel>{tipo}</SelectLabel>
                            {lineasDeTipo.map((linea) => (
                              <SelectItem key={linea.id} value={linea.id}>
                                {linea.nombre}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Campo>

              <Campo label="Descripción" htmlFor="descripcion" error={errors.descripcion?.message}>
                <Textarea
                  id="descripcion"
                  rows={3}
                  placeholder="Descripción breve del producto…"
                  {...register("descripcion")}
                  aria-invalid={!!errors.descripcion}
                />
              </Campo>

              <Campo label="Dimensiones" htmlFor="dimensiones" error={errors.dimensiones?.message}>
                <Textarea
                  id="dimensiones"
                  rows={2}
                  placeholder="Ej. 14 cm × 5 cm — aparece en el acordeón Dimensiones del detalle."
                  {...register("dimensiones")}
                  aria-invalid={!!errors.dimensiones}
                />
              </Campo>

              <Campo label="Garantía" htmlFor="garantia" error={errors.garantia?.message}>
                <Textarea
                  id="garantia"
                  rows={2}
                  placeholder="Ej. 6 meses de garantía por defectos de fabricación…"
                  {...register("garantia")}
                  aria-invalid={!!errors.garantia}
                />
              </Campo>

              <div className="grid gap-4 sm:grid-cols-2">
                <ToggleSwitch
                  label="Producto activo"
                  descripcion="Visible en el catálogo"
                  control={control}
                  name="activo"
                />
                <ToggleSwitch
                  label="Destacado"
                  descripcion="Aparece en la Home"
                  control={control}
                  name="destacado"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------- TAB 2: VARIANTES ---------------------- */}
        <TabsContent value="variantes" className="space-y-4 pt-4">
          {errors.variantes?.message && (
            <p className="text-xs text-red-500">{errors.variantes.message}</p>
          )}

          <div className="space-y-4">
            {variantes.fields.map((campo, index) => (
              <Card key={campo.id}>
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Variante {index + 1}</p>
                    {variantes.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Quitar variante"
                        onClick={() => variantes.remove(index)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo
                      label="Color"
                      error={errorVariante(errors, index, "color")}
                    >
                      <Input
                        placeholder="Ej. Negro"
                        {...register(`variantes.${index}.color` as const)}
                      />
                    </Campo>
                    <Campo
                      label="Material"
                      error={errorVariante(errors, index, "material")}
                    >
                      <Input
                        placeholder="Ej. Acetato"
                        {...register(`variantes.${index}.material` as const)}
                      />
                    </Campo>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo label="SKU" error={errorVariante(errors, index, "sku")}>
                      <Input
                        placeholder="Ej. CLASSIC-NEGRO"
                        {...register(`variantes.${index}.sku` as const)}
                      />
                    </Campo>
                    <Campo label="Stock" error={errorVariante(errors, index, "stock")}>
                      <Input
                        type="number"
                        min={0}
                        defaultValue={0}
                        {...register(`variantes.${index}.stock` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </Campo>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo
                      label="Precio ($)"
                      error={errorVariante(errors, index, "precio")}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej. 45000"
                        {...register(`variantes.${index}.precio` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </Campo>
                    <Campo
                      label="Precio transferencia ($)"
                      hint="Opcional; fija el % OFF en la card."
                      error={errorVariante(errors, index, "precioTransferencia")}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej. 40500"
                        {...register(`variantes.${index}.precioTransferencia` as const, {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </Campo>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              variantes.append({
                color: "",
                material: "",
                sku: "",
                precio: undefined,
                precioTransferencia: undefined,
                stock: 0,
                imagenes: [],
              })
            }
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar variante
          </Button>
        </TabsContent>

        {/* ---------------------- TAB 3: IMÁGENES ---------------------- */}
        <TabsContent value="imagenes" className="space-y-4 pt-4">
          {variantes.fields.map((campo, index) => (
            <Card key={campo.id}>
              <CardContent className="space-y-3 pt-5">
                <p className="text-sm font-medium">Variante {index + 1}</p>
                <SubirImagenes
                  slug={slug || "producto"}
                  existentes={
                    watch(`variantes.${index}.imagenes`) ?? []
                  }
                  onAgregarArchivos={(archivos) => {
                    imagenesPorVariante.current[index] = archivos;
                  }}
                  onQuitarExistente={(id) => {
                    const actuales = getValues(`variantes.${index}.imagenes`) ?? [];
                    setValue(
                      `variantes.${index}.imagenes`,
                      actuales.filter((img) => img.id !== id),
                    );
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Button type="submit" size="lg" disabled={isSubmitting || subiendo}>
        {isSubmitting || subiendo ? (
          <>
            <Loader2 className="animate-spin" />
            {subiendo ? "Subiendo imágenes…" : "Guardando…"}
          </>
        ) : (
          <>{esEdicion ? "Guardar cambios" : "Crear producto"}</>
        )}
      </Button>
    </form>
  );
}

/* ---------------------- HELPERS UI ---------------------- */

function Campo({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ToggleSwitch({
  label,
  descripcion,
  control,
  name,
}: {
  label: string;
  descripcion: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<EditarProductoFormInput, any, EditarProductoFormValues>;
  name: "activo" | "destacado";
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{descripcion}</p>
          </div>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-label={label}
          />
        </div>
      )}
    />
  );
}

function SubirImagenes({
  slug,
  existentes,
  onAgregarArchivos,
  onQuitarExistente,
}: {
  slug: string;
  existentes: ImagenEditableFormValues[];
  onAgregarArchivos: (archivos: File[]) => void;
  onQuitarExistente: (id: string) => void;
}) {
  const [pendientes, setPendientes] = React.useState<
    { id: string; preview: string; file: File }[]
  >([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sincroniza los archivos seleccionados con el estado del formulario padre.
  React.useEffect(() => {
    onAgregarArchivos(pendientes.map((item) => item.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendientes]);

  const manejarArchivos = (archivos: FileList | null) => {
    if (!archivos?.length) return;

    const validos = Array.from(archivos).filter(
      (archivo) =>
        ARCHIVOS_ACEPTADOS.split(",").includes(archivo.type) &&
        archivo.size <= MAX_ARCHIVO_MB * 1024 * 1024,
    );

    if (validos.length === 0) {
      toast.error("Imagen inválida", {
        description: `Solo imágenes JPG/PNG/WebP/AVIF de hasta ${MAX_ARCHIVO_MB} MB.`,
      });
      return;
    }

    const nuevos = validos.map((archivo) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(archivo),
      file: archivo,
    }));
    setPendientes((prev) => [...prev, ...nuevos]);
  };

  const quitarPendiente = (id: string) => {
    const item = pendientes.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    setPendientes((prev) => prev.filter((i) => i.id !== id));
  };

  React.useEffect(() => {
    return () => {
      pendientes.forEach((i) => URL.revokeObjectURL(i.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hayExistentes = existentes.length > 0;
  const hayPendientes = pendientes.length > 0;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ARCHIVOS_ACEPTADOS}
        multiple
        className="hidden"
        onChange={(e) => {
          manejarArchivos(e.target.files);
          e.target.value = "";
        }}
      />

      {!hayExistentes && !hayPendientes ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <UploadCloud className="size-6" aria-hidden="true" />
          Clic para subir imágenes
          <span className="text-xs">
            JPG, PNG, WebP o AVIF · máx. {MAX_ARCHIVO_MB} MB
          </span>
        </button>
      ) : (
        <div className="flex flex-wrap gap-3">
          {existentes.map((imagen) => (
            <div key={imagen.id ?? imagen.url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagen.url}
                alt={imagen.alt ?? ""}
                className="size-20 rounded-md object-cover ring-1 ring-border"
              />
              {imagen.id && (
                <button
                  type="button"
                  aria-label="Quitar imagen"
                  onClick={() => onQuitarExistente(imagen.id!)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white shadow-sm"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {pendientes.map((item) => (
            <div key={item.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt=""
                className="size-20 rounded-md object-cover ring-1 ring-border"
              />
              <button
                type="button"
                aria-label="Quitar imagen"
                onClick={() => quitarPendiente(item.id)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white shadow-sm"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-brand hover:text-brand"
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar
          </button>
        </div>
      )}
      {pendientes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Se subirán {pendientes.length} imagen
          {pendientes.length === 1 ? "" : "es"} al guardar el producto (carpeta{" "}
          {slug}/).
        </p>
      )}
    </div>
  );
}

/* ---------------------- UTILIDADES ---------------------- */

function errorVariante(
  errors: FieldErrors<EditarProductoFormInput>,
  index: number,
  campo: keyof VarianteFormValues,
): string | undefined {
  const variantes = errors.variantes;
  if (!Array.isArray(variantes)) return undefined;
  const fila = variantes[index];
  if (!fila || typeof fila !== "object") return undefined;
  const campoConError = fila[campo as keyof typeof fila];
  if (
    campoConError &&
    typeof campoConError === "object" &&
    "message" in campoConError
  ) {
    return (campoConError as { message?: string }).message;
  }
  return undefined;
}

function agruparPorTipo(lineas: LineaOption[]) {
  return Object.values(
    lineas.reduce<Record<string, { tipo: string; lineasDeTipo: LineaOption[] }>>(
      (acc, linea) => {
        const tipo = linea.tipo.nombre;
        acc[tipo] ??= { tipo, lineasDeTipo: [] };
        acc[tipo].lineasDeTipo.push(linea);
        return acc;
      },
      {},
    ),
  );
}