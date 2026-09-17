# CalenClone

> ⚠️ **Ce projet est un test de processus agentique complet.**
> Tout a été conçu, architecturé, codé, testé et déployé par un agent IA — **Hermes Agent** — sans intervention humaine sur le code. Ce dépôt sert à valider la capacité d'un agent à piloter un projet SaaS de bout en bout en mode **Agentic Engineering**.

---

## 🤖 Contexte — Test Agentic Engineering

**Agent :** Hermes Agent (Claude Sonnet 4.6)
**Méthode :** Agentic Engineering — user stories → agents parallèles → TDD → deploy
**Date :** Septembre 2026
**Pilote humain :** Hamid Bennacef (`@Hamid-dev13`) — direction produit uniquement

Ce projet reproduit les fonctionnalités core de **Calendly** from scratch. Il a été entièrement piloté par agent selon le workflow suivant :

```
PRD → User Stories → Graphe de dépendances
  → Agents parallèles (TDD : RED → GREEN → REFACTOR)
  → Smoke tests automatiques
  → Push GitHub + fermeture des issues
  → Deploy Tailscale
```

Aucune ligne de code n'a été écrite manuellement. Toutes les décisions techniques
(stack, architecture, design system, pipeline de tests) ont été prises par l'agent.

---

## Stack

- **Next.js 16** App Router + TypeScript
- **Prisma 5** + SQLite (dev) / PostgreSQL (prod)
- **NextAuth.js v4** — email + OAuth Google
- **Tailwind CSS v3**
- **Vitest** — 64 tests unitaires
- **Resend** — emails transactionnels
- **Google Calendar API** — sync automatique

## Features

- ✅ Inscription / Connexion (email + OAuth Google)
- ✅ Page profil public `/[username]`
- ✅ Types d'événements (CRUD, slug, couleur, toggle)
- ✅ Disponibilités hebdomadaires configurables
- ✅ Page de booking publique `/[username]/[slug]`
- ✅ Calcul automatique des créneaux libres
- ✅ Gestion des réservations (voir, annuler)
- ✅ Créneaux bloqués (congés, réunions internes)
- ✅ Emails automatiques (confirmation, rappel 24h, annulation)
- ✅ Sync Google Calendar
- ✅ Pipeline CI/CD GitHub Actions
- ✅ Design system complet (Linear × Cal.com)
- ✅ Animations CSS performantes (GPU only)
- ✅ Responsive mobile/tablet/desktop
- ✅ Smoke tests automatiques post-deploy

## Pipeline de tests

```bash
npm run test           # 64 tests unitaires (Vitest)
npm run test:unit      # logique pure (utils, booking, email, gcal)
npm run test:functional # API curl end-to-end
npm run test:smoke     # visite chaque page, détecte crash runtime
npm run test:coverage  # rapport de couverture
```

## Démarrage rapide

```bash
git clone git@github.com:Hamid-dev13/calendly-clone.git
cd calendly-clone
cp .env.example .env   # remplir les variables
docker compose up db -d
npm install
npx prisma migrate dev --name init
npm run dev
```

## Variables d'environnement

```env
DATABASE_URL="postgresql://calendly:calendly_secret@localhost:5432/calendly_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""          # openssl rand -base64 32
GOOGLE_CLIENT_ID=""         # Google OAuth
GOOGLE_CLIENT_SECRET=""
RESEND_API_KEY=""           # emails (optionnel)
```

## Structure

```
app/
  [username]/          → Profil public + booking
  dashboard/           → Espace hôte
  api/                 → Routes API
components/
  ui/                  → Button, Card, Badge, Input
  dashboard-layout.tsx → Sidebar dark + responsive mobile
  animate-on-scroll.tsx
lib/
  auth.ts / prisma.ts / email.ts / google-calendar.ts / utils.ts
tests/
  unit/ integration/ functional/ smoke/
```

---

*Projet de démonstration — non destiné à la production en l'état.*
*© 2026 Hamid Bennacef · Entièrement piloté par Hermes Agent*
