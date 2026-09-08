-- ============================================================
-- Bucket público 'productos' para imágenes del catálogo.
-- Ejecutar UNA vez en el SQL Editor de Supabase.
-- El bucket es público: las URLs públicas funcionan sin auth.
-- La subida/reemplazo requiere sesión autenticada (admin logueado).
-- ============================================================

insert into storage.buckets (id, "name", public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Lectura pública: cualquiera puede ver las imágenes del catálogo.
create policy "productos_public_read"
on storage.objects for select
to public
using ( bucket_id = 'productos' );

-- Subida: solo usuarios autenticados (el admin logueado en el panel).
create policy "productos_authenticated_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'productos' );

-- Reemplazo/actualización: solo usuarios autenticados.
create policy "productos_authenticated_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'productos' );