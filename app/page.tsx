import Link from "next/link"
import { Calendar, Clock, Users, Zap, ArrowRight, Check } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold" style={{ color: "var(--text)" }}>
            CalenClone
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-[10px] transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-[10px] text-white transition-colors"
            style={{ background: "var(--accent)" }}
          >
            Get started free
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "var(--accent-subtle)", color: "var(--accent-text)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          Free scheduling for everyone
        </div>

        <h1
          className="mb-6 leading-tight tracking-tight"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          Schedule meetings
          <br />
          <span style={{ color: "var(--accent)" }}>without the back-and-forth</span>
        </h1>

        <p
          className="mb-10 max-w-2xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Share your link. Let people pick a time that works. No more endless email threads — booking done in 30 seconds.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--accent)" }}
          >
            Create your booking page
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-semibold transition-colors"
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            Sign in
          </Link>
        </div>

        <div className="flex items-center gap-6 mt-10 text-sm" style={{ color: "var(--text-muted)" }}>
          {["No credit card required", "Free forever", "Set up in 2 minutes"].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <h2
          className="text-2xl font-bold text-center mb-12"
          style={{ color: "var(--text)" }}
        >
          Everything you need to schedule smarter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Clock,
              title: "Smart availability",
              desc: "Set your working hours once. CalenClone handles the rest — no double-bookings, ever.",
            },
            {
              icon: Users,
              title: "Public booking page",
              desc: "Share your personal link. Guests book directly into your calendar in seconds.",
            },
            {
              icon: Zap,
              title: "Auto notifications",
              desc: "Confirmations and reminders are sent automatically to both you and your guest.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-[14px]"
              style={{
                background: "var(--bg)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: "var(--accent-subtle)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="font-semibold mb-2 text-base" style={{ color: "var(--text)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-20"
        style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: "var(--text)" }}>
            How it works
          </h2>
          <div className="space-y-8">
            {[
              { n: "1", title: "Create your account", desc: "Sign up and get your personal booking page instantly." },
              { n: "2", title: "Set your availability", desc: "Define your working hours. CalenClone blocks off the rest." },
              { n: "3", title: "Share your link", desc: "Send your booking link. Guests pick a slot and it's confirmed immediately." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent-text)" }}
                >
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>{title}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Calendar className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>CalenClone</span>
        </div>
        <p>© {new Date().getFullYear()} CalenClone. Built for demo purposes.</p>
      </footer>
    </div>
  )
}
