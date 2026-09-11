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

## Configurar credenciales de Shipnow (Fase 3 — envíos)

> **Contexto:** la tienda cotiza los envíos contra la API de **Shipnow** (agregador logístico que consolida múltiples transportistas). El cliente ya queda implementado en `src/lib/shipnow.ts`; **falta conseguir la API key y validar el contrato exacto de la API**, que hoy está centralizado en ese archivo con valores tentativos.

### Prerequisitos

- [ ] Crear una cuenta en [Shipnow](https://shipnow.com.ar/) (botón "Registrar mi negocio") con los datos de **La Óptica**.
- [ ] Completar el alta/onboarding comercial (contacto comercial, datos del negocio y, según el servicio, cuenta corriente para el pago de los envíos).

### Pasos

- [ ] **1. Obtener la API key:** dentro del panel de Shipnow, ir a la sección **API** y generar/copiar la API key de la cuenta.
- [ ] **2. Validar el contrato de la API:** confirmar en la [documentación oficial de Shipnow (Stoplight)](https://shipnow.stoplight.io/docs/shipnow-api) los siguientes puntos para ajustarlos en `src/lib/shipnow.ts`:
  - Ruta/endpoint de **cotización** (hoy `ENDPOINT_COTIZACION = "/v1/quotes"` tentativo).
  - Ruta/endpoint de **etiquetas/shipments** (hoy `ENDPOINT_SHIPMENTS = "/v1/shipments"` tentativo) y formato de la respuesta (código de seguimiento + URL del PDF de la etiqueta).
  - Header de **autenticación** (hoy `Authorization: Bearer <api-key>` tentativo).
  - Campos del **payload** de cotización y de despacho (hoy: `addressTo.postalCode` / `addressFrom` + `packages[]` con peso/dimensiones tentativos).
  - Campos de la **respuesta** para precio y días estimados (hoy se aceptan varios nombres candidatos).
- [ ] **3. Configurar variables de entorno:** en el `.env` (o `.env.local`) del repositorio:
  ```env
  SHIPNOW_API_KEY="<api-key-de-shipnow>"
  SHIPNOW_MOCK="false"
  ```
  > Mientras no haya credenciales, dejá `SHIPNOW_MOCK="true"` para que el flujo de cotización funcione con tarifas de ejemplo.

### Resultados

| Ítem | Estado | Observaciones |
|---|---|---|
| Cuenta Shipnow creada | | |
| API key en el `.env` | | |
| Contrato de API validado (cotización) | | |
| Contrato de API validado (etiquetas/shipments: tracking + URL del PDF) | | |
| Cotización real (precio y días) verificada en `/producto/[slug]` y `/checkout` | | |
| Etiqueta real (PDF) verificada en `/admin/ordenes/[id]` | | Con la key configurada, "Generar etiqueta" debe devolver `etiquetaUrl` y el enlace abrir el PDF de Shipnow. |

---

## Probar el pago online en la web (Mercado Pago)

> Requiere haber completado la sección anterior (credenciales configuradas en el `.env`). El objetivo es validar el flujo completo de pago online simulando los escenarios reales, y verificar que los métodos de pago sin conexión (transferencia y efectivo en local) **no** pasan por Mercado Pago.

### Casos de prueba

- [ ] **1. Pago aprobado (flujo feliz):** agregar productos al carrito, ir a `/checkout`, elegir **Pago online**, completar datos/entrega y confirmar el pedido → debe redirigir al checkout seguro de Mercado Pago. Pagar con tarjeta de prueba (Visa `4509 9535 6623 3704` o Mastercard `5031 7557 3453 0604`). Al volver a `/orden/[id]` debe mostrarse "¡Gracias por tu compra!" con badge `Pagado` y **sin** botón de pagar. Verificar en `/admin/ordenes` que la orden figura como `Pagado` automáticamente y que el **stock** de las variantes bajó.
- [ ] **2. Pago rechazado:** pagar con una tarjeta de prueba que fuerza el rechazo (ej. datos de tarjeta incorrectos o sin fondos) → al volver a `/orden/[id]` debe verse "El pago no se pudo completar" con botón para reintentar. El **stock no se descuenta** (la orden queda `Pendiente`).
- [ ] **3. Pago abandonado:** en la pasarela de Mercado Pago, cerrar la pestaña o volver sin pagar → la orden debe quedar en estado `Pendiente`, la página muestra "Tu pedido se registró correctamente", el botón de pagar sigue disponible y la orden figura como `Pendiente` en `/admin/ordenes`.
- [ ] **4. Fallo al generar el pago:** sin token configurado (o con la red caída) al confirmar el pedido online → debe mostrar el aviso de que el pedido se guardó pero no se pudo generar el pago, y dejar la opción de reintentar en `/orden/[id]`.
- [ ] **5. Transferencia sin Mercado Pago:** confirmar el pedido con **transferencia** → va directo a "¡Gracias por tu compra!" con el bloque de CBU/alias, sin pasar por la pasarela. El stock se descuenta recién cuando el admin aprueba la orden (ver caso 9).
- [ ] **6. Efectivo en el local sin Mercado Pago:** con entrega **retiro en el local** y pago **efectivo** → va directo a "¡Gracias por tu compra!" con dirección y horario, sin pasar por la pasarela.
- [ ] **7. Envío con costo:** elegir **envío a domicilio** (> $0) → en la pasarela de Mercado Pago debe aparecer el ítem "Costo de envío" y el total debe incluir el flete. Al confirmar, la orden guarda el costo de envío y el total correcto.
- [ ] **8. Cancelación de orden restaura stock:** desde `/admin/ordenes/[id]` cancelar una orden que esté `Pagado` → el stock de sus variantes se **restaura** (vuelve a su valor anterior) y el badge de alerta de stock (si existía) desaparece. Cancelar una orden `Pendiente` → el stock **no se toca** (nunca se había descontado).
- [ ] **9. Aprobación manual de transferencia descuenta stock:** crear una orden por **transferencia** y aprobarla desde el panel (`/admin/ordenes/[id]`, pasar a `Pagado`) → el stock de las variantes se **descuenta** automáticamente.

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
| 8. Cancelación de orden restaura stock | | |
| 9. Aprobación manual de transferencia descuenta stock | | |

> **Nota (stock):** el stock se descuenta **al confirmarse el pago**, no al crear el pedido. Online se descuenta automáticamente por el webhook de Mercado Pago (pago aprobado); por transferencia o efectivo en local se descuenta cuando el admin marca la orden `Pagado`; al cancelar una orden `Pagado` (o superior) el stock se restaura. Para verificarlo consultá la BD antes/después, ej.: `SELECT stock FROM "Variante" WHERE id = '<varianteId>'` y/o el flag por ítem `SELECT "stockDescontado" FROM "ItemOrden" WHERE "ordenId" = '<ordenId>'`. Los montos viajan en pesos argentinos (ARS) y las cuotas salen de la config global (`Configuracion`, default 3 sin interés).

---

## Revisión de páginas legales (auditoría UI/UX)

> Se crearon 3 páginas legales en la auditoría (ver `documentacion/planes/auditoria-ux-rendimiento-20260910.md`). Son documentos modelo para el lanzamiento: **antes de publicarlas en producción** deben revisarse con los datos reales del negocio y, si aplica, asesoramiento legal.

### Prerequisitos

- [ ] Tener la web corriendo (`npm run dev`) o el deploy.
- [ ] Tener los datos reales del negocio: titular/CUIT, dirección y horario del local, WhatsApp/Instagram, CBU y alias.
  - Los placeholders `EDITAR` de la cuenta quedaron en `src/lib/tienda-info.ts` (el alias/CBU/titular se muestran en el checkout de transferencia y en `/orden/[id]`).

### Tareas

- [ ] **1. Revisar `/terminos-y-condiciones`:** redacción coherente y sin errores tipográficos; que reflejen los métodos de pago reales (Mercado Pago online, transferencia, efectivo al retirar), los envíos (operador logístico / retiro en local) y los datos del vendedor (nombre, domicilio, medio de contacto).
- [ ] **2. Revisar `/politicas-de-privacidad`:** que describa con precisión qué datos se recopilan en el flujo real (registro y checkout), que mencione la Ley 25.326, los derechos ARCO y el responsable de los datos, y que el medio de contacto sea el real.
- [ ] **3. Revisar `/boton-de-arrepentimiento`:** el plazo (10 días corridos, Ley 24.240), el medio de contacto real y los pasos/condiciones de reintegro correctos para el negocio.
- [ ] **4. Verificar presentación:** que el footer enlace las 3 páginas y que los datos variables (dirección, horario, contacto) coincidan con el local.
- [ ] **5. Cerrar la revisión:** volcar acá las correcciones propuestas (con la respuesta del asesor si hubo) o dejar constancia de conformidad para publicación.

### Resultados

| Página | Resultado | Correcciones / notas |
|--------|-----------|----------------------|
| `/terminos-y-condiciones` | | |
| `/politicas-de-privacidad` | | |
| `/boton-de-arrepentimiento` | | |
| Footer + datos del local | | |

---

## Validaciones manuales de UX y rendimiento (auditoría UI/UX)

> Las validaciones que no se pueden automatizar quedaron pendientes en `documentacion/workFlow.md` (ítem de Auditoría). Se corren **sobre el deploy**, no en local (`npm run dev` no representa la performance real).

### Prerequisitos

- [ ] Deploy publicado en Vercel (o preview con datos reales).
- [ ] Para Lighthouse: navegador Chrome con la extensión o DevTools → **Lighthouse**.

### Casos de prueba

- [ ] **1. Lighthouse > 90 (Performance y SEO):** en DevTools, pestaña **Lighthouse**, categorías **Performance** y **SEO**, modo Mobile y Desktop. Puntajes de referencia ≥ 90 en el Home y en una página de producto con imágenes (`/producto/[slug]`).
- [ ] **2. Responsiva en smartphones reales (iOS Safari y Android Chrome):** recorrer [ / ](Home), `/catalogo` (con filtros), una PDP (galería + agregar al carrito), `/checkout` completo y `/admin` en teléfono. Verificar que no haya desbordes horizontales, textos cortados ni tap targets chicos.
- [ ] **3. Toasts (Sonner):** agregar al carrito (desde card y PDP), pausar/activar un producto (`/admin/productos`), cerrar sesión (user-menu y admin-sidebar) y errores del checkout (código postal inválido, pago rechazado).
- [ ] **4. Skeletons contra la BD real:** con conexión lenta (DevTools → Network → throttle "Slow 4G") recargar Home, `/catalogo?linea=…`, una PDP, `/orden/[id]` y una página admin: debe verse el esqueleto de carga y luego el contenido, sin pantalla en blanco.
- [ ] **5. Resiliencia sin conexión (PWA mínima):** con el service worker registrado y **modo avión** activado: (a) navegar entre páginas ya visitadas → se sirven de la cache; (b) entrar a una ruta nunca visitada → debe mostrarse la página `/offline` con el aviso amigable; (c) verificar que el carrito (Zustand + localStorage) conserva los ítems.

### Resultados

| Caso | Resultado | Notas / capturas |
|------|-----------|------------------|
| 1. Lighthouse Performance y SEO > 90 | | |
| 2. Responsiva en smartphones reales | | |
| 3. Toasts (Sonner) | | |
| 4. Skeletons con BD real / throttling | | |
| 5. Resiliencia sin conexión | | |