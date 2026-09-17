"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Users, X, Calendar } from "lucide-react"

type Booking = {
  id: string; guestName: string; guestEmail: string; notes?: string
  startTime: string; endTime: string; status: string
  eventType: { title: string; duration: number; color: string }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState("upcoming")

  useEffect(() => { fetchBookings() }, [filter])

  async function fetchBookings() {
    const res = await fetch(`/api/bookings/manage?filter=${filter}`)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
  }

  async function cancelBooking(id: string) {
    if (!confirm("Annuler cette réservation ?")) return
    await fetch("/api/bookings/manage", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchBookings()
  }

  return (
    <div className="ml-60 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
        <p className="text-gray-500 mt-1">Gérez vos rendez-vous</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "upcoming", label: "À venir" },
          { key: "past", label: "Passés" },
          { key: "cancelled", label: "Annulés" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === key ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bookings.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Aucune réservation dans cette catégorie
          </div>
        )}
        {bookings.map(b => (
          <div key={b.id} className="bg-white rounded-xl border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{b.guestName}</h3>
                <p className="text-sm text-gray-400">{b.guestEmail} · {b.eventType.title}</p>
                {b.notes && <p className="text-sm text-gray-500 mt-1 italic">"{b.notes}"</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {format(new Date(b.startTime), "d MMM yyyy", { locale: fr })}
                </p>
                <p className="text-sm text-gray-400">
                  {format(new Date(b.startTime), "HH:mm")} — {format(new Date(b.endTime), "HH:mm")}
                </p>
              </div>
              {b.status === "CONFIRMED" && filter === "upcoming" && (
                <button onClick={() => cancelBooking(b.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Annuler">
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                b.status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}>
                {b.status === "CONFIRMED" ? "Confirmé" : "Annulé"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
