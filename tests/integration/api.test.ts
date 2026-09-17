import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"

// Mock next-auth au top-level (obligatoire pour Vitest hoisting)
vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: "user1" } }),
}))

// ─── /api/auth/register ──────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("crée un utilisateur avec des données valides", async () => {
    const mockUser = { id: "1", name: "Jean", email: "jean@test.com", username: "jean123" }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.availability.createMany).mockResolvedValue({ count: 5 })

    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jean", email: "jean@test.com", password: "password123" }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it("refuse un email déjà utilisé", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1" } as any)

    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jean", email: "jean@test.com", password: "password123" }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("déjà")
  })

  it("refuse un mot de passe trop court (< 8 chars)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jean", email: "jean@test.com", password: "123" }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })
})

// ─── /api/event-types ────────────────────────────────────────────────────────

describe("POST /api/event-types", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("retourne 401 sans session", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue(null)

    const { POST } = await import("@/app/api/event-types/route")
    const req = new Request("http://localhost/api/event-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Appel 30 min", duration: 30, color: "#0069ff" }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it("crée un event type avec session valide", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user1" }, expires: "" })

    const mockEvent = {
      id: "evt1", title: "Appel 30 min", slug: "appel-30-min",
      duration: 30, color: "#0069ff", isActive: true, userId: "user1",
      createdAt: new Date(), updatedAt: new Date(), description: null,
    }
    vi.mocked(prisma.eventType.create).mockResolvedValue(mockEvent as any)

    const { POST } = await import("@/app/api/event-types/route")
    const req = new Request("http://localhost/api/event-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Appel 30 min", duration: 30, color: "#0069ff" }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(201)
  })
})
