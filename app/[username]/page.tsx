import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Clock, Calendar } from "lucide-react"
import { EventTypeCard } from "@/components/event-type-card"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      eventTypes: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!user) notFound()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-subtle)", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={20} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>CalenClone</span>
        </div>
      </div>

      {/* Profile */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        {/* Avatar + Name */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--accent)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, margin: "0 auto 16px",
            boxShadow: "var(--shadow-md)",
          }}>
            {(user.name ?? user.username ?? "?")[0].toUpperCase()}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
            {user.name ?? user.username}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            @{user.username}
          </p>
          {user.bio && (
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 12, maxWidth: 400, margin: "12px auto 0" }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* Event types */}
        {user.eventTypes.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", padding: "48px 24px",
            textAlign: "center", color: "var(--text-muted)",
          }}>
            <Clock size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ margin: 0 }}>Aucun événement disponible pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 4, fontWeight: 500 }}>
              {user.eventTypes.length} type{user.eventTypes.length > 1 ? "s" : ""} de rendez-vous disponible{user.eventTypes.length > 1 ? "s" : ""}
            </p>
            {user.eventTypes.map((et) => (
              <EventTypeCard key={et.id} et={et} username={username} />
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 40 }}>
          Propulsé par <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>CalenClone</Link>
        </p>
      </div>
    </div>
  )
}
