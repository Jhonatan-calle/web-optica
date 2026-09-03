# UI/UX & Aesthetic Guidelines v2.0: E-commerce "La Óptica"
Inspired by high-end minimalist optical brands & Cristálida layout patterns.

## 1. Brand Identity & Design Tokens

### Color Palette
- Brand Accent (Logo Teal): `rgb(0%, 52%, 55%)` / `#00848C` (Used strategically for primary CTAs, active states, focus rings, and key badges like "10% OFF").
- Primary Background: `#FFFFFF` (Pure White)
- Secondary Surface: `#F9FAFB` (Warm Neutral - Light Gray for product image containers, skeleton loaders, and alternate section backgrounds).
- Primary Text: `#111827` (Deep Charcoal for high-contrast titles and body text).
- Muted / Secondary Text: `#6B7280` (Cool Gray for subtitles, pricing breakdown, and installment info).
- Border / Divider: `#E5E7EB` (Subtle light gray for non-intrusive card borders).

### Typography
- Primary Font Family: `Inter` or `Manrope` (Sans-serif via `next/font/google`).
- Hierarchy & Scale:
  - H1 / Hero Headings: `text-3xl md:text-5xl font-semibold tracking-tight`
  - H2 / Section Titles: `text-2xl md:text-3xl font-semibold tracking-tight`
  - H3 / Card Titles: `text-sm md:text-base font-medium text-gray-900`
  - Body / Subtitles: `text-sm text-gray-600`
  - Micro-copy / Installments: `text-xs text-gray-500`

### Shapes, Borders & Shadows
- Border Radius: Modern subtle rounding -> `rounded-lg` (8px) for cards/inputs, `rounded-full` for badges/pills and icon triggers.
- Shadows: Soft, non-intrusive elevation -> `shadow-sm` on product cards upon hover, `shadow-xl` for sliding drawers/sheets and modals.

---


### A. Home / Landing Page (`/`)
1. Top Announcement Bar: Sticky slim bar with `#00848C` (Teal) background and white text ("10% OFF vía Transferencia" | "Envío gratis a todo el país").
2. Main Header: Minimal navbar with Logo, Category Links, Search Trigger, User Account, and Cart Drawer Trigger with item counter badge.
3. Hero Section: Asymmetric 2-column layout (Left: Editorial headline "Encontrá tu marco ideal" + CTA "Ver Catálogo" / Right: High-res lifestyle photo with brand models).
4. Brand Line Highlights: Carousel/Grid showcasing key collections (e.g., "Línea Sun", "Línea Clip-on", "Línea Recetados").
5. Featured Products Grid: Top 4-8 selling products with direct "Agregar al Carrito" overlay.
6. Value Proposition Banner: 3-column icon grid ("Envío Nacional", "3 Cuotas Sin Interés", "Retiro Gratis en Local").
7. Social Proof & Instagram Feed: Grid featuring `@_laoptica` social posts.

### B. Catalog / Collection Page (`/catalogo` or `/aros`)
- Filters Header: Clean horizontal filter bar (Filter by Line, Material, Color, Sort by Price).
- Responsive Grid: 2 columns on Mobile (`grid-cols-2`), 3 to 4 columns on Desktop (`md:grid-cols-3 lg:grid-cols-4`).
- Product Cards:
  - Container: 1:1 or 4:5 aspect ratio image container (`bg-[#F9FAFB] rounded-lg`).
  - Badges: Absolute top-left pills (`bg-[#00848C] text-white text-xs px-2 py-1 rounded-full`).
  - Secondary Image Hover: Smooth transition to second image variant on hover.
  - Price Stack: Main Price (`text-gray-900 font-semibold`) + Transfer Price (`text-[#00848C] font-medium text-xs`) + Installment copy (`text-xs text-gray-500`).

### C. Product Detail Page PDP (`/producto/[slug]`)
- Sticky Image Gallery (Left Column) + Purchase Stack (Right Column).
- Color Variant Swatches (Rounded border selector rings using Teal focus outline).
- Interactive Zip Code Shipping Calculator with instant carrier price display.
- Accordion for Dimensions & Materials (Using Shadcn Accordion component).

---

## 3. UI Feedback States & Edge Cases

### A. Loading States
- Loading Skeletons: Use pulse animation skeletons matching the card grid structure (`<Skeleton className="h-64 w-full rounded-lg" />`) for product lists during initial data fetching or filtering.

### B. Toast Notifications (Sonner / Toast)
- Adding Item to Cart: Trigger a top-right floating toast notification with product thumbnail, title, "Producto agregado al carrito" message, and a direct "Ir al Carrito" button.

### C. Form Validations
- Input Error States: Highlight input border in red (`border-red-500`), display small helper text below in red (`text-xs text-red-500`).
- Interactive Buttons: Show spinning loader icon (`<Loader2 className="animate-spin" />`) and disable button during server action submissions (e.g., "Procesando pago...").

### D. Empty States
- Empty Cart Drawer: Clean vector icon, "Tu carrito está vacío" headline, and a primary CTA button "Explorar Catálogo".
- No Search Results: Friendly message "No encontramos productos que coincidan con tu búsqueda", with a "Limpiar Filtros" button.

---

## 4. Admin Panel UI Concept (Backoffice)
- Clean, high-density dashboard powered by Shadcn UI Data Tables.
- Sidebar Navigation: Products, Inventory/Stock, Orders, Customers, Settings.
- Product Form: Multi-tab layout for Basic Info, Image Uploads, Color/Material Variants, and Pricing/Stock control.
- Order Management: Status badges (`bg-yellow-100 text-yellow-800` for Pending, `bg-green-100 text-green-800` for Paid, `bg-blue-100 text-blue-800` for Shipped).