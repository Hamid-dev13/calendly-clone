"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Trash2, BanIcon, AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type BlockedSlot = {
  id: string
  startTime: string
  endTime: string
  reason?: string
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
        endTime: new Date(form.endTime).toISOString(),
        reason: form.reason || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setShowForm(false)
    setForm({ startTime: "", endTime: "", reason: "" })
    fetchSlots()
  }

  async function deleteSlot(id: string) {
    if (!confirm("Supprimer ce créneau bloqué ?")) return
    await fetch("/api/blocked-slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchSlots()
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Créneaux bloqués
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Bloquez des périodes — congés, réunions internes, etc.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="md" className="shrink-0">
            <Plus className="w-4 h-4" />
            Bloquer une période
          </Button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
            <div
              className="w-full sm:max-w-md rounded-t-[20px] sm:rounded-[14px] p-6 sm:p-8"
              style={{ background: "var(--bg)", boxShadow: "var(--shadow-lg)" }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text)" }}>
                Bloquer une période
              </h2>
              <form onSubmit={createSlot} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: "#374151" }}>
                    Début
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                    className="w-full border rounded-[10px] px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: "#374151" }}>
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                    className="w-full border rounded-[10px] px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <Input
                  label="Motif (optionnel)"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Congés, réunion interne…"
                />
                {error && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] text-sm"
                    style={{ background: "var(--danger-subtle)", color: "var(--danger-text)" }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setShowForm(false); setError("") }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="danger" className="flex-1">
                    Bloquer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {slots.length === 0 ? (
            <Card className="p-12 text-center">
              <BanIcon
                className="w-8 h-8 mx-auto mb-3 opacity-30"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                Aucune période bloquée
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Bloquez vos congés et réunions internes pour éviter les réservations.
              </p>
            </Card>
          ) : (
            slots.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ background: "var(--danger-subtle)" }}
                    >
                      <BanIcon className="w-5 h-5" style={{ color: "var(--danger)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {format(new Date(s.startTime), "d MMM yyyy HH:mm", { locale: fr })} →{" "}
                        {format(new Date(s.endTime), "d MMM yyyy HH:mm", { locale: fr })}
                      </p>
                      {s.reason && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                          {s.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Badge variant="danger">Bloqué</Badge>
                    <button
                      onClick={() => deleteSlot(s.id)}
                      className="p-2 rounded-[8px] transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      title="Supprimer le blocage"
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = "var(--danger-subtle)"
                        ;(e.currentTarget as HTMLElement).style.color = "var(--danger)"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background = "transparent"
                        ;(e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
