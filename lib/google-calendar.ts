import { google, calendar_v3 } from "googleapis"

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarEventInput = {
  title:        string
  description?: string
  guestName:    string
  guestEmail:   string
  startTime:    Date
  endTime:      Date
  timezone:     string
}

// ─── Builder pur (testable sans API) ─────────────────────────────────────────

export function buildCalendarEvent(input: CalendarEventInput): calendar_v3.Schema$Event {
  return {
    summary:     input.title,
    description: input.description
      ? `${input.description}\n\nInvité : ${input.guestName} (${input.guestEmail})`
      : `Invité : ${input.guestName} (${input.guestEmail})`,
    start: { dateTime: input.startTime.toISOString(), timeZone: input.timezone },
    end:   { dateTime: input.endTime.toISOString(),   timeZone: input.timezone },
    attendees: [{ email: input.guestEmail, displayName: input.guestName }],
    reminders: {
      useDefault: false,
      overrides:  [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  }
}

// ─── Fabrique de client Google Calendar ──────────────────────────────────────

function makeCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: "v3", auth })
}

// ─── Création (injectable pour les tests) ────────────────────────────────────

export async function createCalendarEvent({
  accessToken,
  event,
  _client,
}: {
  accessToken:  string | null | undefined
  event:        CalendarEventInput
  _client?:     Pick<calendar_v3.Calendar, "events"> // injectable pour les tests
}): Promise<string | null> {
  if (!accessToken) return null
  try {
    const cal    = _client ?? makeCalendarClient(accessToken)
    const res    = await cal.events.insert({ calendarId: "primary", requestBody: buildCalendarEvent(event) })
    return res.data.id ?? null
  } catch {
    return null
  }
}

// ─── Suppression (injectable pour les tests) ─────────────────────────────────

export async function deleteCalendarEvent({
  accessToken,
  googleEventId,
  _client,
}: {
  accessToken:   string | null | undefined
  googleEventId: string | null | undefined
  _client?:      Pick<calendar_v3.Calendar, "events">
}): Promise<void> {
  if (!accessToken || !googleEventId) return
  try {
    const cal = _client ?? makeCalendarClient(accessToken)
    await cal.events.delete({ calendarId: "primary", eventId: googleEventId })
  } catch {
    // Non-bloquant
  }
}

// ─── URL d'autorisation OAuth ─────────────────────────────────────────────────

export function getGoogleAuthUrl(userId: string): string {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`
  )
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt:      "consent",
    scope:       ["https://www.googleapis.com/auth/calendar.events"],
    state:       userId,
  })
}
