"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format, addDays, startOfDay, isBefore } from "date-fns"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  User,
  Mail,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"

type EventInfo = {
  id: string
  title: string
  duration: number
  color: string
  description?: string
}
type HostInfo = {
  name: string
  username: string
  image?: string
  timezone: string
}

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
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    fetch(`/api/book/${username}/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEventType(data.eventType)
        setHost(data.user)
      })
  }, [username, slug])

  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSlots([])
    fetch(`/api/book/${username}/${slug}?date=${selectedDate.toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? [])
        setLoadingSlots(false)
      })
  }, [selectedDate, username, slug])

  async function confirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        slug,
        ...form,
        date: selectedDate.toISOString(),
        time: selectedSlot,
      }),
    })
    if (res.ok) setStep("done")
    setLoading(false)
  }

  const today = startOfDay(new Date())
  const weekStart = addDays(today, weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Loading state
  if (!eventType || !host) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-subtle)" }}
      >
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)" }}
        />
      </div>
    )
  }

  // Success state
  if (step === "done") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-subtle)" }}
      >
        <div
          className="w-full max-w-md rounded-[14px] p-10 text-center"
          style={{ background: "var(--bg)", boxShadow: "var(--shadow-lg)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--success-subtle)" }}
          >
            <Check className="w-8 h-8" style={{ color: "var(--success)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Booking confirmed!
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            A confirmation email has been sent to{" "}
            <strong style={{ color: "var(--text)" }}>{form.email}</strong>
          </p>

          <div
            className="rounded-[10px] p-5 text-left space-y-3"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            {[
              { label: "Event", value: eventType.title },
              {
                label: "Date",
                value: selectedDate
                  ? format(selectedDate, "EEEE, MMMM d, yyyy")
                  : "",
              },
              { label: "Time", value: selectedSlot ?? "" },
              { label: "With", value: host.name },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span
                  className="text-sm min-w-[60px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setStep("pick")
              setSelectedDate(null)
              setSelectedSlot(null)
              setForm({ name: "", email: "", notes: "" })
            }}
            className="mt-6 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            Schedule another meeting
          </button>
        </div>
      </div>
    )
  }

  const hostInitial = host.name?.[0]?.toUpperCase() ?? "?"

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "var(--bg-subtle)" }}
    >
      <div
        className="max-w-4xl mx-auto rounded-[14px] overflow-hidden"
        style={{ background: "var(--bg)", boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left panel — host + event info */}
          <div
            className="md:w-72 shrink-0 p-8"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4"
              style={{ background: eventType.color }}
            >
              {hostInitial}
            </div>

            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {host.name}
            </p>
            <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>
              {eventType.title}
            </h1>

            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: eventType.color + "18",
                color: eventType.color,
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              {eventType.duration} minutes
            </div>

            {eventType.description && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {eventType.description}
              </p>
            )}

            {/* Step indicator on mobile/sm */}
            {step === "form" && (
              <div
                className="mt-6 p-4 rounded-[10px] hidden md:block"
                style={{ background: "var(--accent-subtle)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--accent-text)" }}>
                  Your selected time
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                </p>
                <p className="text-sm" style={{ color: "var(--accent-text)" }}>
                  at {selectedSlot}
                </p>
              </div>
            )}
          </div>

          {/* Right panel — calendar or form */}
          <div className="flex-1 p-8">
            {/* STEP: pick */}
            {step === "pick" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold" style={{ color: "var(--text)" }}>
                      Select a date
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {format(weekStart, "MMMM yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                      disabled={weekOffset === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors disabled:opacity-30"
                      style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "var(--bg-muted)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWeekOffset((w) => w + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors"
                      style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "var(--bg-muted)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Week grid */}
                <div className="grid grid-cols-7 gap-2 mb-8">
                  {weekDays.map((day) => {
                    const isPast = isBefore(day, today)
                    const isSelected = selectedDate?.toDateString() === day.toDateString()
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDate(day)
                          setSelectedSlot(null)
                        }}
                        className="flex flex-col items-center py-3 rounded-[10px] text-sm transition-all"
                        style={
                          isSelected
                            ? {
                                background: "var(--accent)",
                                color: "#ffffff",
                              }
                            : isPast
                            ? { opacity: 0.3, cursor: "not-allowed", color: "var(--text)" }
                            : { color: "var(--text)" }
                        }
                        onMouseEnter={(e) => {
                          if (!isPast && !isSelected)
                            (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)"
                        }}
                        onMouseLeave={(e) => {
                          if (!isPast && !isSelected)
                            (e.currentTarget as HTMLElement).style.background = "transparent"
                        }}
                      >
                        <span
                          className="text-xs mb-1 font-medium"
                          style={{
                            opacity: 0.7,
                            color: isSelected ? "#ffffff" : "var(--text-muted)",
                          }}
                        >
                          {format(day, "EEE")}
                        </span>
                        <span className="font-semibold">{format(day, "d")}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <>
                    <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                      Available times
                    </h2>
                    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                      {format(selectedDate, "EEEE, MMMM d")}
                    </p>

                    {loadingSlots ? (
                      <div className="flex items-center gap-2 py-6" style={{ color: "var(--text-muted)" }}>
                        <div
                          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: "var(--accent)" }}
                        />
                        <span className="text-sm">Loading times…</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div
                        className="text-center py-8 rounded-[10px]"
                        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                      >
                        <Calendar
                          className="w-6 h-6 mx-auto mb-2 opacity-30"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          No available times on this day
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => {
                              setSelectedSlot(slot)
                              setStep("form")
                            }}
                            className="py-2.5 px-3 rounded-[10px] text-sm font-medium transition-all"
                            style={{
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              background: "var(--bg)",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLElement
                              el.style.background = "var(--accent)"
                              el.style.color = "#ffffff"
                              el.style.borderColor = "var(--accent)"
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLElement
                              el.style.background = "var(--bg)"
                              el.style.color = "var(--text)"
                              el.style.borderColor = "var(--border)"
                            }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* STEP: form */}
            {step === "form" && (
              <>
                <button
                  onClick={() => setStep("pick")}
                  className="flex items-center gap-1 text-sm mb-6 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {/* Selected time summary on mobile */}
                <div
                  className="flex items-center gap-3 p-4 rounded-[10px] mb-6 md:hidden"
                  style={{ background: "var(--accent-subtle)" }}
                >
                  <Clock className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedSlot}
                    </p>
                    <p className="text-xs" style={{ color: "var(--accent-text)" }}>
                      {eventType.duration} min · {eventType.title}
                    </p>
                  </div>
                </div>

                <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                  Enter your details
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  We&apos;ll send a confirmation to your email.
                </p>

                <form onSubmit={confirmBooking} className="space-y-4">
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-[10px] outline-none"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email address"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-[10px] outline-none"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 w-4 h-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Notes or context (optional)"
                      rows={3}
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-[10px] outline-none resize-none"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    {loading ? "Confirming…" : "Confirm booking"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
