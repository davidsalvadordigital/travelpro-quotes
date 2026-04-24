import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-3.5 py-1 text-xs font-semibold uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-2 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 transition-all duration-300 overflow-hidden ring-2 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white ring-brand-primary/30 shadow-md",
        secondary: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 ring-cyan-500/40 shadow-sm",
        success: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-emerald-500/40 shadow-sm",
        warning: "bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-amber-500/40 shadow-sm",
        destructive: "bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-rose-500/40 shadow-sm",
        outline: "border-slate-200 bg-slate-50 text-slate-500 ring-0 shadow-none dark:bg-white/5 dark:border-white/10 dark:text-slate-400",
        brand: "bg-brand-primary/20 text-brand-primary ring-brand-primary/40 shadow-sm",
        action: "bg-brand-action/20 text-brand-action ring-brand-action/40 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
