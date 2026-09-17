"use client"
import { useState, useEffect } from "react"
import { Save } from "lucide-react"

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0")
  const m = i % 2 === 0 ? "00" : "30"
  return `${h}:${m}`
})

type DayConfig = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<DayConfig[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i, startTime: "09:00", endTime: "17:00",
      isActive: i >= 1 && i <= 5,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/availability").then(r => r.json()).then(data => {
      if (data.length > 0) {
        setAvailability(prev => prev.map(d => {
          const found = data.find((a: DayConfig) => a.dayOfWeek === d.dayOfWeek)
          return found ? { ...d, ...found } : d
        }))
      }
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update(idx: number, patch: Partial<DayConfig>) {
    setAvailability(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d))
  }

  return (
    <div className="ml-60 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilités</h1>
          <p className="text-gray-500 mt-1">Définissez vos horaires de disponibilité hebdomadaires</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saved ? "Sauvegardé ✓" : saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {availability.map((day, idx) => (
          <div key={day.dayOfWeek} className="flex items-center gap-6 px-6 py-4">
            <div className="w-32">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => update(idx, { isActive: !day.isActive })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${day.isActive ? "bg-blue-600" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${day.isActive ? "translate-x-5" : ""}`} />
                </div>
                <span className={`text-sm font-medium ${day.isActive ? "text-gray-900" : "text-gray-400"}`}>
                  {DAYS[day.dayOfWeek]}
                </span>
              </label>
            </div>
            {day.isActive ? (
              <div className="flex items-center gap-3">
                <select value={day.startTime} onChange={e => update(idx, { startTime: e.target.value })}
                  className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-gray-400 text-sm">→</span>
                <select value={day.endTime} onChange={e => update(idx, { endTime: e.target.value })}
                  className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Indisponible</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
