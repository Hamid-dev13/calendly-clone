import Link from "next/link"
import { Calendar, Clock, Users, Zap, ArrowRight, Check, Shield, Globe } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

function CalendarIllustration() {
  const days = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 420 }}>
      {/* Card shadow */}
      <rect x="50" y="30" width="320" height="268" rx="18" fill="rgba(37,99,235,0.06)" />
      {/* Main card */}
      <rect x="44" y="24" width="320" height="268" rx="18" fill="white"
        style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.12))" }} />
      {/* Header */}
      <rect x="44" y="24" width="320" height="68" rx="18" fill="#2563eb" />
      <rect x="44" y="72" width="320" height="20" fill="#2563eb" />
      {/* Month nav */}
      <circle cx="72" cy="58" r="12" fill="rgba(255,255,255,0.15)" />
      <text x="72" y="63" textAnchor="middle" fill="white" fontSize="14">‹</text>
      <circle cx="336" cy="58" r="12" fill="rgba(255,255,255,0.15)" />
      <text x="336" y="63" textAnchor="middle" fill="white" fontSize="14">›</text>
      <text x="204" y="63" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">Septembre 2026</text>
      {/* Day headers */}
      {days.map((d, i) => (
        <text key={d} x={76 + i * 42} y="108" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="500">{d}</text>
      ))}
      {/* Date cells */}
      {Array.from({ length: 30 }, (_, i) => {
        const col = i % 7
        const row = Math.floor(i / 7)
        const cx = 76 + col * 42
        const cy = 136 + row * 38
        const isSelected = i === 14
        const isToday = i === 10
        const isBooked = [3, 7, 18, 22].includes(i)
        const isWeekend = col >= 5
        return (
          <g key={i}>
            {isSelected && (
              <>
                <circle cx={cx} cy={cy} r="16" fill="#2563eb" />
                <circle cx={cx} cy={cy} r="20" fill="rgba(37,99,235,0.12)" />
              </>
            )}
            {isToday && !isSelected && <circle cx={cx} cy={cy} r="16" fill="#eff6ff" />}
            {isBooked && !isSelected && (
              <circle cx={cx} cy={cy + 10} r="2" fill="#2563eb" />
            )}
            <text x={cx} y={cy + 5} textAnchor="middle"
              fill={isSelected ? "white" : isToday ? "#2563eb" : isWeekend ? "#9ca3af" : "#374151"}
              fontSize="13" fontWeight={isSelected || isToday ? "600" : "400"}>
              {i + 1}
            </text>
          </g>
        )
      })}
      {/* Time slot pill */}
      <rect x="156" y="290" width="96" height="26" rx="13" fill="#2563eb" />
      <text x="204" y="307" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">14:00 – 14:30</text>
    </svg>
  )
}

