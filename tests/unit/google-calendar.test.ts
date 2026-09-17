import { describe, it, expect, vi } from "vitest"
import { buildCalendarEvent, createCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar"

// Pas besoin de mocker googleapis — on passe un _client injecté directement

// ─── buildCalendarEvent — tests purs ──────────────────────────────────────────

describe("buildCalendarEvent", () => {
  const BASE = {
    title: "Appel 30 min", guestName: "Jean Dupont", guestEmail: "jean@test.com",
    startTime: new Date("2030-06-15T10:00:00Z"),
    endTime:   new Date("2030-06-15T10:30:00Z"), timezone: "Europe/Paris",
  }

  it("summary = titre de l'événement", () => {
    expect(buildCalendarEvent(BASE).summary).toContain("Appel 30 min")
  })

  it("description contient nom et email de l'invité", () => {
    const ev = buildCalendarEvent(BASE)
    expect(ev.description).toContain("Jean Dupont")
    expect(ev.description).toContain("jean@test.com")
  })

  it("startTime.dateTime = ISO de la date", () => {
    expect(buildCalendarEvent(BASE).start?.dateTime).toBe(BASE.startTime.toISOString())
  })

  it("endTime.dateTime = ISO de la date", () => {
    expect(buildCalendarEvent(BASE).end?.dateTime).toBe(BASE.endTime.toISOString())
  })

  it("timezone propagé sur start et end", () => {
    const ev = buildCalendarEvent(BASE)
    expect(ev.start?.timeZone).toBe("Europe/Paris")
    expect(ev.end?.timeZone).toBe("Europe/Paris")
  })

  it("attendees contient l'email de l'invité", () => {
    const ev = buildCalendarEvent(BASE)
    expect(ev.attendees).toEqual(
      expect.arrayContaining([expect.objectContaining({ email: "jean@test.com" })])
    )
  })

  it("description personnalisée incluse si fournie", () => {
    const ev = buildCalendarEvent({ ...BASE, description: "Contexte projet" })
    expect(ev.description).toContain("Contexte projet")
  })
})

// ─── createCalendarEvent ──────────────────────────────────────────────────────

const SAMPLE_EVENT = {
  title: "Test", guestName: "A", guestEmail: "a@b.com",
  startTime: new Date("2030-06-15T10:00:00Z"),
  endTime:   new Date("2030-06-15T10:30:00Z"), timezone: "UTC",
}

describe("createCalendarEvent", () => {
  it("retourne null si accessToken absent", async () => {
    const id = await createCalendarEvent({ accessToken: null, event: SAMPLE_EVENT })
    expect(id).toBeNull()
  })

  it("appelle events.insert et retourne l'eventId", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: { id: "gcal_abc123" } })
    const fakeClient = { events: { insert: mockInsert, delete: vi.fn() } } as any

    const id = await createCalendarEvent({ accessToken: "tok", event: SAMPLE_EVENT, _client: fakeClient })

    expect(id).toBe("gcal_abc123")
    expect(mockInsert).toHaveBeenCalledOnce()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "primary" })
    )
  })

  it("passe le bon requestBody à events.insert", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: { id: "gcal_xyz" } })
    const fakeClient = { events: { insert: mockInsert, delete: vi.fn() } } as any

    await createCalendarEvent({ accessToken: "tok", event: SAMPLE_EVENT, _client: fakeClient })

    const call = mockInsert.mock.calls[0][0]
    expect(call.requestBody.summary).toContain("Test")
    expect(call.requestBody.attendees[0].email).toBe("a@b.com")
  })

  it("retourne null si events.insert throw", async () => {
    const fakeClient = {
      events: { insert: vi.fn().mockRejectedValue(new Error("quota")), delete: vi.fn() }
    } as any

    const id = await createCalendarEvent({ accessToken: "tok", event: SAMPLE_EVENT, _client: fakeClient })
    expect(id).toBeNull()
  })

  it("retourne null si data.id absent dans la réponse", async () => {
    const fakeClient = {
      events: { insert: vi.fn().mockResolvedValue({ data: {} }), delete: vi.fn() }
    } as any

    const id = await createCalendarEvent({ accessToken: "tok", event: SAMPLE_EVENT, _client: fakeClient })
    expect(id).toBeNull()
  })
})

// ─── deleteCalendarEvent ──────────────────────────────────────────────────────

describe("deleteCalendarEvent", () => {
  it("ne fait rien si accessToken absent", async () => {
    const mockDelete = vi.fn()
    const fakeClient = { events: { insert: vi.fn(), delete: mockDelete } } as any

    await deleteCalendarEvent({ accessToken: null, googleEventId: "gcal_123", _client: fakeClient })
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("ne fait rien si googleEventId absent", async () => {
    const mockDelete = vi.fn()
    const fakeClient = { events: { insert: vi.fn(), delete: mockDelete } } as any

    await deleteCalendarEvent({ accessToken: "tok", googleEventId: null, _client: fakeClient })
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("appelle events.delete avec le bon eventId", async () => {
    const mockDelete = vi.fn().mockResolvedValue({})
    const fakeClient = { events: { insert: vi.fn(), delete: mockDelete } } as any

    await deleteCalendarEvent({ accessToken: "tok", googleEventId: "gcal_xyz", _client: fakeClient })

    expect(mockDelete).toHaveBeenCalledOnce()
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "gcal_xyz", calendarId: "primary" })
    )
  })

  it("ne throw pas si events.delete throw (non-bloquant)", async () => {
    const fakeClient = {
      events: { insert: vi.fn(), delete: vi.fn().mockRejectedValue(new Error("not found")) }
    } as any

    await expect(
      deleteCalendarEvent({ accessToken: "tok", googleEventId: "gcal_xyz", _client: fakeClient })
    ).resolves.not.toThrow()
  })
})
