export interface MockImagen {
  url: string;
  alt?: string;
}

export interface MockVariante {
  id: string;
  color: string;
  material: string;
  precio: number;
  precioTransferencia?: number;
  stock: number;
  imagenes: MockImagen[];
}

export interface MockTipo {
  nombre: string;
}

export interface MockLinea {
  id?: string;
  nombre: string;
  imagenUrl?: string;
  tipo: MockTipo;
}

export interface MockProducto {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  linea: MockLinea;
  dimensiones: string;
  garantia: string;
  createdAt: string;
  destacado: boolean;
  activo?: boolean;
  variantes: MockVariante[];
}

const TIPO_SOL: MockTipo = { nombre: "Anteojo de Sol" };
const TIPO_CLIPON: MockTipo = { nombre: "Clip-on" };
const TIPO_ARMAZON: MockTipo = { nombre: "Armazón" };

const LINEA_SUN: MockLinea = {
  id: "linea-sun",
  nombre: "Línea Sun",
  imagenUrl: "/isologo.svg",
  tipo: TIPO_SOL,
};

const LINEA_CLIPON: MockLinea = {
  id: "linea-clip-on",
  nombre: "Línea Clip-on",
  imagenUrl: "/isologo.svg",
  tipo: TIPO_CLIPON,
};

const LINEA_RECETADOS: MockLinea = {
  id: "linea-recetados",
  nombre: "Línea Recetados",
  imagenUrl: "/isologo.svg",
  tipo: TIPO_ARMAZON,
};

const fechaHace = (dias: number) =>
  new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_PRODUCTOS: MockProducto[] = [
  {
    id: "producto-mock-sun-1",
    slug: "anteojo-de-sol-classic",
    nombre: "Anteojo de Sol Classic",
    descripcion: "Anteojo de sol clásico de forma redondeada.",
    linea: LINEA_SUN,
    dimensiones: "Ancho del lente: 52mm · Puente: 18mm · Varilla: 145mm.",
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    createdAt: fechaHace(90),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-sun-1",
        color: "Negro",
        material: "Acetato",
        precio: 58000,
        precioTransferencia: 52200,
        stock: 10,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-sun-1b",
        color: "Carey",
        material: "Acetato",
        precio: 58000,
        precioTransferencia: 52200,
        stock: 8,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-sun-1c",
        color: "Gris",
        material: "Metal",
        precio: 58000,
        precioTransferencia: 52200,
        stock: 6,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-sun-2",
    slug: "anteojo-de-sol-aviator",
    nombre: "Anteojo de Sol Aviator",
    descripcion: "Anteojo de sol estilo aviador.",
    linea: LINEA_SUN,
    dimensiones: "Ancho del lente: 58mm · Puente: 14mm · Varilla: 140mm.",
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    createdAt: fechaHace(5),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-sun-2",
        color: "Carey",
        material: "Metal",
        precio: 62000,
        precioTransferencia: 55800,
        stock: 5,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-sun-2b",
        color: "Dorado",
        material: "Metal",
        precio: 62000,
        precioTransferencia: 55800,
        stock: 7,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-sun-3",
    slug: "anteojo-de-sol-de-marco-redondo",
    nombre: "Anteojo de Sol de Marco Redondo",
    descripcion: "Anteojo de sol de marco redondo.",
    linea: LINEA_SUN,
    dimensiones: "Ancho del lente: 49mm · Puente: 21mm · Varilla: 145mm.",
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    createdAt: fechaHace(60),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-sun-3",
        color: "Tortuga",
        material: "Acetato",
        precio: 54000,
        precioTransferencia: 48600,
        stock: 9,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-sun-3b",
        color: "Negro",
        material: "Acetato",
        precio: 54000,
        precioTransferencia: 48600,
        stock: 4,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-clip-1",
    slug: "clip-on-tabaco",
    nombre: "Clip-on Tabaco",
    descripcion: "Clip-on color tabaco.",
    linea: LINEA_CLIPON,
    dimensiones: "Se adapta a armazones de hasta 140mm de ancho.",
    garantia: "Garantía de 3 meses por defectos de fabricación en el clip.",
    createdAt: fechaHace(120),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-clip-1",
        color: "Tabaco",
        material: "Acetato",
        precio: 24500,
        precioTransferencia: 22050,
        stock: 12,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-clip-1b",
        color: "Negro",
        material: "Acetato",
        precio: 24500,
        precioTransferencia: 22050,
        stock: 11,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-clip-2",
    slug: "clip-on-negro",
    nombre: "Clip-on Negro",
    descripcion: "Clip-on color negro.",
    linea: LINEA_CLIPON,
    dimensiones: "Se adapta a armazones de hasta 140mm de ancho.",
    garantia: "Garantía de 3 meses por defectos de fabricación en el clip.",
    createdAt: fechaHace(100),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-clip-2",
        color: "Negro",
        material: "Metal",
        precio: 26000,
        precioTransferencia: 23400,
        stock: 6,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-clip-2b",
        color: "Plateado",
        material: "Metal",
        precio: 26000,
        precioTransferencia: 23400,
        stock: 5,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-armazon-1",
    slug: "armazon-rectangular",
    nombre: "Armazón Rectangular",
    descripcion: "Armazón de forma rectangular.",
    linea: LINEA_RECETADOS,
    dimensiones: "Ancho del lente: 50mm · Puente: 19mm · Varilla: 145mm.",
    garantia: "Garantía de 12 meses por defectos de fabricación en el armazón.",
    createdAt: fechaHace(150),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-armazon-1",
        color: "Azul oscuro",
        material: "Acetato",
        precio: 39000,
        precioTransferencia: 35100,
        stock: 8,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-armazon-1b",
        color: "Negro",
        material: "Acetato",
        precio: 39000,
        precioTransferencia: 35100,
        stock: 7,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-armazon-1c",
        color: "Marrón",
        material: "Acetato",
        precio: 39000,
        precioTransferencia: 35100,
        stock: 3,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
  {
    id: "producto-mock-armazon-2",
    slug: "armazon-cuadrado",
    nombre: "Armazón Cuadrado",
    descripcion: "Armazón de forma cuadrada.",
    linea: LINEA_RECETADOS,
    dimensiones: "Ancho del lente: 53mm · Puente: 17mm · Varilla: 148mm.",
    garantia: "Garantía de 12 meses por defectos de fabricación en el armazón.",
    createdAt: fechaHace(3),
    destacado: true,
    variantes: [
      {
        id: "variante-mock-armazon-2",
        color: "Negro",
        material: "Acetato",
        precio: 41000,
        precioTransferencia: 36900,
        stock: 5,
        imagenes: [{ url: "/isologo.svg" }],
      },
      {
        id: "variante-mock-armazon-2b",
        color: "Gris",
        material: "Acetato",
        precio: 41000,
        precioTransferencia: 36900,
        stock: 4,
        imagenes: [{ url: "/isologo.svg" }],
      },
    ],
  },
];
