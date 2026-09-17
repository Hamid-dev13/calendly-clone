import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addMinutes, format, startOfDay, endOfDay, isBefore, isAfter } from "date-fns"
import { generateTimeSlots } from "@/lib/utils"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await params
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get("date")

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  const eventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug, isActive: true },
  })
  if (!eventType) return NextResponse.json({ error: "Type d'événement introuvable" }, { status: 404 })

  if (!dateStr) return NextResponse.json({ eventType, user: { name: user.name, username: user.username, image: user.image, timezone: user.timezone } })

  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()

  const availability = await prisma.availability.findFirst({
    where: { userId: user.id, dayOfWeek, isActive: true },
  })
  if (!availability) return NextResponse.json({ slots: [] })

  const slots = generateTimeSlots(availability.startTime, availability.endTime, eventType.duration)

  // Exclure les créneaux déjà réservés
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const existingBookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: "CONFIRMED",
      startTime: { gte: dayStart, lte: dayEnd },
    },
  })

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      userId: user.id,
      startTime: { gte: dayStart, lte: dayEnd },
    },
  })

  const now = new Date()
  const availableSlots = slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number)
    const slotStart = new Date(date)
    slotStart.setHours(h, m, 0, 0)
    const slotEnd = addMinutes(slotStart, eventType.duration)

    if (isBefore(slotStart, now)) return false

    const overlapsBooking = existingBookings.some(
      (b) => isBefore(slotStart, b.endTime) && isAfter(slotEnd, b.startTime)
    )
    const overlapsBlock = blockedSlots.some(
      (b) => isBefore(slotStart, b.endTime) && isAfter(slotEnd, b.startTime)
    )

    return !overlapsBooking && !overlapsBlock
  })

  return NextResponse.json({ slots: availableSlots, eventType })
}
