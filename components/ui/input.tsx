import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-2 text-sm font-medium tracking-tight ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-border/80 hover:bg-muted/30",
        "focus-visible:ring-4 focus-visible:ring-brand-secondary/5 focus-visible:border-brand-secondary/40 focus-visible:bg-background focus-visible:-translate-y-[1px] focus-visible:shadow-lg focus-visible:shadow-brand-secondary/5",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
