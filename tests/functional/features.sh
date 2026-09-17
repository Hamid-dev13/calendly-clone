#!/usr/bin/env bash
# ============================================================
# tests/functional/features.sh
# Tests fonctionnels COMPLETS — vérifie que les features marchent
# Usage: BASE_URL=http://localhost:3000 ./tests/functional/features.sh
# ============================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0; FAIL=0; ERRORS=()
TS=$(date +%s)
EMAIL="test_${TS}@calenclone-test.com"
PASSWORD="password123"
COOKIE_JAR="/tmp/calenclone_test_${TS}.txt"

green() { echo -e "\033[32m✅ $1\033[0m"; }
red()   { echo -e "\033[31m❌ $1\033[0m"; }

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ] 2>/dev/null; then
    green "$label (HTTP $actual)"
    ((PASS++))
  else
    red "$label — attendu HTTP $expected, obtenu HTTP $actual"
    ERRORS+=("$label")
    ((FAIL++))
  fi
}

assert_contains() {
  local label="$1" needle="$2" haystack="$3"
  if echo "$haystack" | grep -q "$needle"; then
    green "$label (contient '$needle')"
    ((PASS++))
  else
    red "$label — '$needle' absent dans la réponse"
    ERRORS+=("$label")
    ((FAIL++))
  fi
}

echo ""
echo "🧪 Tests fonctionnels FEATURES — $BASE_URL"
echo "═══════════════════════════════════════════"

# ── 1. Health check ─────────────────────────────────────────
echo ""
echo "📋 Santé"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
assert_status "Health check" 200 "$STATUS"

# ── 2. Inscription ──────────────────────────────────────────
echo ""
echo "📋 Inscription"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Feature\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "Inscription utilisateur" 200 "$STATUS"
assert_contains "Réponse {success:true}" "true" "$BODY"

# ── 3. Login et récupération cookie de session ──────────────
echo ""
echo "📋 Connexion + Session"

# Récupérer CSRF token
CSRF_RESP=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/api/auth/csrf")
CSRF=$(echo "$CSRF_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null)
if [ -z "$CSRF" ]; then
  red "CSRF token non récupéré — arrêt des tests"
  ERRORS+=("CSRF token")
  ((FAIL++))
else
  green "CSRF token récupéré"
  ((PASS++))

  # Login
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    -X POST "$BASE_URL/api/auth/callback/credentials" \
    --data-urlencode "email=$EMAIL" \
    --data-urlencode "password=$PASSWORD" \
    --data-urlencode "csrfToken=$CSRF" \
    --data-urlencode "callbackUrl=/dashboard")
  assert_status "Login credentials" 302 "$STATUS"

  # Vérif session active
  SESSION_BODY=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/auth/session")
  assert_contains "Session contient l'email" "$EMAIL" "$SESSION_BODY"
fi

# ── 4. Créer un event type ──────────────────────────────────
echo ""
echo "📋 Création event type"
RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/event-types" \
  -H "Content-Type: application/json" \
  -d '{"title":"Appel découverte","duration":30,"color":"#2563eb"}')
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "POST /api/event-types" 201 "$STATUS"
assert_contains "Event type créé avec slug" "appel" "$BODY"

# Récupérer le slug créé
SLUG=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('slug',''))" 2>/dev/null)
USER_NAME=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/auth/session" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('username',''))" 2>/dev/null)

if [ -n "$SLUG" ]; then
  green "Slug créé : $SLUG"
  ((PASS++))
else
  red "Slug absent dans la réponse"
  ERRORS+=("Slug creation")
  ((FAIL++))
fi

# ── 5. Lister les event types ───────────────────────────────
echo ""
echo "📋 Liste event types"
RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" "$BASE_URL/api/event-types")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/event-types" 200 "$STATUS"
assert_contains "Liste contient l'event" "Appel" "$BODY"

# ── 6. Disponibilités ───────────────────────────────────────
echo ""
echo "📋 Disponibilités"
RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" "$BASE_URL/api/availability")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/availability" 200 "$STATUS"

RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" \
  -X PUT "$BASE_URL/api/availability" \
  -H "Content-Type: application/json" \
  -d '{"availability":[{"dayOfWeek":1,"startTime":"09:00","endTime":"17:00","isActive":true}]}')
STATUS=$(echo "$RESP" | tail -1)
assert_status "PUT /api/availability" 200 "$STATUS"

# ── 7. Page booking publique ────────────────────────────────
echo ""
echo "📋 Page booking publique"
if [ -n "$USER_NAME" ] && [ -n "$SLUG" ]; then
  # Vérif créneaux disponibles
  TOMORROW=$(date -d "+1 day" +%Y-%m-%dT12:00:00.000Z 2>/dev/null || date -v+1d +%Y-%m-%dT12:00:00.000Z 2>/dev/null)
  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/book/$USER_NAME/$SLUG?date=$TOMORROW")
  STATUS=$(echo "$RESP" | tail -1)
  assert_status "GET /api/book/[username]/[slug]" 200 "$STATUS"
fi

# ── 8. Créer une réservation ────────────────────────────────
echo ""
echo "📋 Création réservation"
if [ -n "$USER_NAME" ] && [ -n "$SLUG" ]; then
  NEXT_MONDAY=$(date -d "next monday" +%Y-%m-%dT00:00:00.000Z 2>/dev/null || date +%Y-%m-%dT00:00:00.000Z)
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/bookings" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER_NAME\",\"slug\":\"$SLUG\",\"guestName\":\"Client Test\",\"guestEmail\":\"client@test.com\",\"date\":\"$NEXT_MONDAY\",\"time\":\"10:00\"}")
  BODY=$(echo "$RESP" | head -1)
  STATUS=$(echo "$RESP" | tail -1)
  assert_status "POST /api/bookings" 201 "$STATUS"
  assert_contains "Booking confirmé" "CONFIRMED" "$BODY"
fi

# ── 9. Lister les réservations ──────────────────────────────
echo ""
echo "📋 Réservations dashboard"
RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" "$BASE_URL/api/bookings/manage?filter=upcoming")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/bookings/manage" 200 "$STATUS"
assert_contains "Réservation visible" "Client Test" "$BODY"

# ── 10. Créneaux bloqués ─────────────────────────────────────
echo ""
echo "📋 Créneaux bloqués"
RESP=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/blocked-slots" \
  -H "Content-Type: application/json" \
  -d '{"startTime":"2030-12-25T00:00:00Z","endTime":"2030-12-26T00:00:00Z","reason":"Noël"}')
STATUS=$(echo "$RESP" | tail -1)
assert_status "POST /api/blocked-slots" 201 "$STATUS"

# ── Nettoyage ────────────────────────────────────────────────
rm -f "$COOKIE_JAR"

# ── Résumé ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "📊 Résultats : $PASS passés / $((PASS + FAIL)) total"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "❌ Échecs :"
  for e in "${ERRORS[@]}"; do echo "   • $e"; done
  echo ""
  exit 1
else
  echo ""
  echo -e "\033[32m✓ Toutes les features fonctionnent de A à Z ✓\033[0m"
  exit 0
fi
