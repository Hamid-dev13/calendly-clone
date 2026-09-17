import Link from "next/link"
import { Calendar, Clock, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex-1">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Calendar className="w-6 h-6" />
          CalenClone
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Connexion</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Commencer gratuitement</Link>
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Planifiez vos réunions<br /><span className="text-blue-600">sans friction</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Partagez votre lien, laissez vos contacts choisir un créneau. Plus d'emails inutiles.
        </p>
        <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 inline-block">
          Créer mon espace RDV →
        </Link>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Clock, title: "Créneaux intelligents", desc: "Configurez vos disponibilités une seule fois." },
          { icon: Users, title: "Booking publique", desc: "Partagez votre lien. Réservation en 30 secondes." },
          { icon: Zap, title: "Notifications auto", desc: "Confirmations et rappels gérés automatiquement." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
