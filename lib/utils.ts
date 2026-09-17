import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function formatTime(time: string, timezone: string = "Europe/Paris"): string {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  })
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)

  let current = startH * 60 + startM
  const end = endH * 60 + endM

  while (current + duration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, "0")
    const m = (current % 60).toString().padStart(2, "0")
    slots.push(`${h}:${m}`)
    current += duration
  }

  return slots
}
