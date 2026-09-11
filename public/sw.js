/* Service worker mínimo de La Óptica.
 *
 * Objetivos (decisión D2 del plan de auditoría UX/render):
 * 1. Cache-first de estáticos inmutables (_next/static, iconos, fuentes): el
 *    HTML no se re-descarga en cada navegación y la app responde al instante
 *    en flacos.
 * 2. Network-first para navegaciones y contenido (docs/catálogo): fresco cuando
 *    hay conexión, y si la red falla se sirve la copia en cache; si no hay
 *    copia, se responde la página /offline.
 *
 * No cachea ni muta peticiones cross-origin (Mercado Pago, Supabase, API de
 * Shipnow van por su cuenta).
 */

const CACHE = "laoptica-v1";

/* Rutas estáticas inmutablemente versionadas: cache-first puro. */
function esEstatico(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icon-") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets/")
  );
}

function cacheFirst(request) {
  return caches.open(CACHE).then(async (cache) => {
    const cacheado = await cache.match(request);
    if (cacheado) return cacheado;
    const respuesta = await fetch(request);
    if (respuesta.ok) cache.put(request, respuesta.clone());
    return respuesta;
  });
}

function networkFirst(request) {
  return fetch(request)
    .then((respuesta) => {
      if (respuesta.ok) {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copia));
      }
      return respuesta;
    })
    .catch(async () => {
      const cache = await caches.open(CACHE);
      const cacheado = await cache.match(request);
      return cacheado ?? cache.match("/offline");
    });
}

self.addEventListener("install", (evento) => {
  // Precarga lo mínimo para que la primera vista offline sea utilizable.
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/", "/offline"]))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    evento.respondWith(networkFirst(request));
  } else if (esEstatico(url.pathname)) {
    evento.respondWith(cacheFirst(request));
  } else {
    evento.respondWith(networkFirst(request));
  }
});