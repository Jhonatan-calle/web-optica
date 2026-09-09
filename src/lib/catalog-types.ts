export interface ImagenPublica {
  url: string;
  alt?: string;
}

export interface VariantePublica {
  id: string;
  color: string;
  material: string;
  precio: number;
  precioTransferencia?: number;
  stock: number;
  imagenes: ImagenPublica[];
}

export interface TipoPublico {
  nombre: string;
}

export interface LineaPublica {
  id: string;
  nombre: string;
  imagenUrl?: string;
  tipo: TipoPublico;
}

export interface ProductoPublico {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  linea: LineaPublica;
  dimensiones: string;
  garantia: string;
  createdAt: string;
  destacado: boolean;
  activo: boolean;
  variantes: VariantePublica[];
}