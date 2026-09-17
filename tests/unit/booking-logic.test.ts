import { describe, it, expect, vi, beforeEach } from "vitest"
import { addMinutes } from "date-fns"

// Logique métier extraite — testable sans DB
// On teste le comportement pur : est-ce qu'un créneau est libre ?

interface Booking {
  startTime: Date
  endTime: Date
  status: string
}

interface BlockedSlot {
  startTime: Date
  endTime: Date
}

function isSlotAvailable(
  slotStart: Date,
  duration: number,
  bookings: Booking[],
  blockedSlots: BlockedSlot[],
  now: Date = new Date()
): boolean {
  const slotEnd = addMinutes(slotStart, duration)

  // Passé ?
  if (slotStart <= now) return false

  // Conflit avec booking confirmé ?
  const bookingConflict = bookings
    .filter((b) => b.status === "CONFIRMED")
    .some((b) => slotStart < b.endTime && slotEnd > b.startTime)

  // Conflit avec créneau bloqué ?
  const blockConflict = blockedSlots.some(
    (b) => slotStart < b.endTime && slotEnd > b.startTime
  )

  return !bookingConflict && !blockConflict
}

// ─── Tests RED→GREEN ─────────────────────────────────────────────────────────

const FUTURE = new Date("2030-01-01T09:00:00Z")
const PAST_REF = new Date("2030-01-01T08:00:00Z") // "maintenant" simulé
const DURATION = 30

describe("isSlotAvailable", () => {
  it("retourne true pour un créneau libre sans conflits", () => {
    expect(isSlotAvailable(FUTURE, DURATION, [], [], PAST_REF)).toBe(true)
  })

  it("retourne false pour un créneau dans le passé", () => {
    const past = new Date("2020-01-01T09:00:00Z")
    expect(isSlotAvailable(past, DURATION, [], [], new Date())).toBe(false)
  })

  it("retourne false si un booking confirmé chevauche exactement", () => {
    const bookings: Booking[] = [{
      startTime: FUTURE,
      endTime: addMinutes(FUTURE, DURATION),
      status: "CONFIRMED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(false)
  })

  it("retourne false si un booking confirmé chevauche partiellement (début)", () => {
    const bookings: Booking[] = [{
      startTime: addMinutes(FUTURE, -15),
      endTime: addMinutes(FUTURE, 15),
      status: "CONFIRMED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(false)
  })

  it("retourne false si un booking confirmé chevauche partiellement (fin)", () => {
    const bookings: Booking[] = [{
      startTime: addMinutes(FUTURE, 15),
      endTime: addMinutes(FUTURE, 45),
      status: "CONFIRMED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(false)
  })

  it("ignore les bookings annulés", () => {
    const bookings: Booking[] = [{
      startTime: FUTURE,
      endTime: addMinutes(FUTURE, DURATION),
      status: "CANCELLED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(true)
  })

  it("retourne false si un créneau bloqué chevauche", () => {
    const blocked: BlockedSlot[] = [{
      startTime: addMinutes(FUTURE, 10),
      endTime: addMinutes(FUTURE, 40),
    }]
    expect(isSlotAvailable(FUTURE, DURATION, [], blocked, PAST_REF)).toBe(false)
  })

  it("retourne true si booking adjacent (juste avant, sans chevauchement)", () => {
    const bookings: Booking[] = [{
      startTime: addMinutes(FUTURE, -DURATION),
      endTime: FUTURE, // finit exactement quand le slot commence
      status: "CONFIRMED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(true)
  })

  it("retourne true si booking adjacent (juste après, sans chevauchement)", () => {
    const bookings: Booking[] = [{
      startTime: addMinutes(FUTURE, DURATION), // commence quand le slot finit
      endTime: addMinutes(FUTURE, DURATION * 2),
      status: "CONFIRMED",
    }]
    expect(isSlotAvailable(FUTURE, DURATION, bookings, [], PAST_REF)).toBe(true)
  })
})
