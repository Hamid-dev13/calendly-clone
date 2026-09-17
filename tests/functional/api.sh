#!/usr/bin/env bash
# ============================================================
# tests/functional/api.sh
# Tests fonctionnels de l'API via curl
# Usage: BASE_URL=http://localhost:3000 ./tests/functional/api.sh
# ============================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0
ERRORS=()

# ── Helpers ─────────────────────────────────────────────────

green() { echo -e "\033[32m✅ $1\033[0m"; }
red()   { echo -e "\033[31m❌ $1\033[0m"; }

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    green "$label (HTTP $actual)"
    ((PASS++))
  else
    red "$label — attendu HTTP $expected, obtenu HTTP $actual"
    ERRORS+=("$label")
    ((FAIL++))
  fi
}

assert_json_field() {
  local label="$1" field="$2" expected="$3" body="$4"
  local actual
  actual=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$field',''))" 2>/dev/null)
  if [ "$actual" = "$expected" ]; then
    green "$label (.${field} = '${expected}')"
    ((PASS++))
  else
    red "$label — .${field}: attendu '${expected}', obtenu '${actual}'"
    ERRORS+=("$label")
    ((FAIL++))
  fi
}

assert_json_exists() {
  local label="$1" field="$2" body="$3"
  local actual
  actual=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if '$field' in d else 'no')" 2>/dev/null)
  if [ "$actual" = "yes" ]; then
    green "$label (.${field} existe)"
    ((PASS++))
  else
    red "$label — champ .${field} absent"
    ERRORS+=("$label")
    ((FAIL++))
  fi
}

# ── Tests ───────────────────────────────────────────────────

echo ""
echo "🧪 Tests fonctionnels API — $BASE_URL"
echo "═══════════════════════════════════════"

# ── 1. Health check ─────────────────────────────────────────
echo ""
echo "📋 Health"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)

assert_status "GET /api/health" 200 "$STATUS"
assert_json_field "Health retourne status=ok" "status" "ok" "$BODY"

# ── 2. Register ─────────────────────────────────────────────
echo ""
echo "📋 Auth — Register"

TS=$(date +%s)
EMAIL="test_${TS}@example.com"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)

assert_status "POST /api/auth/register — données valides" 200 "$STATUS"
assert_json_exists "Register retourne {success}" "success" "$BODY"

# ── 3. Register — email déjà utilisé ─────────────────────────
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)

assert_status "POST /api/auth/register — email dupliqué → 400" 400 "$STATUS"
assert_json_exists "Register dupliqué retourne {error}" "error" "$BODY"

# ── 4. Register — mot de passe court ─────────────────────────
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"short@test.com\",\"password\":\"123\"}")
STATUS=$(echo "$RESP" | tail -1)

assert_status "POST /api/auth/register — password court → 400" 400 "$STATUS"

# ── 5. Event types — non authentifié ─────────────────────────
echo ""
echo "📋 Event Types (sans auth)"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/event-types")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/event-types sans auth → 401" 401 "$STATUS"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/event-types" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test\",\"duration\":30}")
STATUS=$(echo "$RESP" | tail -1)
assert_status "POST /api/event-types sans auth → 401" 401 "$STATUS"

# ── 6. Availability — non authentifié ────────────────────────
echo ""
echo "📋 Availability (sans auth)"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/availability")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/availability sans auth → 401" 401 "$STATUS"

# ── 7. Booking public — user inexistant ──────────────────────
echo ""
echo "📋 Booking public"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/book/nonexistent_user_xyz/fake-slug")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/book/user-inexistant/slug → 404" 404 "$STATUS"

# ── 8. Booking — payload invalide ────────────────────────────
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"noone\",\"slug\":\"nope\"}")
STATUS=$(echo "$RESP" | tail -1)
assert_status "POST /api/bookings — payload incomplet → 4xx" 400 "$STATUS"

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
  green "Tous les tests fonctionnels passent ✓"
  exit 0
fi
