"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format, addDays, startOfDay, isBefore } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react"

type EventInfo = { id: string; title: string; duration: number; color: string; description?: string }
type HostInfo = { name: string; username: string; image?: string; timezone: string }

export default function BookingPage() {
  const params = useParams()
  const username = params.username as string
  const slug = params.slug as string

  const [eventType, setEventType] = useState<EventInfo | null>(null)
  const [host, setHost] = useState<HostInfo | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [form, setForm] = useState({ name: "", email: "", notes: "" })
  const [step, setStep] = useState<"pick" | "form" | "done">("pick")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/book/${username}/${slug}`)
      .then(r => r.json())
      .then(data => { setEventType(data.eventType); setHost(data.user) })
  }, [username, slug])

  useEffect(() => {
    if (!selectedDate) return
    fetch(`/api/book/${username}/${slug}?date=${selectedDate.toISOString()}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots ?? []))
  }, [selectedDate])

  async function confirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, slug, ...form, date: selectedDate.toISOString(), time: selectedSlot }),
    })
    if (res.ok) setStep("done")
    setLoading(false)
  }

  const today = startOfDay(new Date())
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(addDays(today, weekOffset * 7), i))

  if (!eventType || !host) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>

  if (step === "done") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border p-10 text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h1>
        <p className="text-gray-500">Un email de confirmation a été envoyé à <strong>{form.email}</strong></p>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left text-sm space-y-1">
          <p><span className="text-gray-400">Événement :</span> {eventType.title}</p>
          <p><span className="text-gray-400">Date :</span> {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}</p>
          <p><span className="text-gray-400">Heure :</span> {selectedSlot}</p>
          <p><span className="text-gray-400">Avec :</span> {host.name}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left panel */}
          <div className="p-8 border-r">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-lg font-bold">
              {host.name?.[0] ?? "?"}
            </div>
            <p className="text-gray-500 text-sm">{host.name}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">{eventType.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Clock className="w-4 h-4" />
              {eventType.duration} minutes
            </div>
            {eventType.description && <p className="text-gray-400 text-sm mt-4">{eventType.description}</p>}
          </div>

          {/* Right panel */}
          <div className="col-span-2 p-8">
            {step === "pick" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" /> Choisir une date
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                      className="p-1.5 border rounded-lg hover:bg-gray-50" disabled={weekOffset === 0}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 border rounded-lg hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-8">
                  {weekDays.map(day => {
                    const isPast = isBefore(day, today)
                    const isSelected = selectedDate?.toDateString() === day.toDateString()
                    return (
                      <button key={day.toISOString()} disabled={isPast} onClick={() => { setSelectedDate(day); setSelectedSlot(null) }}
                        className={`flex flex-col items-center py-3 rounded-xl text-sm transition-colors
                          ${isPast ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50"}
                          ${isSelected ? "bg-blue-600 text-white hover:bg-blue-600" : ""}`}>
                        <span className="text-xs mb-1 uppercase opacity-60">{format(day, "EEE", { locale: fr })}</span>
                        <span className="font-semibold">{format(day, "d")}</span>
                      </button>
                    )
                  })}
                </div>

                {selectedDate && (
                  <>
                    <h2 className="font-semibold text-gray-900 mb-4">
                      Créneaux — {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    </h2>
                    {slots.length === 0 ? (
                      <p className="text-gray-400 text-sm">Aucun créneau disponible ce jour.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map(slot => (
                          <button key={slot} onClick={() => { setSelectedSlot(slot); setStep("form") }}
                            className="border rounded-lg py-2.5 text-sm font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {step === "form" && (
              <>
                <button onClick={() => setStep("pick")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <div className="mb-6 p-4 bg-blue-50 rounded-xl text-sm">
                  <p className="font-medium text-blue-900">{eventType.title}</p>
                  <p className="text-blue-600 mt-1">
                    {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })} à {selectedSlot}
                  </p>
                </div>
                <h2 className="font-semibold text-gray-900 mb-4">Vos informations</h2>
                <form onSubmit={confirmBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom complet</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Jean Dupont" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="vous@exemple.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      placeholder="Partagez vos questions ou le contexte..." />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Confirmation..." : "Confirmer le RDV"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
