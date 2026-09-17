import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") ?? "upcoming"

  const now = new Date()
  const where: any = { userId: session.user.id }

  if (filter === "upcoming") where.startTime = { gte: now }
  else if (filter === "past") where.startTime = { lt: now }
  else if (filter === "cancelled") where.status = "CANCELLED"

  const bookings = await prisma.booking.findMany({
    where,
    include: { eventType: true },
    orderBy: { startTime: filter === "past" ? "desc" : "asc" },
  })
  return NextResponse.json(bookings)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await req.json()
  await prisma.booking.updateMany({
    where: { id, userId: session.user.id },
    data: { status: "CANCELLED" },
  })
  return NextResponse.json({ success: true })
}
