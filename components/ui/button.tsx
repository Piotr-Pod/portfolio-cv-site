import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-slate-300 bg-background text-foreground hover:border-cyan-500 hover:text-cyan-500 hover:bg-cyan-50 dark:border-slate-600 dark:bg-background dark:text-foreground dark:hover:border-cyan-400 dark:hover:text-cyan-400 dark:hover:bg-cyan-950/20",
        "outline-blue":
          "border border-blue-600 bg-background text-blue-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:bg-background dark:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/20",
        secondary:
          "bg-cyan-500 text-white hover:bg-cyan-600",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-2xl px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
