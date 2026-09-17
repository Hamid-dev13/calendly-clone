import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"

// Mock next-auth avec getServerSession spy
const mockGetServerSession = vi.fn()
vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }))

// ─── Logique pure : chevauchement de créneaux bloqués ────────────────────────

function overlaps(slotStart: Date, slotEnd: Date, blockStart: Date, blockEnd: Date) {
  return slotStart < blockEnd && slotEnd > blockStart
}

describe("BlockedSlot — logique de chevauchement", () => {
  it("chevauchement partiel au début → bloque", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T09:45:00Z"), new Date("2030-06-01T10:15:00Z")
    )).toBe(true)
  })

  it("chevauchement partiel à la fin → bloque", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T10:15:00Z"), new Date("2030-06-01T10:45:00Z")
    )).toBe(true)
  })

  it("blocage englobe entièrement le slot → bloque", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T09:00:00Z"), new Date("2030-06-01T12:00:00Z")
    )).toBe(true)
  })

  it("blocage adjacent avant → ne bloque pas", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T09:00:00Z"), new Date("2030-06-01T10:00:00Z")
    )).toBe(false)
  })

  it("blocage adjacent après → ne bloque pas", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T10:30:00Z"), new Date("2030-06-01T11:00:00Z")
    )).toBe(false)
  })

  it("blocage complètement après → ne bloque pas", () => {
    expect(overlaps(
      new Date("2030-06-01T10:00:00Z"), new Date("2030-06-01T10:30:00Z"),
      new Date("2030-06-01T14:00:00Z"), new Date("2030-06-01T15:00:00Z")
    )).toBe(false)
  })
})

// ─── Tests API /api/blocked-slots ────────────────────────────────────────────

describe("GET /api/blocked-slots", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("retourne 401 sans session", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const { GET } = await import("@/app/api/blocked-slots/route")
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("retourne la liste des slots avec session", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } })
    vi.mocked(prisma.blockedSlot.findMany).mockResolvedValue([])
    const { GET } = await import("@/app/api/blocked-slots/route")
    const res = await GET()
    expect(res.status).toBe(200)
  })
})

describe("POST /api/blocked-slots", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("retourne 401 sans session", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const { POST } = await import("@/app/api/blocked-slots/route")
    const req = new Request("http://localhost/api/blocked-slots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: "2030-06-01T09:00:00Z", endTime: "2030-06-01T17:00:00Z" }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it("retourne 400 si startTime manquant", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } })
    const { POST } = await import("@/app/api/blocked-slots/route")
    const req = new Request("http://localhost/api/blocked-slots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Vacances" }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it("retourne 400 si endTime avant startTime", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } })
    const { POST } = await import("@/app/api/blocked-slots/route")
    const req = new Request("http://localhost/api/blocked-slots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "2030-06-01T12:00:00Z",
        endTime:   "2030-06-01T09:00:00Z",
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it("crée un slot valide → 201", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } })
    vi.mocked(prisma.blockedSlot.create).mockResolvedValue({
      id: "bs1", userId: "u1",
      startTime: new Date("2030-06-01T09:00:00Z"),
      endTime:   new Date("2030-06-01T17:00:00Z"),
      reason:    "Congés", createdAt: new Date(),
    })
    const { POST } = await import("@/app/api/blocked-slots/route")
    const req = new Request("http://localhost/api/blocked-slots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "2030-06-01T09:00:00Z",
        endTime:   "2030-06-01T17:00:00Z",
        reason:    "Congés",
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
  })
})
