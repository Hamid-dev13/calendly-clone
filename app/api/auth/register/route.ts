import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + 
                     Math.floor(Math.random() * 999)

    const user = await prisma.user.create({
      data: { name, email, password: hashed, username },
    })

    // Créer les disponibilités par défaut (lun-ven 9h-17h)
    const defaultDays = [1, 2, 3, 4, 5]
    await prisma.availability.createMany({
      data: defaultDays.map((day) => ({
        userId: user.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
      })),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
