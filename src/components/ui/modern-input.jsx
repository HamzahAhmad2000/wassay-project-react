import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "border-[var(--color-primary-100)] bg-[var(--color-primary-50)]",
          "text-[var(--color-secondary-900)] placeholder-[var(--color-secondary-800)]",
          "focus-visible:ring-[var(--color-tertiary-500)] focus-visible:border-[var(--color-tertiary-400)]",
          "disabled:bg-[var(--color-primary-100)] disabled:text-[var(--color-secondary-800)]",
          props.error && "border-red-500 focus-visible:ring-red-500",
          props.success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary-800)] hover:text-[var(--color-tertiary-500)] disabled:opacity-50"
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
      {props.error && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
  )
})
Input.displayName = "Input"

const InputWithIcon = React.forwardRef(({ className, icon, iconPosition = "left", ...props }, ref) => (
  <div className="relative w-full">
    <div className={cn(
      "relative",
      iconPosition === "left" && "pl-10",
      iconPosition === "right" && "pr-10"
    )}>
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "border-[var(--color-primary-100)] bg-[var(--color-primary-50)]",
          "text-[var(--color-secondary-900)] placeholder-[var(--color-secondary-800)]",
          "focus-visible:ring-[var(--color-tertiary-500)] focus-visible:border-[var(--color-tertiary-400)]",
          "disabled:bg-[var(--color-primary-100)] disabled:text-[var(--color-secondary-800)]",
          props.error && "border-red-500 focus-visible:ring-red-500",
          props.success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {icon && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10",
          iconPosition === "left" && "left-0",
          iconPosition === "right" && "right-0"
        )}>
          {React.cloneElement(icon, {
            className: cn("h-4 w-4 text-[var(--color-secondary-800)]", icon.props?.className)
          })}
        </div>
      )}
    </div>
  </div>
))
InputWithIcon.displayName = "InputWithIcon"

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      "text-[var(--color-secondary-900)]",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Input, InputWithIcon, Label }