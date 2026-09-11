import Image from "next/image";

const ORIGEN_IMAGENES = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Renderiza una imagen del storefront con `next/image` cuando la URL es
 * segura (ruta local o del bucket de Supabase) y cae a `<img>` nativo para
 * URLs externas arbitrarias (ej. portadas de línea pegadas a mano), que no
 * pueden pasar por el optimizer sin configurar `remotePatterns`.
 */
export function ImagenStore({
  src,
  alt,
  width,
  height,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const esSegura = src.startsWith("/") || src.startsWith(ORIGEN_IMAGENES);

  if (!esSegura) {
    return (
      // URLs externas: no pasan por el optimizer de Next.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      fill={!width && !height}
      className={className}
    />
  );
}