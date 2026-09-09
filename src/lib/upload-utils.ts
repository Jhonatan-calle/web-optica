import { createClient } from "@/lib/supabase/client";

export const BUCKET_PRODUCTOS = "productos";
export const MAX_ARCHIVO_MB = 2;
export const ARCHIVOS_ACEPTADOS = "image/jpeg,image/png,image/webp,image/avif";

/**
 * Sube una imagen al bucket 'productos' desde el cliente (requiere sesión
 * autenticada) y devuelve la URL pública.
 */
export async function subirImagenSupabase(
  archivo: File,
  ruta: string,
): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .upload(ruta, archivo, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(`${archivo.name}: ${error.message}`);
  }
  const { data } = supabase.storage
    .from(BUCKET_PRODUCTOS)
    .getPublicUrl(ruta);
  return data.publicUrl;
}

/**
 * Devuelve true si la URL corresponde a un objeto del bucket 'productos'
 * (para no intentar borrar URLs externas).
 */
export function esImagenDelBucket(url: string): boolean {
  return rutaDesdePublicUrl(url) !== null;
}

/**
 * Extrae la ruta del objeto dentro del bucket a partir de una URL pública
 * (`…/storage/v1/object/public/productos/<ruta>`). Devuelve null si la URL
 * no es de nuestro bucket.
 */
export function rutaDesdePublicUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const prefijo = `/storage/v1/object/public/${BUCKET_PRODUCTOS}/`;
    if (!pathname.startsWith(prefijo)) return null;
    return pathname.slice(prefijo.length);
  } catch {
    return null;
  }
}

/**
 * Elimina un objeto del bucket 'productos' por URL pública. Es un no-op si
 * la URL es externa o inválida.
 */
export async function borrarImagenSupabase(url: string): Promise<void> {
  const ruta = rutaDesdePublicUrl(url);
  if (!ruta) return;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .remove([ruta]);
  if (error) {
    throw new Error(error.message);
  }
}