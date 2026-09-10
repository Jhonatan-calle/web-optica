import "server-only";

/**
 * Cliente de cotización de envíos con **Shipnow** (server-only).
 *
 * Decisión B5 resuelta: Shipnow es un agregador logístico que consolida
 * múltiples transportistas, por lo que NO mantenemos clientes separados para
 * Andreani/Correo Argentino/OCA.
 *
 * Modelo de peso simplificado: los anteojos y accesorios ópticos son livianos,
 * por lo que se asume un peso fijo por ítem (no se modifica el schema).
 * Dimensiones del paquete en su estuche: 20x15x5 cm.
 *
 * ⚠️ La documentación pública de Shipnow (https://shipnow.stoplight.io/docs/shipnow-api)
 * carga por JS y el repo `shipnow/docs` fue removido. El host de producción
 * `https://api.shipnow.com.ar/` está confirmado; el CONTRATO exacto (ruta del
 * endpoint, header de autenticación y campos del payload/respuesta) se valida
 * con credenciales reales y queda CENTRALIZADO acá (ver `ENDPOINT_COTIZACION`,
 * `armarPayloadCotizacion` y `parsearCotizacion`) para ajustarlo en un solo
 * lugar.
 *
 * Fallback ante falla/timeout (NUNCA bloquea el checkout): si Shipnow no
 * responde, se devuelve una tarifa plana de contingencia "Envío Nacional
 * Estándar". El valor por defecto (sin credenciales) es la contingencia.
 */

// --- Constantes del modelo de envío ---

/** Peso asumido por cada ítem del carrito (kg). Anteojos + estuche. */
export const PESO_POR_ITEM_KG = 0.5;

/** Peso mínimo del paquete (kg). */
export const PESO_MINIMO_KG = 0.5;

/** Dimensiones fijas del paquete (cm) — estuche de anteojos. */
export const DIM_PAQUETE_CM = { largoCm: 20, altoCm: 15, anchoCm: 5 } as const;

/**
 * Tarifa plana de contingencia (pesos) cuando Shipnow no responde.
 * "Envío Nacional Estándar — $7.500".
 */
export const TARIFA_CONTINGENCIA = 7500;

/** Tarifa de ejemplo usada cuando `SHIPNOW_MOCK="true"` (tests sin credenciales). */
export const TARIFA_MOCK = 6900;

/** TTL del cache en memoria de cotizaciones (ms): 5 minutos. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Endpoint de cotización relativo al host de Shipnow.
 * ⚠️ A validar contra la documentación oficial cuando se tengan credenciales.
 */
const ENDPOINT_COTIZACION = "/v1/quotes";

/**
 * Endpoint de alta de despacho (generación de etiqueta).
 * ⚠️ A validar contra la documentación oficial cuando se tengan credenciales.
 */
const ENDPOINT_SHIPMENTS = "/v1/shipments";

/** Timeout de la llamada a la API (ms): pasados sin respuesta → contingencia. */
const TIMEOUT_MS = 6000;

// --- Tipos ---

export type CotizacionEnvio =
  | { origen: "shipnow"; precio: number; dias: number | null }
  | { origen: "contingencia"; precio: number; dias: null };

export interface DatosCotizacion {
  codigoPostal: string;
  pesoKg: number;
  cantidadTotal: number;
}

// --- Cache en memoria (proceso del servidor) ---

interface EntradaCache {
  expira: number;
  valor: CotizacionEnvio;
}

const cacheCotizaciones = new Map<string, EntradaCache>();

function claveCache(datos: DatosCotizacion): string {
  return `${datos.codigoPostal}|${datos.pesoKg.toFixed(2)}`;
}

function leerCache(clave: string): CotizacionEnvio | null {
  const entrada = cacheCotizaciones.get(clave);
  if (!entrada) return null;
  if (Date.now() > entrada.expira) {
    cacheCotizaciones.delete(clave);
    return null;
  }
  return entrada.valor;
}

function guardarCache(clave: string, valor: CotizacionEnvio) {
  cacheCotizaciones.set(clave, { expira: Date.now() + CACHE_TTL_MS, valor });
}

// --- Configuración ---

/**
 * Lee la configuración de Shipnow del entorno.
 * Lanza un error claro si faltan la API key (salvo en modo mock).
 */
export function getShipnowConfig() {
  if (process.env.SHIPNOW_MOCK === "true") {
    return { apiUrl: process.env.SHIPNOW_API_URL ?? "https://api.shipnow.com.ar", apiKey: null };
  }
  const apiKey = process.env.SHIPNOW_API_KEY;
  if (!apiKey) {
    throw new Error("Falta SHIPNOW_API_KEY en el entorno (.env.local)");
  }
  return {
    apiUrl: process.env.SHIPNOW_API_URL ?? "https://api.shipnow.com.ar",
    apiKey,
  };
}

