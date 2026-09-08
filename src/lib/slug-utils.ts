/**
 * Genera un slug URL-friendly a partir de un nombre/título.
 * Ej: "Anteojo de Sol Classic" -> "anteojo-de-sol-classic"
 * "Árbol de Manzanas" -> "arbol-de-manzanas"
 */
export function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Valida que un slug tenga el formato esperado (minúsculas, palabras separadas por guiones). */
export function esSlugValido(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}