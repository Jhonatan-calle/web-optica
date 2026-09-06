"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="radio-group"
      role="radiogroup"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  id,
  children,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <label
      htmlFor={id}
      data-slot="radio-group-item"
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-muted-foreground/40 has-[:checked]:border-[#00848C] has-[:checked]:ring-3 has-[:checked]:ring-[#00848C]/10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        data-slot="radio-group-item-input"
        className="sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 bg-background transition-colors group-has-[:checked]:border-[#00848C]"
      >
        <span className="h-2 w-2 rounded-full bg-transparent transition-colors group-has-[:checked]:bg-[#00848C]" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">{children}</span>
    </label>
  );
}

export { RadioGroup, RadioGroupItem };