// --- Helpers de peso ---

/** Peso total estimado del paquete (kg) a partir de la cantidad de ítems. */
export function calcularPesoKg(cantidadTotal: number): number {
  return Math.max((cantidadTotal || 0) * PESO_POR_ITEM_KG, PESO_MINIMO_KG);
}

// --- Contrato HTTP (a validar con credenciales reales) ---

/** Único lugar donde se arma el body de la cotización. ⚠️ Schema tentativo. */
function armarPayloadCotizacion(datos: DatosCotizacion) {
  const { largoCm, altoCm, anchoCm } = DIM_PAQUETE_CM;
  return {
    addressTo: { postalCode: datos.codigoPostal },
    packages: [
      {
        quantity: datos.cantidadTotal,
        weight: datos.pesoKg,
        widthCm: anchoCm,
        heightCm: altoCm,
        lengthCm: largoCm,
      },
    ],
  };
}

/** Único lugar donde se parsea la respuesta de Shipnow. ⚠️ Formato tentativo. */
function parsearCotizacion(respuesta: unknown): CotizacionEnvio | null {
  if (typeof respuesta !== "object" || respuesta === null) return null;
  const dato = respuesta as Record<string, unknown>;
  const candidatos = [
    dato.precio,
    dato.price,
    dato.amount,
    dato.total,
    (dato.data as Record<string, unknown> | undefined)?.precio,
    (dato.data as Record<string, unknown> | undefined)?.price,
  ];
  const precio = candidatos.find(
    (v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0,
  );
  if (precio === undefined) return null;
  const diasValor = dato.dias ?? dato.days ?? dato.plazoEntrega ?? null;
  const dias =
    typeof diasValor === "number" && Number.isFinite(diasValor)
      ? Math.round(diasValor)
      : null;
  return { origen: "shipnow", precio, dias };
}

// --- Cotización (nunca lanza) ---

/**
 * Cotiza el envío contra Shipnow para un CP y peso dados.
 *
 * - Cache en memoria (5 min) por clave `cp|peso`.
 * - Timeout de 6 segundos.
 * - Ante cualquier error/timeout/sin credenciales → contingencia (NUNCA
 *   bloquea el checkout).
 */
export async function cotizarShipnowServidor(
  datos: DatosCotizacion,
): Promise<CotizacionEnvio> {
  const clave = claveCache(datos);
  const enCache = leerCache(clave);
  if (enCache) return enCache;

  let config;
  try {
    config = getShipnowConfig();
  } catch (error) {
    console.error("[shipnow] sin configuración, tarifa de contingencia:", error);
    return { origen: "contingencia", precio: TARIFA_CONTINGENCIA, dias: null };
  }

  if (config.apiKey === null) {
    const mock: CotizacionEnvio = {
      origen: "shipnow",
      precio: TARIFA_MOCK,
      dias: 4,
    };
    guardarCache(clave, mock);
    return mock;
  }

  try {
    const url = `${config.apiUrl.replace(/\/$/, "")}${ENDPOINT_COTIZACION}`;
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ Header de autenticación tentativo — validar contra la doc oficial.
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(armarPayloadCotizacion(datos)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error(
        "[shipnow] respuesta no ok:",
        respuesta.status,
        respuesta.statusText,
      );
      return { origen: "contingencia", precio: TARIFA_CONTINGENCIA, dias: null };
    }

    const cotizacion = parsearCotizacion(await respuesta.json());
    if (!cotizacion) {
      console.error("[shipnow] respuesta con formato inesperado");
      return { origen: "contingencia", precio: TARIFA_CONTINGENCIA, dias: null };
    }

    guardarCache(clave, cotizacion);
    return cotizacion;
  } catch (error) {
    console.error("[shipnow] error al cotizar, tarifa de contingencia:", error);
    return { origen: "contingencia", precio: TARIFA_CONTINGENCIA, dias: null };
  }
}

// --- Etiqueta de despacho ---

export interface DatosDespacho {
  numeroOrden: number;
  nombreDestinatario: string | null;
  telefono: string | null;
  dirCalle: string;
  dirNumero: string;
  dirDepartamento: string | null;
  dirCiudad: string;
  dirProvincia: string;
  dirCodigoPostal: string;
  /** Cantidad total de ítems del pedido (para el payload y la etiqueta). */
  cantidadItems: number;
  /** Peso total estimado del paquete (kg). */
  pesoKg: number;
}

export type ResultadoEtiqueta =
  | { ok: true; origen: "mock" | "shipnow"; tracking: string; etiquetaUrl: string | null }
  | { ok: false; error: string };

/** Genera un código de seguimiento de ejemplo para el modo simulación. */
function trackingMock(numeroOrden: number): string {
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SHIP-MOCK-${numeroOrden}-${sufijo}`;
}

/** Único lugar donde se arma el body del despacho. ⚠️ Schema tentativo. */
function armarPayloadDespacho(datos: DatosDespacho) {
  const { largoCm, altoCm, anchoCm } = DIM_PAQUETE_CM;
  return {
    addressFrom: { postalCode: "5800" },
    addressTo: {
      postalCode: datos.dirCodigoPostal,
      address: [
        [datos.dirCalle, datos.dirNumero].filter(Boolean).join(" "),
        datos.dirDepartamento,
      ]
        .filter(Boolean)
        .join(", "),
      city: datos.dirCiudad,
      province: datos.dirProvincia,
      contactName: datos.nombreDestinatario ?? undefined,
      contactPhone: datos.telefono ?? undefined,
    },
    packages: [
      {
        quantity: datos.cantidadItems,
        weight: datos.pesoKg,
        widthCm: anchoCm,
        heightCm: altoCm,
        lengthCm: largoCm,
      },
    ],
  };
}

/** Único lugar donde se parsea la respuesta del despacho. ⚠️ Formato tentativo. */
function parsearDespacho(respuesta: unknown): {
  tracking: string;
  etiquetaUrl: string | null;
} | null {
  if (typeof respuesta !== "object" || respuesta === null) return null;
  const dato = (respuesta as Record<string, unknown>).data ?? respuesta;
  if (typeof dato !== "object" || dato === null) return null;
  const cuerpo = dato as Record<string, unknown>;

  const candidatosTracking = [
    cuerpo.trackingNumber,
    cuerpo.tracking_code,
    cuerpo.trackingCode,
    (cuerpo.tracking as Record<string, unknown> | undefined)?.number,
    (cuerpo.shipment as Record<string, unknown> | undefined)?.trackingNumber,
  ];
  const tracking = candidatosTracking.find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  if (!tracking) return null;

  const candidatosUrl = [
    cuerpo.labelUrl,
    cuerpo.label_url,
    cuerpo.pdfUrl,
    cuerpo.pdf_url,
    (cuerpo.label as Record<string, unknown> | undefined)?.url,
    (cuerpo.pdf as Record<string, unknown> | undefined)?.url,
  ];
  const etiquetaUrl = candidatosUrl.find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );

  return { tracking: tracking.trim(), etiquetaUrl: etiquetaUrl?.trim() ?? null };
}

/**
 * Genera la etiqueta de despacho contra Shipnow para una orden de envío.
 *
 * - En modo `SHIPNOW_MOCK` devuelve un tracking de ejemplo (sin URL real; se
 *   usa la etiqueta imprimible local).
 * - Con credenciales reales llama a `ENDPOINT_SHIPMENTS` (poco tentativo) y
 *   persiste tracking + URL del PDF.
 * - NUNCA lanza: ante fallo/timeout/sin configuración devuelve un error
 *   amigable para mostrar al admin (el despacho no bloquea el cambio de
 *   estado: es una acción independiente).
 */
export async function generarEtiquetaShipnowServidor(
  datos: DatosDespacho,
): Promise<ResultadoEtiqueta> {
  let config;
  try {
    config = getShipnowConfig();
  } catch (error) {
    console.error("[shipnow] sin configuración para etiquetas:", error);
    return {
      ok: false,
      error:
        "No pudimos generar la etiqueta de envío. Configurá SHIPNOW_API_KEY en el entorno (o SHIPNOW_MOCK=true) e intentá de nuevo.",
    };
  }

  if (config.apiKey === null) {
    return { ok: true, origen: "mock", tracking: trackingMock(datos.numeroOrden), etiquetaUrl: null };
  }

  try {
    const url = `${config.apiUrl.replace(/\/$/, "")}${ENDPOINT_SHIPMENTS}`;
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ Header de autenticación tentativo — validar contra la doc oficial.
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(armarPayloadDespacho(datos)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error(
        "[shipnow] despacho: respuesta no ok:",
        respuesta.status,
        respuesta.statusText,
      );
      return {
        ok: false,
        error:
          "No pudimos generar la etiqueta de envío. Intentá de nuevo en unos minutos.",
      };
    }

    const despacho = parsearDespacho(await respuesta.json());
    if (!despacho) {
      console.error("[shipnow] despacho: formato de respuesta inesperado");
      return {
        ok: false,
        error:
          "La respuesta de Shipnow no se pudo interpretar. Revisá el contrato en src/lib/shipnow.ts.",
      };
    }

    return { ok: true, origen: "shipnow", ...despacho };
  } catch (error) {
    console.error("[shipnow] error al generar etiqueta:", error);
    return {
      ok: false,
      error:
        "No pudimos generar la etiqueta de envío. Intentá de nuevo en unos minutos.",
    };
  }
}