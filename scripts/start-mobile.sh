#!/bin/bash
# ============================================================
# FasoCare Mobile Testing Launcher - Solution Réseau Définitive
# Lance Backend + Tunnels Cloudflare + Expo Metro
# Usage: bash scripts/start-mobile.sh
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$PROJECT_DIR/mobile"
API_FILE="$MOBILE_DIR/src/services/api.js"
LOG_DIR="/tmp/fasocare-logs"
mkdir -p "$LOG_DIR"

BACKEND_PORT=3001
METRO_PORT=8081

# ─── Couleurs terminal ─────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; }
header()  { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"; echo -e "${BOLD}${CYAN}  $1${NC}"; echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"; }

# ─── Nettoyage propre en cas d'interruption ────────────────
cleanup() {
  header "Arrêt des services..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && info "Backend stoppé."
  [ -n "$TUNNEL_BACKEND_PID" ] && kill "$TUNNEL_BACKEND_PID" 2>/dev/null && info "Tunnel backend stoppé."
  [ -n "$TUNNEL_METRO_PID" ] && kill "$TUNNEL_METRO_PID" 2>/dev/null && info "Tunnel Metro stoppé."
  [ -n "$METRO_PID" ] && kill "$METRO_PID" 2>/dev/null && info "Metro stoppé."
  # Restaure l'URL originale dans api.js
  if [ -n "$ORIGINAL_URL" ]; then
    sed -i "s|let CURRENT_URL = '.*';|let CURRENT_URL = '$ORIGINAL_URL';|" "$API_FILE"
    info "URL API restaurée : $ORIGINAL_URL"
  fi
  success "Arrêt complet. Au revoir !"
  exit 0
}
trap cleanup INT TERM

# ─── ÉTAPE 1 : Vérification des prérequis ─────────────────
header "Étape 1/5 : Vérification des prérequis"
command -v cloudflared &>/dev/null && success "cloudflared ✓" || { error "cloudflared introuvable. Installez-le : https://github.com/cloudflare/cloudflared"; exit 1; }
command -v node &>/dev/null && success "node ✓" || { error "node introuvable."; exit 1; }

# ─── ÉTAPE 2 : Démarrage du Backend NestJS ────────────────
header "Étape 2/5 : Démarrage du Backend NestJS"
cd "$PROJECT_DIR"
npm run dev:backend > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
info "Backend PID: $BACKEND_PID — attente démarrage (25s max)..."

BACKEND_READY=0
for i in $(seq 1 25); do
  sleep 1
  if grep -q "Nest application successfully started" "$LOG_DIR/backend.log" 2>/dev/null; then
    BACKEND_READY=1
    break
  fi
  echo -n "."
done
echo ""

if [ "$BACKEND_READY" -eq 1 ]; then
  success "Backend NestJS démarré sur le port $BACKEND_PORT"
else
  warn "Backend pas encore prêt, mais on continue (il démarrera)..."
fi

# ─── ÉTAPE 3 : Tunnel Cloudflare pour le Backend ──────────
header "Étape 3/5 : Tunnel Cloudflare → Backend (:$BACKEND_PORT)"
cloudflared tunnel --url "http://localhost:$BACKEND_PORT" --no-autoupdate > "$LOG_DIR/tunnel-backend.log" 2>&1 &
TUNNEL_BACKEND_PID=$!
info "PID Tunnel Backend: $TUNNEL_BACKEND_PID — attente URL (20s max)..."

BACKEND_TUNNEL_URL=""
for i in $(seq 1 20); do
  sleep 1
  BACKEND_TUNNEL_URL=$(grep -oP 'https://[a-z0-9\-]+\.trycloudflare\.com' "$LOG_DIR/tunnel-backend.log" 2>/dev/null | head -1)
  [ -n "$BACKEND_TUNNEL_URL" ] && break
  echo -n "."
done
echo ""

