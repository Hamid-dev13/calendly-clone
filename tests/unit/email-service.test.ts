import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildConfirmationText, buildCancellationText, buildReminderText, type BookingEmailData } from "@/lib/email"

// Mock Resend au top-level (obligatoire pour Vitest)
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: "email_123" }) },
  })),
}))

// ─── Données de test ─────────────────────────────────────────────────────────

const BOOKING: BookingEmailData = {
  guestName:  "Jean Dupont",
  guestEmail: "jean@test.com",
  hostName:   "Marie Martin",
  eventTitle: "Appel découverte 30 min",
  startTime:  new Date("2030-06-15T10:00:00Z"),
  endTime:    new Date("2030-06-15T10:30:00Z"),
  duration:   30,
}

// ─── Tests buildConfirmationText ─────────────────────────────────────────────

describe("buildConfirmationText", () => {
  it("contient le nom de l'invité", () => {
    expect(buildConfirmationText(BOOKING)).toContain("Jean Dupont")
  })

  it("contient le titre de l'événement", () => {
    expect(buildConfirmationText(BOOKING)).toContain("Appel découverte 30 min")
  })

  it("contient le nom de l'hôte", () => {
    expect(buildConfirmationText(BOOKING)).toContain("Marie Martin")
  })

  it("contient la durée", () => {
    expect(buildConfirmationText(BOOKING)).toContain("30 min")
  })

  it("mentionne que le RDV est confirmé", () => {
    expect(buildConfirmationText(BOOKING)).toContain("confirmé")
  })

  it("contient l'heure de début (10:00)", () => {
    expect(buildConfirmationText(BOOKING)).toContain("10:00")
  })
})

// ─── Tests buildCancellationText ─────────────────────────────────────────────

describe("buildCancellationText", () => {
  it("contient le nom de l'invité", () => {
    expect(buildCancellationText(BOOKING)).toContain("Jean Dupont")
  })

  it("mentionne l'annulation", () => {
    expect(buildCancellationText(BOOKING)).toContain("annulé")
  })

  it("contient le titre de l'événement", () => {
    expect(buildCancellationText(BOOKING)).toContain("Appel découverte 30 min")
  })

  it("contient le nom de l'hôte", () => {
    expect(buildCancellationText(BOOKING)).toContain("Marie Martin")
  })
})

// ─── Tests buildReminderText ─────────────────────────────────────────────────

describe("buildReminderText", () => {
  it("contient 'demain'", () => {
    expect(buildReminderText(BOOKING)).toContain("demain")
  })

  it("contient l'heure du RDV", () => {
    expect(buildReminderText(BOOKING)).toContain("10:00")
  })

  it("contient le titre de l'événement", () => {
    expect(buildReminderText(BOOKING)).toContain("Appel découverte 30 min")
  })
})

// ─── Tests sendConfirmationEmail (Resend mocké) ───────────────────────────────

describe("sendConfirmationEmail", () => {
  it("ne throw pas si RESEND_API_KEY absent", async () => {
    delete process.env.RESEND_API_KEY
    const { sendConfirmationEmail } = await import("@/lib/email")
    await expect(sendConfirmationEmail(BOOKING)).resolves.toBeUndefined()
  })
})
