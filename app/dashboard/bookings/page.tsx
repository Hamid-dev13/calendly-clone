"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { X, Calendar, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Booking = {
  id: string
  guestName: string
  guestEmail: string
  notes?: string
  startTime: string
  endTime: string
  status: string
  eventType: { title: string; duration: number; color: string }
}

const FILTERS = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "cancelled", label: "Annulés" },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState("upcoming")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  async function fetchBookings() {
    setLoading(true)
    const res = await fetch(`/api/bookings/manage?filter=${filter}`)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function cancelBooking(id: string) {
    if (!confirm("Annuler cette réservation ?")) return
    await fetch("/api/bookings/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchBookings()
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Réservations
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Gérez vos réunions planifiées
          </p>
        </div>

        {/* Tab filter */}
        <div
          className="flex gap-1 p-1 rounded-[10px] mb-6 w-fit"
          style={{ background: "var(--bg-muted)" }}
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 sm:px-4 py-2 rounded-[8px] text-sm font-medium transition-all"
              style={
                filter === key
                  ? {
                      background: "var(--bg)",
                      color: "var(--text)",
                      boxShadow: "var(--shadow-sm)",
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Booking list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent)" }}
              />
            </div>
          ) : bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar
                className="w-8 h-8 mx-auto mb-3 opacity-30"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                Aucune réservation
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {filter === "upcoming"
                  ? "Aucun RDV à venir."
                  : filter === "past"
                  ? "Aucun RDV passé."
                  : "Aucun RDV annulé."}
              </p>
            </Card>
          ) : (
            bookings.map((b) => (
              <Card key={b.id}>
                <div className="flex items-start sm:items-center justify-between p-4 sm:p-5 gap-3">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      style={{ background: b.eventType.color }}
                    >
                      {b.guestName?.[0]?.toUpperCase() ?? <Users className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          {b.guestName}
                        </p>
                        <Badge
                          variant={
                            b.status === "CONFIRMED"
                              ? "success"
                              : b.status === "CANCELLED"
                              ? "danger"
                              : "default"
                          }
                        >
                          {b.status === "CONFIRMED" ? "Confirmé" : "Annulé"}
                        </Badge>
                      </div>
                      <p className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
                        {b.guestEmail}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: b.eventType.color }}
                        />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {b.eventType.title}
                        </p>
                      </div>
                      {/* Date visible on mobile below name */}
                      <p className="text-xs mt-1 sm:hidden font-medium" style={{ color: "var(--text)" }}>
                        {format(new Date(b.startTime), "d MMM yyyy", { locale: fr })} · {format(new Date(b.startTime), "HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {format(new Date(b.startTime), "d MMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(b.startTime), "HH:mm")} —{" "}
                        {format(new Date(b.endTime), "HH:mm")}
                      </p>
                    </div>

                    {b.status === "CONFIRMED" && filter === "upcoming" && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="p-2 rounded-[8px] transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        title="Annuler la réservation"
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "var(--danger-subtle)"
                          ;(e.currentTarget as HTMLElement).style.color = "var(--danger)"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "transparent"
                          ;(e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