if [ -z "$BACKEND_TUNNEL_URL" ]; then
  error "Impossible d'obtenir le tunnel du backend. Vérifiez la connexion internet."
  error "Log: $LOG_DIR/tunnel-backend.log"
  cat "$LOG_DIR/tunnel-backend.log" | tail -10
  cleanup
fi
success "Tunnel Backend : $BACKEND_TUNNEL_URL"

# ─── ÉTAPE 4 : Mise à jour automatique de api.js ──────────
header "Étape 4/5 : Mise à jour de api.js"
ORIGINAL_URL=$(grep "let CURRENT_URL = " "$API_FILE" | grep -oP "(?<=')[^']+(?=')" | head -1)
info "URL originale : $ORIGINAL_URL"
sed -i "s|let CURRENT_URL = '.*';|let CURRENT_URL = '$BACKEND_TUNNEL_URL';|" "$API_FILE"
# S'assure que la ligne tunnel est décommentée et la locale commentée
success "api.js mis à jour → $BACKEND_TUNNEL_URL"

# Vérifie que le backend répond via le tunnel
info "Vérification du backend via le tunnel..."
for i in $(seq 1 10); do
  sleep 2
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_TUNNEL_URL/api/v1/status" --max-time 5 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    success "Backend accessible via tunnel (HTTP $HTTP_CODE) ✓"
    break
  fi
  echo -n "."
done
echo ""

# ─── ÉTAPE 5 : Démarrage Expo Metro avec tunnel ───────────
header "Étape 5/5 : Expo Metro avec tunnel Cloudflare"
cd "$MOBILE_DIR"

# Démarrage Expo Web (accessible sur le réseau via tunnel)
EXPO_NO_DOTENV=1 npx expo start --web --port $METRO_PORT > "$LOG_DIR/expo.log" 2>&1 &
METRO_PID=$!
info "Metro PID: $METRO_PID — attente démarrage (20s)..."
sleep 20

# Tunnel pour Expo Web
cloudflared tunnel --url "http://localhost:$METRO_PORT" --no-autoupdate > "$LOG_DIR/tunnel-metro.log" 2>&1 &
TUNNEL_METRO_PID=$!
info "PID Tunnel Metro: $TUNNEL_METRO_PID — attente URL (20s max)..."

METRO_TUNNEL_URL=""
for i in $(seq 1 20); do
  sleep 1
  METRO_TUNNEL_URL=$(grep -oP 'https://[a-z0-9\-]+\.trycloudflare\.com' "$LOG_DIR/tunnel-metro.log" 2>/dev/null | head -1)
  [ -n "$METRO_TUNNEL_URL" ] && break
  echo -n "."
done
echo ""

# ─── RÉSUMÉ FINAL ─────────────────────────────────────────
header "✅ FasoCare - Tout est opérationnel !"
echo ""
echo -e "${BOLD}  📡 Backend API      :${NC} ${GREEN}$BACKEND_TUNNEL_URL/api/v1${NC}"
if [ -n "$METRO_TUNNEL_URL" ]; then
  echo -e "${BOLD}  📱 App Mobile (Web) :${NC} ${GREEN}$METRO_TUNNEL_URL${NC}"
  echo ""
  echo -e "${CYAN}  ➡  Ouvrez ${BOLD}$METRO_TUNNEL_URL${NC}${CYAN} dans Chrome sur votre téléphone${NC}"
else
  echo -e "${BOLD}  📱 App Mobile (Web) :${NC} ${YELLOW}http://localhost:$METRO_PORT${NC} (tunnel Metro non disponible)"
fi
echo ""
echo -e "${YELLOW}  Logs : $LOG_DIR/${NC}"
echo -e "${RED}  Ctrl+C pour tout arrêter proprement${NC}"
echo ""

# ─── Maintien du processus + surveillance ─────────────────
info "Surveillance des processus... (Ctrl+C pour quitter)"
while true; do
  sleep 30
  # Vérifie que le backend est toujours en vie
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    warn "Backend s'est arrêté. Redémarrage..."
    cd "$PROJECT_DIR"
    npm run dev:backend >> "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
  fi
done
