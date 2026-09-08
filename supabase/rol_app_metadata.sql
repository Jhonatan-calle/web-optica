-- =====================================================================
-- Roles y alta de usuarios — Supabase Auth (ejecutar UNA VEZ en el SQL Editor)
-- =====================================================================
-- Este script conecta Supabase Auth con el modelo de Prisma (tabla public."Usuario").
--
-- Qué hace:
--   1) BEFORE INSERT en `auth.users`: asigna el rol en `app_metadata.rol`
--      ('ADMIN' si el email está en EMAILS_ADMIN, 'CLIENT' en cualquier otro caso).
--   2) AFTER INSERT en `auth.users`: crea automáticamente la fila en
--      public."Usuario" (Prisma) mapeando id de auth -> id de Prisma, email y rol.
--   3) Backfill: crea la fila de public."Usuario" para usuarios de auth ya existentes.
--
-- El rol nunca se recibe desde el cliente: se decide acá, server-side en la BD.
-- El alta manual desde el Dashboard de Supabase (Auth > Users > Add user)
-- también pasa por estos triggers.
--
-- Idempotente: se puede re-ejecutar sin romper nada
-- (create or replace / drop trigger if exists / on conflict do nothing).
--
-- IMPORTANTE: reemplazar la lista EMAILS_ADMIN con los correos que deben tener
-- rol ADMIN. El resto de los usuarios queda CLIENT.
-- =====================================================================

create or replace function public.handle_new_user_rol()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.raw_app_meta_data := jsonb_set(
    coalesce(new.raw_app_meta_data, '{}'::jsonb),
    '{rol}',
    to_jsonb(
      case
        when new.email = any(array['jhonatancallegaleano@gmail.com']) -- EDITAR: emails ADMIN
        then 'ADMIN'
        else 'CLIENT'
      end
    )
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_rol on auth.users;
create trigger on_auth_user_created_rol
  before insert on auth.users
  for each row execute function public.handle_new_user_rol();

create or replace function public.handle_new_user_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."Usuario" (id, email, rol, "createdAt", "updatedAt")
  values (
    new.id::text,
    new.email,
    case
      when new.email = any(array['jhonatancallegaleano@gmail.com']) -- EDITAR: emails ADMIN
      then 'ADMIN'::public."Rol"
      else 'CLIENT'::public."Rol"
    end,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_usuario on auth.users;
create trigger on_auth_user_created_usuario
  after insert on auth.users
  for each row execute function public.handle_new_user_usuario();

-- Backfill: sincroniza los usuarios de auth ya existentes con public."Usuario".
insert into public."Usuario" (id, email, rol, "createdAt", "updatedAt")
select
  u.id::text,
  u.email,
  case
    when u.email = any(array['jhonatancallegaleano@gmail.com']) -- EDITAR: emails ADMIN
    then 'ADMIN'::public."Rol"
    else 'CLIENT'::public."Rol"
  end,
  u.created_at,
  now()
from auth.users u
on conflict (id) do nothing;
