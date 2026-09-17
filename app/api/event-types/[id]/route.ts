import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(5).max(480).optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)

  const eventType = await prisma.eventType.updateMany({
    where: { id: params.id, userId: session.user.id },
    data,
  })
  return NextResponse.json(eventType)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  await prisma.eventType.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
}
