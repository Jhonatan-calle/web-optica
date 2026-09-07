import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel de administración | La Óptica",
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
        Panel de administración
      </h1>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-background px-6 py-10 text-center">
        <Lock className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          El panel está en construcción. La protección de acceso ya está activa:
          solo usuarios con rol ADMIN pueden llegar hasta acá.
        </p>
      </div>
    </main>
  );
}