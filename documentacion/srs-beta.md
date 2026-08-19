# Documento SRS (Versión Beta) — La Óptica

> Versión preliminar. Las preguntas pendientes con el cliente quedan marcadas como **[PENDIENTE]**.

## 1. Visión General

### 1.1 Propósito
Plataforma de e-commerce web para **La Óptica**. Digitalizar el catálogo, automatizar la toma de pedidos a nivel nacional y ofrecer compra directa sin depender de la mensajería privada.

### 1.2 Alcance
- **Geográfico:** venta y envíos a nivel nacional.
- **Catálogo:** anteojos organizados por líneas/colecciones y modelos; accesorios (clip-ons, estuches, etc).
- **Canales:** vinculación con el Instagram actual para canalizar tráfico hacia la web.

## 2. Preguntas a Definir con el Cliente

1. **[PENDIENTE] Graduación:** ¿se venden anteojos recetados (el cliente adjunta su receta) o solo lentes de sol, clip-ons y armazones neutros?
2. **[PENDIENTE] Variantes:** ¿un modelo viene en varios colores/materiales o cada color es un producto único?
3. **Envíos:** se integran todas las empresas de correo disponibles en la ciudad (Correo Argentino, Andreani, OCA, Shipnow, etc.) para cálculo automático de costo; los pedidos dentro de la ciudad se entregan con envío propio del local.
4. **Retiro local:** los clientes podrán comprar online y retirar gratis en el local (hay tienda física).
5. **Pago en retiro:** ambos: el cliente puede pagar online o pagar en el local al retirar.
6. **[PENDIENTE] Stock compartido:** ¿el stock que se muestra online es el mismo del local (inventario compartido)?
7. **[PENDIENTE] Devoluciones/cambios:** ¿qué política aplica para compras online que se devuelven en el local?
8. **Cuenta de cobro:** el local ya tiene cuenta de MercadoPago para recibir los pagos.

## 3. Tipos de Usuario y Roles

| Rol | Qué puede hacer |
|---|---|
| **Visitante (anónimo)** | Navegar el catálogo, filtrar por líneas, armar carrito y comprar sin cuenta (guest checkout). |
| **Cliente registrado** | Todo lo del visitante + historial de pedidos, datos de envío guardados y estado de sus compras. |
| **Administrador** | Panel privado: inventario, precios, ventas y estados de envío. |

**Decisión:** se permite compra sin registro (guest checkout) para evitar fricción. El checkout pide el email (requerido igual por MercadoPago) y se ofrece crear la cuenta al finalizar, asociando la orden a ese email para que el historial aparezca si se registra después.

## 4. Requisitos Legales (obligatorios)

- Footer con Data Fiscal, Términos y Condiciones y Políticas de Privacidad.
- Botón de arrepentimiento (plazo de revocación de compra previsto por la ley).
