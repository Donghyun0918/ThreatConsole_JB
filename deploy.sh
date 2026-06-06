#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 졸작 풀스택 한방 배포 스크립트
#
#   대상: 신규 Ubuntu 22.04 EC2 (권장 t3a.2xlarge / 32GB RAM, gp3 300GB)
#   사용:
#     git clone <repo> && cd <repo>
#     cp .env.example .env      # 필요 시 값 수정(웹계정·LLM키 등)
#     ./deploy.sh
#
# T-Pot 설치는 시스템 변경 + 재부팅 1회가 필요하므로 이 스크립트는 멱등·재개형이다.
# 1차 실행 → T-Pot 설치 후 "재부팅 안내"하고 종료. 재부팅·재접속 후 ./deploy.sh 를
# 다시 실행하면 사이드카 + capstone 풀스택까지 이어서 올린다.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TPOTCE="$HOME/tpotce"
cd "$ROOT"

# ── .env 로드 ────────────────────────────────────────────────────────────────
if [ -f .env ]; then set -a; . ./.env; set +a; fi
WEB_USER="${WEB_USER:-tpotadmin}"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.1:8b}"

log(){ echo -e "\n\033[1;36m[deploy]\033[0m $*"; }
die(){ echo -e "\033[1;31m[deploy:오류]\033[0m $*" >&2; exit 1; }

# ── 0) preflight ─────────────────────────────────────────────────────────────
[ "$(uname -s)" = "Linux" ] || die "Linux(Ubuntu)에서 실행하세요."
command -v sudo >/dev/null || die "sudo 가 필요합니다."
command -v git  >/dev/null || die "git 이 필요합니다."
if ! command -v git-lfs >/dev/null 2>&1; then
  log "git-lfs 설치"; sudo apt-get update -y && sudo apt-get install -y git-lfs
fi
git lfs install --local >/dev/null 2>&1 || true
git lfs pull || true   # 모델 가중치(*.pkl) 를 실파일로 받음

# ── 1) T-Pot 설치 (미설치 시) ────────────────────────────────────────────────
if ! systemctl list-unit-files 2>/dev/null | grep -q '^tpot\.service' && [ ! -d "$TPOTCE/data" ]; then
  log "T-Pot 미설치 감지 → 설치 시작"
  command -v rsync >/dev/null || { sudo apt-get update -y && sudo apt-get install -y rsync; }
  # 우리 포크(사이드카 + basePath nginx 포함)를 ~/tpotce 로 복사
  rsync -a --delete --exclude '.git' "$ROOT/tpot/" "$TPOTCE/"
  ( cd "$TPOTCE"
    # 순정 clone 스킵 트릭: 공식 upstream remote 를 가진 git 저장소로 위장하면
    # T-Pot 설치 플레이북이 vanilla clone 을 건너뛰어 우리 사이드카가 보존된다.
    if [ ! -d .git ]; then
      git init -q
      git remote add origin https://github.com/telekom-security/tpotce
      git add -A
      git -c user.email=deploy@local -c user.name=deploy commit -qm "fork snapshot for deploy"
    fi )
  # 웹 비밀번호: .env 의 WEB_PASS 우선, 없으면 무작위 생성
  PW="${WEB_PASS:-$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)}"
  echo "$PW" > "$ROOT/webpw.txt"; chmod 600 "$ROOT/webpw.txt"
  log "install.sh 실행 (-s -t h -u $WEB_USER) … 수 분 소요. (passwordless sudo 필요)"
  ( cd "$TPOTCE" && bash ./install.sh -s -t h -u "$WEB_USER" -p "$PW" )
  # AMI 지뢰: MS SQL Server 가 1433 점유 + RAM 1GB 낭비 → 비활성
  sudo systemctl stop mssql-server 2>/dev/null || true
  sudo systemctl disable mssql-server 2>/dev/null || true
  echo
  log "T-Pot 설치 완료 — 웹 계정 $WEB_USER / 비번 ./webpw.txt"
  echo -e "  \033[1;33m⚠️  재부팅이 필요합니다.\033[0m  'sudo reboot' 후 재접속하여"
  echo    "      cd $ROOT && ./deploy.sh  를 다시 실행하면 이어서 진행합니다."
  exit 0
fi

# ── 2) T-Pot 기동 대기 (Elasticsearch healthy) ───────────────────────────────
log "T-Pot 기동 확인"
sudo systemctl start tpot 2>/dev/null || true
for _ in $(seq 1 60); do
  if sudo docker ps --filter name=elasticsearch --filter health=healthy --format '{{.Names}}' | grep -q elasticsearch; then break; fi
  sleep 5
done
sudo docker ps --filter name=elasticsearch --filter health=healthy --format '{{.Names}}' | grep -q elasticsearch \
  || die "Elasticsearch 가 healthy 가 아닙니다. 'sudo docker ps' 로 T-Pot 상태를 확인하세요."

# ── 3) 사이드카 (ml-classifier + threat-console + nginx basePath 라우팅) ──────
log "사이드카 빌드·기동 (ml-classifier / threat-console / nginx)"
( cd "$TPOTCE" && sudo docker compose -f docker-compose.yml -f compose/sidecars_overlay.yml \
    up -d --build ml-classifier threat-console nginx )

log "사이드카 data 디렉토리 권한 픽스 (uid 2000) — root mkdir 로 인한 권한 거부 방지"
sudo docker exec tpotinit sh -c '
  mkdir -p /data/ml-classifier/models /data/threat-console/reports /data/threat-console/training &&
  chown -R 2000:2000 /data/ml-classifier /data/threat-console &&
  chmod -R ug+rwX /data/ml-classifier /data/threat-console' || true
( cd "$TPOTCE" && sudo docker compose -f docker-compose.yml -f compose/sidecars_overlay.yml \
    restart ml-classifier threat-console )
sudo docker exec nginx nginx -t && sudo docker exec nginx nginx -s reload || true

# ── 4) capstone 풀스택 (Spring + Postgres + Next.js + Ollama) ────────────────
log "capstone 풀스택 빌드·기동 (Ollama 모델 자동 pull: $OLLAMA_MODEL)"
[ -f .env ] && cp -n .env capstone/.env 2>/dev/null || true   # LLM 키 등 전달
( cd "$ROOT/capstone" && OLLAMA_MODEL="$OLLAMA_MODEL" sudo docker compose up -d --build )

# ── 5) 검증 ──────────────────────────────────────────────────────────────────
log "엔드포인트 검증"
WEB_USER="$WEB_USER" bash "$ROOT/scripts/verify.sh" || true

log "배포 완료 ✅"
echo "  T-Pot 웹UI : https://<이 서버 공인IP>:64297   (계정 $WEB_USER / ./webpw.txt)"
echo "  → Threat Console 카드 → 졸작 대시보드(/threat-console 랜딩 → 로그인 → 대시보드)"
echo "  ⚠️ SG 인바운드 64295(SSH)/64297(웹)에 본인 IP(/32) 허용 필요. 8001/8090/11434 는 127.0.0.1 전용(SSH 터널)."
