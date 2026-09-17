import { Resend } from "resend"

const FROM = "CalenClone <noreply@calenclone.dev>"
const getResend = () => new Resend(process.env.RESEND_API_KEY)

export type BookingEmailData = {
  guestName:  string
  guestEmail: string
  hostName:   string
  hostEmail?: string
  eventTitle: string
  startTime:  Date
  endTime:    Date
  duration:   number
}

// ─── Builders de texte (pures, testables) ───────────────────────────────────

export function buildConfirmationText(data: BookingEmailData): string {
  const date  = data.startTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const start = data.startTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
  const end   = data.endTime.toLocaleTimeString("fr-FR",   { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
  return `Bonjour ${data.guestName},\n\nVotre rendez-vous "${data.eventTitle}" avec ${data.hostName} est confirmé.\n\nDate : ${date}\nHeure : ${start} – ${end}\nDurée : ${data.duration} min`
}

export function buildCancellationText(data: BookingEmailData): string {
  return `Bonjour ${data.guestName},\n\nVotre rendez-vous "${data.eventTitle}" avec ${data.hostName} a été annulé.`
}

export function buildReminderText(data: BookingEmailData): string {
  const start = data.startTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
  return `Rappel : votre rendez-vous "${data.eventTitle}" avec ${data.hostName} est demain à ${start}.`
}

// ─── Envoi Resend ────────────────────────────────────────────────────────────

export async function sendConfirmationEmail(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) return

  const resend = getResend()
  await resend.emails.send({
    from:    FROM,
    to:      data.guestEmail,
    subject: `✅ RDV confirmé — ${data.eventTitle}`,
    text:    buildConfirmationText(data),
    html:    confirmationHtml(data),
  })

  // Notifier l'hôte
  if (data.hostEmail) {
    await resend.emails.send({
      from:    FROM,
      to:      data.hostEmail,
      subject: `📅 Nouveau RDV — ${data.guestName}`,
      text:    `${data.guestName} (${data.guestEmail}) vient de réserver "${data.eventTitle}".\n\n${buildConfirmationText(data)}`,
    })
  }
}

export async function sendCancellationEmail(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) return
  const resend = getResend()
  await resend.emails.send({
    from:    FROM,
    to:      data.guestEmail,
    subject: `❌ RDV annulé — ${data.eventTitle}`,
    text:    buildCancellationText(data),
  })
}

export async function sendReminderEmail(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) return
  const resend = getResend()
  await resend.emails.send({
    from:    FROM,
    to:      data.guestEmail,
    subject: `🔔 Rappel — ${data.eventTitle} demain`,
    text:    buildReminderText(data),
  })
}

// ─── Template HTML ───────────────────────────────────────────────────────────

function confirmationHtml(data: BookingEmailData): string {
  const date  = data.startTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const start = data.startTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
  const end   = data.endTime.toLocaleTimeString("fr-FR",   { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111">
  <div style="background:#0069ff;color:#fff;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="margin:0;font-size:20px">✅ Rendez-vous confirmé</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 12px 12px">
    <p>Bonjour <strong>${data.guestName}</strong>,</p>
    <p>Votre rendez-vous avec <strong>${data.hostName}</strong> est confirmé.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px">ÉVÉNEMENT</p>
      <p style="margin:0 0 16px;font-weight:600;font-size:16px">${data.eventTitle}</p>
      <p style="margin:0 0 4px;font-size:14px">📅 ${date}</p>
      <p style="margin:0 0 4px;font-size:14px">🕐 ${start} – ${end}</p>
      <p style="margin:0;font-size:14px">⏱ ${data.duration} min</p>
    </div>
    <p style="color:#6b7280;font-size:13px">Un rappel vous sera envoyé 24h avant.</p>
  </div>
</body>
</html>`
}
