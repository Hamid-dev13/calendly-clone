import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendConfirmationEmail } from "@/lib/email"
import { addMinutes } from "date-fns"
import { z } from "zod"

const schema = z.object({
  username: z.string(),
  slug: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  notes: z.string().optional(),
  date: z.string(),
  time: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, slug, guestName, guestEmail, notes, date, time } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug, isActive: true },
    })
    if (!eventType) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 })

    const [h, m] = time.split(":").map(Number)
    const startTime = new Date(date)
    startTime.setHours(h, m, 0, 0)
    const endTime = addMinutes(startTime, eventType.duration)

    // Vérifier qu'il n'y a pas de conflit
    const conflict = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    })
    if (conflict) return NextResponse.json({ error: "Créneau déjà pris" }, { status: 409 })

    const booking = await prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId: user.id,
        guestName,
        guestEmail,
        notes,
        startTime,
        endTime,
        status: "CONFIRMED",
      },
    })

    // Envoyer l'email de confirmation (silencieux si RESEND_API_KEY absent)
    sendConfirmationEmail({
      guestName:  guestName,
      guestEmail: guestEmail,
      hostName:   user.name ?? "Hôte",
      hostEmail:  user.email ?? undefined,
      eventTitle: eventType.title,
      startTime,
      endTime,
      duration:   eventType.duration,
    }).catch(() => {}) // non-bloquant

    return NextResponse.json({ booking, eventType, host: { name: user.name, email: user.email } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
