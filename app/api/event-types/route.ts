import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(5).max(480),
  color: z.string().default("#0069ff"),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(eventTypes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)
  const slug = generateSlug(data.title)

  const eventType = await prisma.eventType.create({
    data: { ...data, slug, userId: session.user.id },
  })
  return NextResponse.json(eventType, { status: 201 })
}
