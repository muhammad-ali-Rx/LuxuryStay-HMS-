import { cn } from "../../lib/utils"

export function Button({ className, variant = "default", size = "md", disabled = false, children, ...props }) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
    outline: "border border-border text-primary hover:bg-secondary focus:ring-primary",
    ghost: "text-primary hover:bg-secondary focus:ring-primary",
    accent: "bg-accent text-white hover:bg-accent/90 focus:ring-accent",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button
