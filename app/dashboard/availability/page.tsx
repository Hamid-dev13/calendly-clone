"use client"
import { useState, useEffect } from "react"
import { Save, Check } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0")
  const m = i % 2 === 0 ? "00" : "30"
  return `${h}:${m}`
})

type DayConfig = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<DayConfig[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "17:00",
      isActive: i >= 1 && i <= 5,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailability((prev) =>
            prev.map((d) => {
              const found = data.find((a: DayConfig) => a.dayOfWeek === d.dayOfWeek)
              return found ? { ...d, ...found } : d
            })
          )
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
    setTimeout(() => setSaved(false), 2500)
  }

  function update(idx: number, patch: Partial<DayConfig>) {
    setAvailability((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)))
  }

  const selectStyle = {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    fontSize: "0.875rem",
    color: "var(--text)",
    background: "var(--bg)",
    outline: "none",
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Availability
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Set your weekly working hours
            </p>
          </div>
          <Button onClick={save} loading={saving} variant={saved ? "secondary" : "primary"} size="md">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save"}
              </>
            )}
          </Button>
        </div>

        <Card>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {availability.map((day, idx) => (
              <div key={day.dayOfWeek} className="flex items-center gap-6 px-6 py-4">
                {/* Toggle + Day name */}
                <div className="w-36 flex items-center gap-3">
                  <button
                    onClick={() => update(idx, { isActive: !day.isActive })}
                    className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                    style={{ background: day.isActive ? "var(--accent)" : "var(--bg-muted)" }}
                    aria-checked={day.isActive}
                    role="switch"
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: day.isActive ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </button>
                  <span
                    className="text-sm font-medium"
                    style={{ color: day.isActive ? "var(--text)" : "var(--text-muted)" }}
                  >
                    {DAYS[day.dayOfWeek]}
                  </span>
                </div>

                {/* Time pickers */}
                {day.isActive ? (
                  <div className="flex items-center gap-3">
                    <select
                      value={day.startTime}
                      onChange={(e) => update(idx, { startTime: e.target.value })}
                      style={selectStyle}
                    >
                      {TIMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      to
                    </span>
                    <select
                      value={day.endTime}
                      onChange={(e) => update(idx, { endTime: e.target.value })}
                      style={selectStyle}
                    >
                      {TIMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
