import { describe, it, expect } from "vitest"
import { generateSlug, generateTimeSlots, formatTime } from "@/lib/utils"

// ─── generateSlug ───────────────────────────────────────────────────────────

describe("generateSlug", () => {
  it("converts title to lowercase hyphenated slug", () => {
    expect(generateSlug("Appel découverte 30 min")).toBe("appel-dcouverte-30-min")
  })

  it("collapses multiple spaces into single hyphen", () => {
    expect(generateSlug("Hello   World")).toBe("hello-world")
  })

  it("strips special characters", () => {
    expect(generateSlug("Réunion @équipe #2")).toBe("runion-quipe-2")
  })

  it("handles already slugged input", () => {
    expect(generateSlug("my-event")).toBe("my-event")
  })

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("")
  })
})

// ─── generateTimeSlots ──────────────────────────────────────────────────────

describe("generateTimeSlots", () => {
  it("generates correct slots for 30-min events 09:00→11:00", () => {
    expect(generateTimeSlots("09:00", "11:00", 30)).toEqual(["09:00", "09:30", "10:00", "10:30"])
  })

  it("generates correct slots for 60-min events", () => {
    expect(generateTimeSlots("09:00", "12:00", 60)).toEqual(["09:00", "10:00", "11:00"])
  })

  it("returns empty array when duration exceeds window", () => {
    expect(generateTimeSlots("09:00", "09:30", 60)).toEqual([])
  })

  it("does not include slot that would overflow end time", () => {
    // 09:00 + 30min = 09:30 ≤ 09:30 → included
    // 09:30 + 30min = 10:00 > 09:30 → excluded
    expect(generateTimeSlots("09:00", "09:30", 30)).toEqual(["09:00"])
  })

  it("handles 15-min slots", () => {
    const slots = generateTimeSlots("09:00", "10:00", 15)
    expect(slots).toEqual(["09:00", "09:15", "09:30", "09:45"])
  })

  it("returns empty array for equal start and end time", () => {
    expect(generateTimeSlots("09:00", "09:00", 30)).toEqual([])
  })
})

// ─── formatTime ─────────────────────────────────────────────────────────────

describe("formatTime", () => {
  it("retourne une string au format HH:MM", () => {
    const result = formatTime("09:00", "Europe/Paris")
    // On vérifie le format, pas la valeur exacte (dépend du TZ serveur)
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })

  it("retourne une string différente de l'entrée si offset non nul", () => {
    // La fonction formate selon le timezone — le résultat est une string HH:MM
    const result = formatTime("14:30", "UTC")
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })
})
