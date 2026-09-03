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
  },
];
