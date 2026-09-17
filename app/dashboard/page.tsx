import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { Calendar, Clock, Users, Plus, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const [eventTypes, upcomingBookings] = await Promise.all([
    prisma.eventType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: "CONFIRMED",
        startTime: { gte: new Date() },
      },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ])

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const firstName = session.user.name?.split(" ")[0] ?? "là"
  const baseUrl = process.env.NEXTAUTH_URL ?? ""
  const bookingUrl = user?.username ? `${baseUrl}/${user.username}` : null

  const stats = [
    { label: "Types d'événements", value: eventTypes.length, icon: Clock },
    { label: "Réservations à venir", value: upcomingBookings.length, icon: Calendar },
    { label: "Types actifs", value: eventTypes.filter((e) => e.isActive).length, icon: Users },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
            Bonjour, {firstName} 👋
          </h1>
          {user?.username && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Votre page de réservation :{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>
                /{user.username}
              </span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: "var(--accent-subtle)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-0.5" style={{ color: "var(--text)" }}>
                {value}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {label}
              </p>
            </Card>
          ))}
        </div>

        {/* Booking link card */}
        {user?.username && bookingUrl && (
          <Card className="mb-6 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text)" }}>
                  Votre lien de réservation
                </p>
                <p className="text-sm font-mono truncate" style={{ color: "var(--accent)" }}>
                  {bookingUrl}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton text={bookingUrl} />
                <Link
                  href={`/${user.username}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Aperçu
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Event types */}
        <Card className="mb-6">
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>
              Types d&apos;événements
            </h2>
            <Link
              href="/dashboard/event-types"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau type
            </Link>
          </div>
          {eventTypes.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Aucun type d&apos;événement.{" "}
                <Link href="/dashboard/event-types" style={{ color: "var(--accent)" }}>
                  Créer →
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {eventTypes.map((et) => (
                <div key={et.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: et.color }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {et.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {et.duration} min · /{et.slug}
                      </p>
                    </div>
                  </div>
                  <Badge variant={et.isActive ? "success" : "default"}>
                    {et.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming bookings */}
        <Card>
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>
              Réservations à venir
            </h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Voir tout
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Aucune réservation à venir
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {upcomingBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      style={{ background: b.eventType.color }}
                    >
                      {b.guestName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {b.guestName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {b.eventType.title} · {b.guestEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {new Date(b.startTime).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {new Date(b.startTime).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
