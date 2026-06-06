#!/usr/bin/env bash
# 배포 검증 — T-Pot 웹UI(64297) 경유로 핵심 엔드포인트 HTTP 코드를 찍는다.
# deploy.sh 가 호출하거나 단독 실행 가능:  WEB_USER=tpotadmin bash scripts/verify.sh
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PW="$(cat "$HERE/../webpw.txt" 2>/dev/null || echo "")"
USER="${WEB_USER:-tpotadmin}"
B="https://localhost:64297"

chk(){
  local code
  code=$(sudo curl -sk -u "${USER}:${PW}" -o /dev/null -w '%{http_code}' "$B$1")
  local mark="✅"; case "$code" in 2*|3*) ;; *) mark="❌";; esac
  printf "  %-42s %s %s\n" "$1" "$code" "$mark"
}

echo "[verify] 자격 ${USER} @ ${B}"
chk "/"                              # T-Pot 랜딩(인증)
chk "/threat-console"               # 졸작 랜딩(메인)
chk "/threat-console/login"         # 로그인
chk "/threat-console/dashboard"     # 대시보드
chk "/threat-console/_next/static"  # Next 에셋 경로(404여도 basePath 동작 신호)
chk "/threat-console/api/health"    # 대시보드 API(Ollama 연결)
chk "/threat-console/tpot-map/"     # 어택맵 프록시
