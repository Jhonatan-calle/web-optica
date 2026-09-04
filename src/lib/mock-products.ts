export interface MockVariante {
  varianteId: string;
  color: string;
  material: string;
  imagen: string;
}

export interface MockProducto {
  varianteId: string;
  productoId: string;
  slug: string;
  nombre: string;
  linea: string;
  tipo: string;
  color?: string;
  material?: string;
  precio: number;
  precioTransferencia?: number;
  cuotas: string;
  badge?: string;
  imagen: string;
  variantes: MockVariante[];
  garantia: string;
  dimensiones: string;
}

export const MOCK_PRODUCTOS: MockProducto[] = [
  {
    varianteId: "variante-mock-sun-1",
    productoId: "producto-mock-sun-1",
    slug: "anteojo-de-sol-classic",
    nombre: "Anteojo de Sol Classic",
    linea: "Línea Sun",
    tipo: "Anteojo de Sol",
    color: "Negro",
    material: "Acetato",
    precio: 58000,
    precioTransferencia: 52200,
    cuotas: "3 cuotas sin interés de $19.334",
    badge: "10% OFF",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-sun-1", color: "Negro", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-sun-1b", color: "Carey", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-sun-1c", color: "Gris", material: "Metal", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    dimensiones: "Ancho del lente: 52mm · Puente: 18mm · Varilla: 145mm.",
  },
  {
    varianteId: "variante-mock-sun-2",
    productoId: "producto-mock-sun-2",
    slug: "anteojo-de-sol-aviator",
    nombre: "Anteojo de Sol Aviator",
    linea: "Línea Sun",
    tipo: "Anteojo de Sol",
    color: "Carey",
    material: "Metal",
    precio: 62000,
    precioTransferencia: 55800,
    cuotas: "3 cuotas sin interés de $20.667",
    badge: "NUEVO",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-sun-2", color: "Carey", material: "Metal", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-sun-2b", color: "Dorado", material: "Metal", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    dimensiones: "Ancho del lente: 58mm · Puente: 14mm · Varilla: 140mm.",
  },
  {
    varianteId: "variante-mock-sun-3",
    productoId: "producto-mock-sun-3",
    slug: "anteojo-de-sol-de-marco-redondo",
    nombre: "Anteojo de Sol de Marco Redondo",
    linea: "Línea Sun",
    tipo: "Anteojo de Sol",
    color: "Tortuga",
    material: "Acetato",
    precio: 54000,
    precioTransferencia: 48600,
    cuotas: "3 cuotas sin interés de $18.000",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-sun-3", color: "Tortuga", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-sun-3b", color: "Negro", material: "Acetato", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 6 meses por defectos de fabricación en armazón y cristales.",
    dimensiones: "Ancho del lente: 49mm · Puente: 21mm · Varilla: 145mm.",
  },
  {
    varianteId: "variante-mock-clip-1",
    productoId: "producto-mock-clip-1",
    slug: "clip-on-tabaco",
    nombre: "Clip-on Tabaco",
    linea: "Línea Clip-on",
    tipo: "Clip-on",
    color: "Tabaco",
    material: "Acetato",
    precio: 24500,
    precioTransferencia: 22050,
    cuotas: "3 cuotas sin interés de $8.167",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-clip-1", color: "Tabaco", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-clip-1b", color: "Negro", material: "Acetato", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 3 meses por defectos de fabricación en el clip.",
    dimensiones: "Se adapta a armazones de hasta 140mm de ancho.",
  },
  {
    varianteId: "variante-mock-clip-2",
    productoId: "producto-mock-clip-2",
    slug: "clip-on-negro",
    nombre: "Clip-on Negro",
    linea: "Línea Clip-on",
    tipo: "Clip-on",
    color: "Negro",
    material: "Metal",
    precio: 26000,
    precioTransferencia: 23400,
    cuotas: "3 cuotas sin interés de $8.667",
    badge: "10% OFF",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-clip-2", color: "Negro", material: "Metal", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-clip-2b", color: "Plateado", material: "Metal", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 3 meses por defectos de fabricación en el clip.",
    dimensiones: "Se adapta a armazones de hasta 140mm de ancho.",
  },
  {
    varianteId: "variante-mock-armazon-1",
    productoId: "producto-mock-armazon-1",
    slug: "armazon-rectangular",
    nombre: "Armazón Rectangular",
    linea: "Línea Recetados",
    tipo: "Armazón",
    color: "Azul oscuro",
    material: "Acetato",
    precio: 39000,
    precioTransferencia: 35100,
    cuotas: "3 cuotas sin interés de $13.000",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-armazon-1", color: "Azul oscuro", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-armazon-1b", color: "Negro", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-armazon-1c", color: "Marrón", material: "Acetato", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 12 meses por defectos de fabricación en el armazón.",
    dimensiones: "Ancho del lente: 50mm · Puente: 19mm · Varilla: 145mm.",
  },
  {
    varianteId: "variante-mock-armazon-2",
    productoId: "producto-mock-armazon-2",
    slug: "armazon-cuadrado",
    nombre: "Armazón Cuadrado",
    linea: "Línea Recetados",
    tipo: "Armazón",
    color: "Negro",
    material: "Acetato",
    precio: 41000,
    precioTransferencia: 36900,
    cuotas: "3 cuotas sin interés de $13.667",
    badge: "NUEVO",
    imagen: "/isologo.svg",
    variantes: [
      { varianteId: "variante-mock-armazon-2", color: "Negro", material: "Acetato", imagen: "/isologo.svg" },
      { varianteId: "variante-mock-armazon-2b", color: "Gris", material: "Acetato", imagen: "/isologo.svg" },
    ],
    garantia: "Garantía de 12 meses por defectos de fabricación en el armazón.",
    dimensiones: "Ancho del lente: 53mm · Puente: 17mm · Varilla: 148mm.",
  },
];
