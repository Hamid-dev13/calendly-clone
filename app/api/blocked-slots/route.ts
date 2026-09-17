import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  startTime: z.string().datetime(),
  endTime:   z.string().datetime(),
  reason:    z.string().optional(),
}).refine(d => new Date(d.endTime) > new Date(d.startTime), {
  message: "endTime doit être après startTime",
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const slots = await prisma.blockedSlot.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "asc" },
  })
  return NextResponse.json(slots)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const body = await req.json()
    const { startTime, endTime, reason } = schema.parse(body)

    const slot = await prisma.blockedSlot.create({
      data: {
        userId:    session.user.id,
        startTime: new Date(startTime),
        endTime:   new Date(endTime),
        reason,
      },
    })
    return NextResponse.json(slot, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await req.json()
  await prisma.blockedSlot.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
