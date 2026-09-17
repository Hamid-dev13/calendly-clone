"use client"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react"

type EventType = {
  id: string; title: string; slug: string; description?: string
  duration: number; color: string; isActive: boolean
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", duration: 30, color: "#0069ff" })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchEventTypes() }, [])

  async function fetchEventTypes() {
    const res = await fetch("/api/event-types")
    setEventTypes(await res.json())
  }

  async function createEventType(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/event-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setShowForm(false)
    setForm({ title: "", description: "", duration: 30, color: "#0069ff" })
    await fetchEventTypes()
    setLoading(false)
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/event-types/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) })
    await fetchEventTypes()
  }

  async function deleteEventType(id: string) {
    if (!confirm("Supprimer ce type d'événement ?")) return
    await fetch(`/api/event-types/${id}`, { method: "DELETE" })
    await fetchEventTypes()
  }

  return (
    <div className="ml-60 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Types d'événements</h1>
          <p className="text-gray-500 mt-1">Gérez les types de RDV que vous proposez</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Nouveau type
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-6">Nouveau type d'événement</h2>
            <form onSubmit={createEventType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ex: Appel découverte 30 min" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optionnel)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Durée (min)</label>
                  <select value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 outline-none">
                    {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-full h-10 border rounded-lg cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {eventTypes.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            Aucun type d'événement — créez-en un pour commencer.
          </div>
        )}
        {eventTypes.map(et => (
          <div key={et.id} className="bg-white rounded-xl border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: et.color + "20" }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: et.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{et.title}</h3>
                <p className="text-sm text-gray-400">{et.duration} min · /{et.slug}</p>
                {et.description && <p className="text-sm text-gray-500 mt-1">{et.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${et.slug}`)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg" title="Copier le lien">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => toggleActive(et.id, et.isActive)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                {et.isActive ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => deleteEventType(et.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
