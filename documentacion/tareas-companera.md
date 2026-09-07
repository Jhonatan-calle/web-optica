# Tareas — [Nombre]

- Fecha de inicio:
- Nombre:
- Estado general: [ ] En progreso — [ ] Pausado — [ ] Completado

> Este documento planifica las tareas de trabajo. La documentación maestra del
> proyecto es `documentacion/workFlow.md`. Se van agregando secciones a medida
> que el proyecto avanza.

---

## Pruebas de autenticación y permisos

### Prerequisitos

- [ ] Correr `npm run dev` y abrir `http://localhost:3000`.
  - Si falla con "puerto 3000 en uso", hay que matar el proceso anterior
    (ej. `kill <pid>` o `fuser -k 3000/tcp`) y volver a arrancar.
- [ ] Verificar que el SQL `supabase/rol_app_metadata.sql` fue ejecutado en
    Supabase (o que el usuario de prueba tiene `rol` en `app_metadata`).
- [ ] Verificar en Supabase → **Auth → URL Configuration**: Site URL =
    `http://localhost:3000` y Redirect URLs que lo incluyan
    (ej. `http://localhost:3000/**`).

### Casos de prueba

- [ ] **1. Sin sesión:** entrar a `http://localhost:3000/admin` → debe
    redirigir a `/admin/login` (la URL lleva el parámetro `next=` con la
    ruta original).
- [ ] **2. Sesión CLIENT:** loguearse con un usuario común y entrar a
    `/admin` (o cualquier `/admin/*`) → debe redirigir a `/` (la tienda).
- [ ] **3. Sesión ADMIN:** loguearse con el usuario admin (whitelist del
    trigger) y entrar a `/admin` → debe mostrar el placeholder
    "Panel en construcción".
- [ ] **4. Registro completo:** crear cuenta en `/auth/registro`, confirmar
    el email desde el link recibido y luego loguearse en `/auth/login`.
- [ ] **5. Roles en el backend:** en Supabase → **Auth → Users**, verificar
    que el usuario creado tiene `app_metadata.rol` (`CLIENT` o `ADMIN`) y
    que existe su fila en la tabla `public."Usuario"`.
- [ ] **6. Redirección con sesión:** estando logueado, entrar a
    `/auth/login` o `/auth/registro` → debe redirigir a `/`.
- [ ] **7. Errores de login:** con email/contraseña inválidos debe mostrar
    "Email o contraseña incorrectos"; con una cuenta sin confirmar debe
    avisar que revise su bandeja de entrada.

### Resultados

Marcar cada caso con ✅ (pasa) o ❌ (falla) y anotar observaciones.

| Caso | Resultado | Notas / capturas |
|------|-----------|------------------|
| 1. Sin sesión → `/admin` | | |
| 2. Sesión CLIENT → `/admin/*` | | |
| 3. Sesión ADMIN → `/admin` | | |
| 4. Registro → confirmación → login | | |
| 5. Roles en `app_metadata` + `public."Usuario"` | | |
| 6. `/auth/*` con sesión → `/` | | |
| 7. Errores de login | | |