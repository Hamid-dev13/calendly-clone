"use client"
import Link from "next/link"
import { Clock } from "lucide-react"
import { useState } from "react"

type EventType = {
  id: string
  title: string
  slug: string
  description?: string | null
  duration: number
  color: string
}

export function EventTypeCard({ et, username }: { et: EventType; username: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/${username}/${et.slug}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderLeft: `4px solid ${et.color}`,
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.15s",
          boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
            {et.title}
          </h2>
          {et.description && (
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 8px" }}>
              {et.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {et.duration} min
            </span>
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: et.color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: et.color }} />
        </div>
      </div>
    </Link>
  )
}
