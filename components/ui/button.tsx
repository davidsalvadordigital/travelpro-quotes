import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-bold tracking-tight transition-all duration-300 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40 focus-visible:border-brand-secondary/50 select-none",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-primary-foreground shadow-xl shadow-brand-primary/10 hover:shadow-brand-primary/20 hover:-translate-y-[1.5px] border-t border-white/10",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 hover:-translate-y-[1px] shadow-lg shadow-destructive/10",
        outline:
          "border border-border/60 bg-background/50 backdrop-blur-md shadow-sm hover:bg-muted hover:border-border transition-all",
        secondary:
          "bg-brand-secondary text-primary-foreground shadow-lg shadow-brand-secondary/10 hover:bg-brand-secondary/90 hover:-translate-y-[1px]",
        action:
          "bg-brand-action text-white shadow-xl shadow-brand-action/20 hover:bg-brand-action/90 hover:-translate-y-[1px] border-t border-white/20",
        ghost:
          "hover:bg-muted/80 hover:text-foreground transition-colors",
        link: "text-brand-secondary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs font-semibold uppercase tracking-wider",
        sm: "h-9 rounded-xl gap-2 px-4 text-xs font-bold",
        lg: "h-13 rounded-2xl px-8 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
