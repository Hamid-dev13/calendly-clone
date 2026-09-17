"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600 mb-8 justify-center">
          <Calendar className="w-6 h-6" />
          CalenClone
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nom complet", key: "name", type: "text", placeholder: "Jean Dupont" },
            { label: "Email", key: "email", type: "email", placeholder: "vous@exemple.com" },
            { label: "Mot de passe", key: "password", type: "password", placeholder: "8 caractères minimum" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
                required
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
