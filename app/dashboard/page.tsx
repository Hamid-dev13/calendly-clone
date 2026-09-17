import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, Clock, Users, Plus, Settings, LogOut } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const [eventTypes, upcomingBookings] = await Promise.all([
    prisma.eventType.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({
      where: { userId: session.user.id, status: "CONFIRMED", startTime: { gte: new Date() } },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ])

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Calendar className="w-5 h-5" />
            CalenClone
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard", icon: Calendar, label: "Dashboard" },
            { href: "/dashboard/event-types", icon: Clock, label: "Types d'événements" },
            { href: "/dashboard/bookings", icon: Users, label: "Réservations" },
            { href: "/dashboard/availability", icon: Settings, label: "Disponibilités" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium">
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {session.user.name?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">/{user?.username}</p>
            </div>
          </div>
          <Link href="/api/auth/signout"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="ml-60 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {session.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 mt-1">
            Votre lien de booking :{" "}
            <span className="text-blue-600 font-medium">/{user?.username}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500">Types d'événements</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{eventTypes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500">RDV à venir</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingBookings.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500">Actifs</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{eventTypes.filter(e => e.isActive).length}</p>
          </div>
        </div>

        {/* Event types */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-gray-900">Types d'événements</h2>
            <Link href="/dashboard/event-types" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Nouveau
            </Link>
          </div>
          {eventTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucun type d'événement. <Link href="/dashboard/event-types" className="text-blue-600">Créez-en un</Link></p>
            </div>
          ) : (
            <div className="divide-y">
              {eventTypes.map(et => (
                <div key={et.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} />
                    <div>
                      <p className="font-medium text-gray-900">{et.title}</p>
                      <p className="text-sm text-gray-400">{et.duration} min</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${et.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {et.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming bookings */}
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-gray-900">Prochains RDV</h2>
            <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucun RDV à venir</p>
            </div>
          ) : (
            <div className="divide-y">
              {upcomingBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{b.guestName}</p>
                    <p className="text-sm text-gray-400">{b.eventType.title} · {b.guestEmail}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(b.startTime).toLocaleDateString("fr-FR")}</p>
                    <p>{new Date(b.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
