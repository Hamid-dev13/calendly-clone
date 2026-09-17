"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Clock,
  Users,
  Settings,
  BanIcon,
  LogOut,
} from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: Calendar, label: "Dashboard" },
  { href: "/dashboard/event-types", icon: Clock, label: "Event Types" },
  { href: "/dashboard/bookings", icon: Users, label: "Bookings" },
  { href: "/dashboard/availability", icon: Settings, label: "Availability" },
  { href: "/dashboard/blocked-slots", icon: BanIcon, label: "Blocked Slots" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name ?? "User"
  const userInitial = userName[0]?.toUpperCase() ?? "U"
  // username is the slug from the user object — may be exposed via session token
  const userSlug = (session?.user as { username?: string })?.username ?? ""

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-subtle)" }}>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ color: "var(--sidebar-text)" }}>
            CalenClone
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "#ffffff" : "var(--sidebar-muted)",
                  background: isActive ? "var(--sidebar-active)" : "transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)"
                    ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLElement).style.background = "transparent"
                    ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-muted)"
                  }
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ background: "var(--accent)", color: "#ffffff" }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--sidebar-text)" }}>
                {userName}
              </p>
              {userSlug && (
                <p className="text-xs truncate" style={{ color: "var(--sidebar-muted)" }}>
                  /{userSlug}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm transition-colors"
            style={{ color: "var(--sidebar-muted)" }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)"
              ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
              ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-muted)"
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-60 flex-1 min-h-screen overflow-y-auto" style={{ background: "var(--bg)" }}>
        {children}
      </main>
    </div>
  )
}
