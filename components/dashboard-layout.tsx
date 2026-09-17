"use client"
import { useState } from "react"
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
  Menu,
  X,
} from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: Calendar, label: "Tableau de bord" },
  { href: "/dashboard/event-types", icon: Clock, label: "Types d'événements" },
  { href: "/dashboard/bookings", icon: Users, label: "Réservations" },
  { href: "/dashboard/availability", icon: Settings, label: "Disponibilités" },
  { href: "/dashboard/blocked-slots", icon: BanIcon, label: "Créneaux bloqués" },
]

// ── Extrait hors du render pour éviter "cannot create components during render"
type SidebarProps = {
  pathname: string
  userName: string
  userInitial: string
  userSlug: string
  onLinkClick: () => void
}

function SidebarContent({ pathname, userName, userInitial, userSlug, onLinkClick }: SidebarProps) {
  return (
    <>
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
              onClick={onLinkClick}
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
          Déconnexion
        </button>
      </div>
    </>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userName = session?.user?.name ?? "Utilisateur"
  const userInitial = userName[0]?.toUpperCase() ?? "U"
  const userSlug = (session?.user as { username?: string })?.username ?? ""

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-subtle)" }}>
      {/* Desktop Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-60 flex flex-col z-40 hidden md:flex"
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <SidebarContent
          pathname={pathname}
          userName={userName}
          userInitial={userInitial}
          userSlug={userSlug}
          onLinkClick={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar (slide in) */}
      <aside
        className="fixed top-0 left-0 h-full w-60 flex flex-col z-50 md:hidden transition-transform duration-300"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-[6px]"
          style={{ color: "var(--sidebar-muted)" }}
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent
          pathname={pathname}
          userName={userName}
          userInitial={userInitial}
          userSlug={userSlug}
          onLinkClick={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Mobile top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 gap-3 z-30 md:hidden"
        style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-[8px]"
          style={{ color: "var(--sidebar-muted)" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--sidebar-text)" }}>CalenClone</span>
        </div>
      </div>

      {/* Content */}
      <main
        className="flex-1 min-h-screen overflow-y-auto md:ml-60 pt-14 md:pt-0"
        style={{ background: "var(--bg)" }}
      >
        {children}
      </main>
    </div>
  )
}
