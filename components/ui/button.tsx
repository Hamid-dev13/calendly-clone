import * as React from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb] shadow-sm",
  secondary:
    "bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f8f9fa] focus-visible:ring-[#2563eb] shadow-sm",
  ghost:
    "bg-transparent text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] focus-visible:ring-[#2563eb]",
  danger:
    "bg-[#dc2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#dc2626] shadow-sm",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[6px] gap-1.5",
  md: "px-4 py-2 text-sm rounded-[10px] gap-2",
  lg: "px-5 py-2.5 text-base rounded-[10px] gap-2",
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
