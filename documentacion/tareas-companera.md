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

---

## Configurar credenciales de Mercado Pago (Fase 3)

### Prerequisitos

- [ ] Tener acceso a una cuenta de Mercado Pago (idealmente la cuenta oficial del negocio).

### Pasos

- [ ] **1. Iniciar sesión en Mercado Pago Developers:** Entrar a [Mercado Pago Developers (Panel)](https://www.mercadopago.com.ar/developers/panel/app) e iniciar sesión.
- [ ] **2. Crear una Aplicación:** Hacer clic en "Crear aplicación". Elegir "Pagos online", en e-commerce elegir "No" (es a medida). Nombrarla, por ejemplo: `La Óptica Web`.
- [ ] **3. Obtener credenciales de prueba:** Dentro de la app creada, en el menú izquierdo ir a **Credenciales de prueba**. Copiar `Access Token` y `Public Key` (ambas empiezan con `TEST-...`).
- [ ] **4. Configurar variables de entorno:** En el repositorio local (tu PC), abrir o crear el archivo `.env.local` e insertar:
  ```env
  MERCADOPAGO_ACCESS_TOKEN="TEST-AcaPonesTuAccessTokenDePrueba"
  MERCADOPAGO_PUBLIC_KEY="TEST-AcaPonesTuPublicKeyDePrueba"
  ```
- [ ] **5. Probar con usuarios/tarjetas de prueba:** Podés usar las [Tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards) para simular compras sin gastar plata real.

> **Nota:** Las credenciales de producción (que empiezan con `APP_USR-...` y mueven plata de verdad) se habilitan recién cuando completás el formulario de homologación de Mercado Pago (CUIT, rubro, etc.), y las configuraremos antes del lanzamiento oficial.