"use client"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    // Fallback pour HTTP (Tailscale IP) — navigator.clipboard exige HTTPS
    const fallback = () => {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(fallback)
    } else {
      fallback()
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors"
      style={{
        background: copied ? "var(--success-subtle)" : "var(--accent-subtle)",
        color: copied ? "var(--success-text)" : "var(--accent-text)",
      }}
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5" /> Copié !</>
      ) : (
        <><Copy className="w-3.5 h-3.5" /> Copier</>
      )}
    </button>
  )
}
