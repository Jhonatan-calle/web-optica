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
- [ ] **4. Configurar variables de entorno:** En el repositorio local (tu PC), abrir o crear el archivo `.env` (o `.env.local`) e insertar:
  ```env
  MERCADOPAGO_ACCESS_TOKEN="TEST-AcaPonesTuAccessTokenDePrueba"
  MERCADOPAGO_PUBLIC_KEY="TEST-AcaPonesTuPublicKeyDePrueba"
  ```
- [ ] **5. Probar con usuarios/tarjetas de prueba:** Podés usar las [Tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards) para simular compras sin gastar plata real.

> **Nota:** Las credenciales de producción (que empiezan con `APP_USR-...` y mueven plata de verdad) se habilitan recién cuando completás el formulario de homologación de Mercado Pago (CUIT, rubro, etc.), y las configuraremos antes del lanzamiento oficial. Una vez conectadas las **credenciales reales del negocio**, los escenarios de la web se prueban con una compra real de monto bajo; las tarjetas de prueba solo aplican con la cuenta de pruebas (`TEST-...`).

---

## Probar el pago online en la web (Mercado Pago)

> Requiere haber completado la sección anterior (credenciales configuradas en el `.env`). El objetivo es validar el flujo completo de pago online simulando los escenarios reales, y verificar que los métodos de pago sin conexión (transferencia y efectivo en local) **no** pasan por Mercado Pago.

### Casos de prueba

- [ ] **1. Pago aprobado (flujo feliz):** agregar productos al carrito, ir a `/checkout`, elegir **Pago online**, completar datos/entrega y confirmar el pedido → debe redirigir al checkout seguro de Mercado Pago. Pagar con tarjeta de prueba (Visa `4509 9535 6623 3704` o Mastercard `5031 7557 3453 0604`). Al volver a `/orden/[id]` debe mostrarse "¡Gracias por tu compra!" con badge `Pagado` y **sin** botón de pagar. Verificar en `/admin/ordenes` que la orden figura como `Pagado` automáticamente.
- [ ] **2. Pago rechazado:** pagar con una tarjeta de prueba que fuerza el rechazo (ej. datos de tarjeta incorrectos o sin fondos) → al volver a `/orden/[id]` debe verse "El pago no se pudo completar" con botón para reintentar.
- [ ] **3. Pago abandonado:** en la pasarela de Mercado Pago, cerrar la pestaña o volver sin pagar → la orden debe quedar en estado `Pendiente`, la página muestra "Tu pedido se registró correctamente", el botón de pagar sigue disponible y la orden figura como `Pendiente` en `/admin/ordenes`.
- [ ] **4. Fallo al generar el pago:** sin token configurado (o con la red caída) al confirmar el pedido online → debe mostrar el aviso de que el pedido se guardó pero no se pudo generar el pago, y dejar la opción de reintentar en `/orden/[id]`.
- [ ] **5. Transferencia sin Mercado Pago:** confirmar el pedido con **transferencia** → va directo a "¡Gracias por tu compra!" con el bloque de CBU/alias, sin pasar por la pasarela.
- [ ] **6. Efectivo en el local sin Mercado Pago:** con entrega **retiro en el local** y pago **efectivo** → va directo a "¡Gracias por tu compra!" con dirección y horario, sin pasar por la pasarela.
- [ ] **7. Envío con costo:** elegir **envío a domicilio** (> $0) → en la pasarela de Mercado Pago debe aparecer el ítem "Costo de envío" y el total debe incluir el flete. Al confirmar, la orden guarda el costo de envío y el total correcto.

### Resultados

Marcar cada caso con ✅ (pasa) o ❌ (falla) y anotar observaciones.

| Caso | Resultado | Notas / capturas |
|------|-----------|------------------|
| 1. Pago aprobado (flujo feliz) | | |
| 2. Pago rechazado | | |
| 3. Pago abandonado | | |
| 4. Fallo al generar el pago | | |
| 5. Transferencia sin Mercado Pago | | |
| 6. Efectivo en el local sin Mercado Pago | | |
| 7. Envío con costo | | |

> **Nota:** el stock de los productos aún **no** se descuenta al confirmar la compra (pendiente de Fase 3). Los montos viajan en pesos argentinos (ARS) y las cuotas salen de la config global (`Configuracion`, default 3 sin interés).