function BookingCard() {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
      overflow: "hidden",
      maxWidth: 340,
    }}>
      {/* Header blue */}
      <div style={{ background: "#2563eb", padding: "24px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "white",
          }}>H</div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>Hamid Bennacef</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>@bennacefhamid993</div>
          </div>
        </div>
        <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Appel découverte</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} color="rgba(255,255,255,0.8)" />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>30 minutes · Visio</span>
        </div>
      </div>
      {/* Time slots */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
          Mer. 15 septembre
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["09:00", "09:30", "10:00", "10:30", "11:00", "14:00"].map((t, i) => (
            <div key={t} style={{
              padding: "10px 0",
              textAlign: "center",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: i === 3 ? "#2563eb" : "#f8f9fa",
              color: i === 3 ? "white" : "#374151",
              border: i === 3 ? "none" : "1px solid #e5e7eb",
            }}>{t}</div>
          ))}
        </div>
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "#f0fdf4",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Check size={16} color="#16a34a" />
          <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>Réservation confirmée</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── Nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold" style={{ color: "var(--text)" }}>CalenClone</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-[10px] link-underline transition-colors"
            style={{ color: "var(--text-secondary)" }}>
            Connexion
          </Link>
          <Link href="/register"
            className="px-4 py-2 text-sm font-semibold rounded-[10px] text-white btn-primary"
            style={{ background: "var(--accent)" }}>
            Commencer gratuitement
          </Link>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ minHeight: "88vh", paddingTop: 80, paddingBottom: 80 }}>
        {/* Background blobs */}
        <div className="blob blob-1" style={{ top: -100, left: -200, zIndex: 0 }} />
        <div className="blob blob-2" style={{ bottom: -80, right: -150, zIndex: 0 }} />
        {/* Grid dots background */}
        <div className="grid-dots" style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Badge */}
          <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: "var(--accent-subtle)", color: "var(--accent-text)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
              <span>Planification de RDV · 100% gratuit</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up mb-6 leading-tight"
            style={{
              fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              animationDelay: "0.1s",
            }}>
            Planifiez vos RDV{" "}
            <span style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              sans friction
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up mb-10 max-w-2xl mx-auto text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)", animationDelay: "0.18s" }}>
            Partagez votre lien. Laissez vos contacts choisir un créneau. Fini les allers-retours par email — réservation en 30 secondes.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up flex items-center gap-3 flex-wrap justify-center mb-10"
            style={{ animationDelay: "0.24s" }}>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] text-sm font-semibold text-white btn-primary"
              style={{ background: "var(--accent)", fontSize: 15 }}>
              Créer ma page de RDV
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] text-sm font-semibold btn-secondary"
              style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", fontSize: 15 }}>
              Se connecter
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up flex items-center gap-6 justify-center flex-wrap text-sm"
            style={{ color: "var(--text-muted)", animationDelay: "0.3s" }}>
            {["Sans carte bancaire", "Gratuit pour toujours", "Setup en 2 minutes"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                {item}
              </div>
            ))}
          </div>

          {/* Product preview */}
          <div className="animate-fade-up grid md:grid-cols-2 gap-8 mt-20 items-center"
            style={{ animationDelay: "0.4s" }}>
            {/* Calendar SVG */}
            <div className="animate-float flex justify-center" style={{ animationDelay: "0s" }}>
              <CalendarIllustration />
            </div>
            {/* Booking card */}
            <div className="flex justify-center animate-float" style={{ animationDelay: "0.8s" }}>
              <BookingCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Un outil conçu pour les professionnels qui veulent récupérer leur temps.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Disponibilités intelligentes",
                desc: "Définissez vos horaires une seule fois. CalenClone calcule automatiquement les créneaux libres en évitant les doublons.",
                color: "#2563eb",
                delay: 0,
              },
              {
                icon: Globe,
                title: "Page de booking publique",
                desc: "Partagez votre lien personnalisé. Vos contacts réservent directement, sans compte, en moins de 30 secondes.",
                color: "#7c3aed",
                delay: 0.1,
              },
              {
                icon: Zap,
                title: "Notifications automatiques",
                desc: "Confirmations, rappels 24h avant, annulations — tout est géré automatiquement par email.",
                color: "#0ea5e9",
                delay: 0.2,
              },
              {
                icon: Shield,
                title: "Créneaux bloqués",
                desc: "Bloquez vos congés, formations ou réunions internes. Ces créneaux disparaissent automatiquement de votre calendrier.",
                color: "#16a34a",
                delay: 0,
              },
              {
                icon: Users,
                title: "Plusieurs types d'événements",
                desc: "Créez autant de types de RDV que vous voulez : appels, démos, consultations, chacun avec sa durée et son lien.",
                color: "#d97706",
                delay: 0.1,
              },
              {
                icon: Calendar,
                title: "Sync Google Calendar",
                desc: "Connectez votre Google Calendar. Chaque réservation y apparaît automatiquement, annulation comprise.",
                color: "#dc2626",
                delay: 0.2,
              },
            ].map(({ icon: Icon, title, desc, color, delay }, i) => (
              <AnimateOnScroll key={title} delay={delay}>
                <div className="card-hover p-6 rounded-[16px] h-full"
                  style={{ background: "white", boxShadow: "var(--shadow)" }}>
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5"
                    style={{ background: color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-semibold mb-2 text-base" style={{ color: "var(--text)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold text-center mb-16" style={{ letterSpacing: "-0.02em" }}>
              Opérationnel en 3 étapes
            </h2>
          </AnimateOnScroll>

          <div className="relative">
            {/* Connecting line */}
            <div style={{
              position: "absolute", left: 22, top: 44, bottom: 44,
              width: 2,
              background: "linear-gradient(to bottom, #2563eb, #7c3aed, #0ea5e9)",
              opacity: 0.2,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {[
                {
                  n: "01",
                  title: "Créez votre compte",
                  desc: "Inscription en 30 secondes. Votre page de booking est instantanément disponible sur /votrenom.",
                  color: "#2563eb",
                  delay: 0,
                },
                {
                  n: "02",
                  title: "Configurez vos disponibilités",
                  desc: "Définissez vos horaires par jour de la semaine. Ajoutez autant de types de RDV que vous voulez.",
                  color: "#7c3aed",
                  delay: 0.1,
                },
                {
                  n: "03",
                  title: "Partagez votre lien",
                  desc: "Envoyez votre lien. Vos contacts choisissent un créneau, remplissent leur nom/email — confirmation immédiate.",
                  color: "#0ea5e9",
                  delay: 0.2,
                },
              ].map(({ n, title, desc, color, delay }) => (
                <AnimateOnScroll key={n} delay={delay}>
                  <div className="flex items-start gap-6">
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: color + "15",
                      border: `2px solid ${color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{n}</span>
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <h3 className="font-semibold mb-2 text-lg" style={{ color: "var(--text)" }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────── */}
      <section className="px-6 py-20 relative overflow-hidden"
        style={{ background: "#0f0f10" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "white", letterSpacing: "-0.02em" }}>
              Prêt à reprendre le contrôle de votre agenda ?
            </h2>
            <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
              Rejoignez des milliers de professionnels qui ont éliminé les allers-retours email.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[12px] text-base font-semibold text-white btn-primary"
              style={{ background: "var(--accent)" }}>
              Créer mon espace RDV gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="px-6 py-8 text-center text-sm"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Calendar className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>CalenClone</span>
        </div>
        <p>© {new Date().getFullYear()} CalenClone · Scheduling made simple</p>
      </footer>
    </div>
  )
}
