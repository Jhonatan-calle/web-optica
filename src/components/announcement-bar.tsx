import { cn } from "@/lib/utils";

const ANNOUNCEMENT_MESSAGE = "10% OFF vía Transferencia";

export function AnnouncementBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex h-8 w-full shrink-0 items-center justify-center border-b border-white/10 bg-brand px-4 text-center text-xs text-brand-foreground sm:text-sm",
        className,
      )}
    >
      <span>{ANNOUNCEMENT_MESSAGE}</span>
    </div>
  );
}
