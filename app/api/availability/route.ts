import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  })),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  })
  return NextResponse.json(availability)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const { availability } = schema.parse(body)

  await prisma.availability.deleteMany({ where: { userId: session.user.id } })
  await prisma.availability.createMany({
    data: availability.map((a) => ({ ...a, userId: session.user.id! })),
  })

  return NextResponse.json({ success: true })
}
