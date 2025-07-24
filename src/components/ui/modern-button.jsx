import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-tertiary-500)] text-white hover:bg-[var(--color-tertiary-600)] focus-visible:ring-[var(--color-tertiary-400)]",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400",
        outline: "border border-[var(--color-primary-100)] bg-background hover:bg-[var(--color-primary-50)] hover:text-[var(--color-tertiary-600)]",
        secondary: "bg-[var(--color-primary-100)] text-[var(--color-secondary-900)] hover:bg-[var(--color-primary-200)]",
        ghost: "hover:bg-[var(--color-primary-100)] hover:text-[var(--color-secondary-900)]",
        link: "text-[var(--color-tertiary-500)] underline-offset-4 hover:underline hover:text-[var(--color-tertiary-600)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Comp>
  )
})
Button.displayName = "Button"

const LoadingButton = React.forwardRef(({ loadingText, children, loading, ...props }, ref) => (
  <Button ref={ref} loading={loading} disabled={loading} {...props}>
    {loading ? loadingText || children : children}
  </Button>
))
LoadingButton.displayName = "LoadingButton"

const IconButton = React.forwardRef(({ icon, children, iconPosition = "left", ...props }, ref) => (
  <Button ref={ref} {...props}>
    {iconPosition === "left" && icon}
    {children}
    {iconPosition === "right" && icon}
  </Button>
))
IconButton.displayName = "IconButton"

export { Button, LoadingButton, IconButton, buttonVariants }