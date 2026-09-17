import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  error?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helper?: string
  error?: string
}

export function Input({ label, helper, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={[
          "w-full px-3 py-2 text-sm text-[#111827] bg-white",
          "border rounded-[10px] outline-none",
          "placeholder:text-[#9ca3af]",
          "transition-colors",
          error
            ? "border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20"
            : "border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20",
          className,
        ].join(" ")}
      />
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      {helper && !error && <p className="text-xs text-[#9ca3af]">{helper}</p>}
    </div>
  )
}

export function Textarea({ label, helper, error, className = "", id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={inputId}
        className={[
          "w-full px-3 py-2 text-sm text-[#111827] bg-white",
          "border rounded-[10px] outline-none resize-none",
          "placeholder:text-[#9ca3af]",
          "transition-colors",
          error
            ? "border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20"
            : "border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20",
          className,
        ].join(" ")}
      />
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      {helper && !error && <p className="text-xs text-[#9ca3af]">{helper}</p>}
    </div>
  )
}
