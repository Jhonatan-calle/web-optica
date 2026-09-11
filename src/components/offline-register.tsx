"use client";

import { useEffect } from "react";

/**
 * Registra el service worker de la app en producción. En desarrollo no se
 * registra para evitar caches obsoletos durante el desarrollo local.
 */
export function OfflineRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}