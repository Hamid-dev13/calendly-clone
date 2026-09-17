import * as React from "react"

type BadgeVariant = "default" | "success" | "danger" | "warning" | "accent"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#f3f4f6] text-[#374151]",
  success: "bg-[#f0fdf4] text-[#15803d]",
  danger:  "bg-[#fef2f2] text-[#b91c1c]",
  warning: "bg-[#fffbeb] text-[#92400e]",
  accent:  "bg-[#eff6ff] text-[#1e40af]",
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  )
}
