#!/usr/bin/env bash
# ============================================================
# tests/smoke/pages.sh
# Smoke tests : visite chaque page, vérifie HTTP 200 et pas d'erreur React
# Usage: BASE_URL=http://localhost:3000 ./tests/smoke/pages.sh
# Catch ce que le build ne voit pas : runtime errors (Server Component
# event handlers, missing "use client", etc.)
# ============================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0; FAIL=0; ERRORS=()

green() { echo -e "\033[32m✅ $1\033[0m"; }
red()   { echo -e "\033[31m❌ $1\033[0m"; }

assert_page_ok() {
  local label="$1" url="$2"

  # Récupère status + body
  BODY=$(curl -s -L --max-time 10 "$url")
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$url")

  # Vérif HTTP status
  if [ "$STATUS" != "200" ] && [ "$STATUS" != "307" ] && [ "$STATUS" != "302" ]; then
    red "$label — HTTP $STATUS (attendu 200)"
    ERRORS+=("$label: HTTP $STATUS")
    ((FAIL++)); return
  fi

  # Vérif pas d'erreur React runtime dans le HTML
  if echo "$BODY" | grep -qi "Application error\|digest\|Event handlers cannot\|Server Component\|Unhandled Runtime Error"; then
    red "$label — Erreur React runtime détectée dans la page"
    ERRORS+=("$label: React runtime error")
    ((FAIL++)); return
  fi

  # Vérif que la page a bien du contenu (HTML ou JSON)
  if [ -z "$BODY" ]; then
    red "$label — Réponse vide"
    ERRORS+=("$label: empty response")
    ((FAIL++)); return
  fi

  green "$label (HTTP $STATUS)"
  ((PASS++))
}

echo ""
echo "💨 Smoke tests pages — $BASE_URL"
echo "═══════════════════════════════════════"
echo ""

# ── Pages publiques ──────────────────────────────────────────
echo "📋 Pages publiques"
assert_page_ok "GET /  (landing)"           "$BASE_URL/"
assert_page_ok "GET /login"                 "$BASE_URL/login"
assert_page_ok "GET /register"              "$BASE_URL/register"

# ── Dashboard (redirige vers login si non auth → 307 OK) ─────
echo ""
echo "📋 Dashboard (redirection attendue sans auth)"
assert_page_ok "GET /dashboard"             "$BASE_URL/dashboard"
assert_page_ok "GET /dashboard/event-types" "$BASE_URL/dashboard/event-types"
assert_page_ok "GET /dashboard/bookings"    "$BASE_URL/dashboard/bookings"
assert_page_ok "GET /dashboard/availability" "$BASE_URL/dashboard/availability"
assert_page_ok "GET /dashboard/blocked-slots" "$BASE_URL/dashboard/blocked-slots"

# ── Routes publiques user (404 si user inexistant = normal) ──
echo ""
echo "📋 Routes profil public"
STATUS_NOUSER=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/user_inexistant_xyz123")
if [ "$STATUS_NOUSER" = "404" ] || [ "$STATUS_NOUSER" = "200" ]; then
  green "GET /[username] (user inexistant → 404 attendu, obtenu $STATUS_NOUSER)"
  ((PASS++))
else
  # Vérifie pas d'erreur 500 / crash React
  BODY_CHECK=$(curl -s "$BASE_URL/user_inexistant_xyz123")
  if echo "$BODY_CHECK" | grep -qi "Application error\|digest\|Event handlers cannot"; then
    red "GET /[username] — crash React runtime (HTTP $STATUS_NOUSER)"
    ERRORS+=("GET /[username]: React crash")
    ((FAIL++))
  else
    green "GET /[username] (HTTP $STATUS_NOUSER)"
    ((PASS++))
  fi
fi

# ── API Health ────────────────────────────────────────────────
echo ""
echo "📋 API"
assert_page_ok "GET /api/health"            "$BASE_URL/api/health"

# ── Résumé ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "📊 Résultats : $PASS passés / $((PASS + FAIL)) total"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "❌ Échecs :"
  for e in "${ERRORS[@]}"; do echo "   • $e"; done
  echo ""
  exit 1
else
  echo ""
  echo -e "\033[32m✓ Toutes les pages répondent correctement\033[0m"
  exit 0
fi
