"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Trash2, BanIcon } from "lucide-react"

type BlockedSlot = {
  id: string; startTime: string; endTime: string; reason?: string
}

export default function BlockedSlotsPage() {
  const [slots, setSlots] = useState<BlockedSlot[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ startTime: "", endTime: "", reason: "" })
  const [error, setError] = useState("")

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    const res = await fetch("/api/blocked-slots")
    if (res.ok) setSlots(await res.json())
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/blocked-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: new Date(form.startTime).toISOString(),
        endTime:   new Date(form.endTime).toISOString(),
        reason:    form.reason || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setShowForm(false)
    setForm({ startTime: "", endTime: "", reason: "" })
    fetchSlots()
  }

  async function deleteSlot(id: string) {
    if (!confirm("Supprimer ce blocage ?")) return
    await fetch("/api/blocked-slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchSlots()
  }

  return (
    <div className="ml-60 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créneaux bloqués</h1>
          <p className="text-gray-500 mt-1">Bloquez des périodes spécifiques (congés, réunions internes...)</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Bloquer une période
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-6">Bloquer une période</h2>
            <form onSubmit={createSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Début</label>
                <input type="datetime-local" value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fin</label>
                <input type="datetime-local" value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Raison (optionnel)</label>
                <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Congés, formation..." />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError("") }}
                  className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">
                  Bloquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {slots.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <BanIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Aucun créneau bloqué
          </div>
        )}
        {slots.map(s => (
          <div key={s.id} className="bg-white rounded-xl border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <BanIcon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {format(new Date(s.startTime), "d MMM yyyy HH:mm", { locale: fr })}
                  {" → "}
                  {format(new Date(s.endTime), "d MMM yyyy HH:mm", { locale: fr })}
                </p>
                {s.reason && <p className="text-sm text-gray-400 mt-0.5">{s.reason}</p>}
              </div>
            </div>
            <button onClick={() => deleteSlot(s.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
