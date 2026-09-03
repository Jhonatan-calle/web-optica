export interface MockProducto {
  varianteId: string;
  productoId: string;
  slug: string;
  nombre: string;
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
    color: "Carey",
    material: "Metal",
    precio: 62000,
    precioTransferencia: 55800,
    cuotas: "3 cuotas sin interés de $20.667",
    badge: "NUEVO",
    imagen: "/isologo.svg",
  },
  {
    varianteId: "variante-mock-clip-1",
    productoId: "producto-mock-clip-1",
    slug: "clip-on-tabaco",
    nombre: "Clip-on Tabaco",
    color: "Tabaco",
    material: "Acetato",
    precio: 24500,
    precioTransferencia: 22050,
    cuotas: "3 cuotas sin interés de $8.167",
    imagen: "/isologo.svg",
  },
  {
    varianteId: "variante-mock-armazon-1",
    productoId: "producto-mock-armazon-1",
    slug: "armazon-rectangular",
    nombre: "Armazón Rectangular",
    color: "Azul oscuro",
    material: "Acetato",
    precio: 39000,
    precioTransferencia: 35100,
    cuotas: "3 cuotas sin interés de $13.000",
    imagen: "/isologo.svg",
  },
];
