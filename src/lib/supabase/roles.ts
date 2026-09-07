import type { User } from "@supabase/supabase-js";

/**
 * Roles de la aplicación. Viven en `app_metadata.rol` del usuario de Supabase
 * Auth y se asignan server-side en la BD (ver `supabase/rol_app_metadata.sql`).
 */
export const ROL_CLIENT = "CLIENT" as const;
export const ROL_ADMIN = "ADMIN" as const;

export type RolApp = typeof ROL_CLIENT | typeof ROL_ADMIN;

/** Roles con acceso al panel de administración. */
export const ROLES_ADMIN: RolApp[] = [ROL_ADMIN];

/**
 * Lee el rol desde `app_metadata`. Si el usuario aún no tiene rol asignado
 * (ej. el trigger todavía no corrió), asume `CLIENT`.
 */
export function getRol(user?: Pick<User, "app_metadata"> | null): RolApp {
  return user?.app_metadata?.rol === ROL_ADMIN ? ROL_ADMIN : ROL_CLIENT;
}

export function esAdmin(user?: Pick<User, "app_metadata"> | null): boolean {
  return getRol(user) === ROL_ADMIN;
}