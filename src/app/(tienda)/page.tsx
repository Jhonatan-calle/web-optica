import { Hero } from "@/components/home/hero";
import { Collections } from "@/components/home/collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ValueBanner } from "@/components/home/value-banner";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Collections />
      <FeaturedProducts />
      <ValueBanner />
    </main>
  );
}
