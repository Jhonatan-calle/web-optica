export function ProductGallery({ imagen, nombre }: { imagen: string; nombre: string }) {
  return (
    <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-[#F9FAFB] md:sticky md:top-24">
      <img src={imagen} alt={nombre} className="h-32 w-auto opacity-80" />
    </div>
  );
}
