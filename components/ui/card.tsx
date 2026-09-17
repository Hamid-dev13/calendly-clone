import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        "bg-white rounded-[10px]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div
      {...props}
      className={[
        "px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = "", ...props }: CardProps) {
  return (
    <div {...props} className={["p-6", className].join(" ")}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div
      {...props}
      className={[
        "px-6 py-4 border-t border-[#e5e7eb]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}
