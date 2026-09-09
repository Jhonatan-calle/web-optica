-- ============================================================
-- Bucket público 'productos' para imágenes del catálogo.
-- Ejecutar en el SQL Editor de Supabase. Es IDEMPOTENTE: se puede
-- re-ejecutar (por ej. tras agregar policies nuevas) sin errores.
-- El bucket es público: las URLs públicas funcionan sin auth.
-- La subida/reemplazo/borrado requiere sesión autenticada (admin logueado).
-- ============================================================

insert into storage.buckets (id, "name", public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Lectura pública: cualquiera puede ver las imágenes del catálogo.
drop policy if exists "productos_public_read" on storage.objects;
create policy "productos_public_read"
on storage.objects for select
to public
using ( bucket_id = 'productos' );

-- Subida: solo usuarios autenticados (el admin logueado en el panel).
drop policy if exists "productos_authenticated_insert" on storage.objects;
create policy "productos_authenticated_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'productos' );

-- Reemplazo/actualización: solo usuarios autenticados.
drop policy if exists "productos_authenticated_update" on storage.objects;
create policy "productos_authenticated_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'productos' );

-- Borrado (por ej. al reemplazar la imagen de una línea): solo autenticados.
drop policy if exists "productos_authenticated_delete" on storage.objects;
create policy "productos_authenticated_delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'productos' );