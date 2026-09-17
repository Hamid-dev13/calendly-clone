"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
    } else {
      router.push("/login?registered=1")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-subtle)" }}
    >
      <div
        className="w-full max-w-sm rounded-[14px] p-8"
        style={{
          background: "var(--bg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
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

        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ color: "var(--text)" }}
        >
          Créer un compte
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--text-secondary)" }}>
          Planifiez vos RDV en quelques minutes, gratuitement
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jean Dupont"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="vous@exemple.com"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Au moins 8 caractères"
            required
          />

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] text-sm"
              style={{ background: "var(--danger-subtle)", color: "var(--danger-text)" }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {loading ? "Création du compte…" : "Créer un compte"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
            Connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
