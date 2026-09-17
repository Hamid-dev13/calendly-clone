"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"

type EventType = {
  id: string
  title: string
  slug: string
  description?: string
  duration: number
  color: string
  isActive: boolean
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", duration: 30, color: "#2563eb" })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchEventTypes() }, [])

  async function fetchEventTypes() {
    const res = await fetch("/api/event-types")
    setEventTypes(await res.json())
  }

  async function createEventType(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/event-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm({ title: "", description: "", duration: 30, color: "#2563eb" })
    await fetchEventTypes()
    setLoading(false)
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/event-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    await fetchEventTypes()
  }

  async function deleteEventType(id: string) {
    if (!confirm("Delete this event type?")) return
    await fetch(`/api/event-types/${id}`, { method: "DELETE" })
    await fetchEventTypes()
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`)
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Event types
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage the meeting types you offer
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="md">
            <Plus className="w-4 h-4" />
            New event type
          </Button>
        </div>

        {/* Create modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div
              className="w-full max-w-md rounded-[14px] p-8"
              style={{ background: "var(--bg)", boxShadow: "var(--shadow-lg)" }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text)" }}>
                New event type
              </h2>
              <form onSubmit={createEventType} className="space-y-4">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 30-min intro call"
                  required
                />
                <Textarea
                  label="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What's this meeting about?"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" style={{ color: "#374151" }}>
                      Duration
                    </label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full border rounded-[10px] px-3 py-2 text-sm outline-none"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      {[15, 30, 45, 60, 90, 120].map((d) => (
                        <option key={d} value={d}>
                          {d} min
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" style={{ color: "#374151" }}>
                      Color
                    </label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full h-10 border rounded-[10px] cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    {loading ? "Creating…" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {eventTypes.length === 0 && (
            <Card className="p-12 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--bg-muted)" }}
              >
                <Plus className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                No event types yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Create your first event type to start accepting bookings.
              </p>
            </Card>
          )}

          {eventTypes.map((et) => (
            <Card key={et.id}>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  {/* Color accent */}
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ background: et.color, minHeight: 48 }}
                  />
                  <div
                    className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: et.color + "20" }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ background: et.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {et.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {et.duration} min · /{et.slug}
                    </p>
                    {et.description && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {et.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={et.isActive ? "success" : "default"} className="mr-2">
                    {et.isActive ? "Active" : "Inactive"}
                  </Badge>

                  <button
                    onClick={() => copyLink(et.slug)}
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Copy booking link"
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--text)"
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = "transparent"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleActive(et.id, et.isActive)}
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ color: et.isActive ? "var(--accent)" : "var(--text-muted)" }}
                    title={et.isActive ? "Deactivate" : "Activate"}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)"
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = "transparent"
                    }}
                  >
                    {et.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => deleteEventType(et.id)}
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Delete"
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
