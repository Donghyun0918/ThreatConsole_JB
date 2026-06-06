# 정사평 — 허니팟 기반 AI 위협 분석 플랫폼

T-Pot 허니팟 + ML 분류/위협 콘솔 사이드카 + 졸작 풀스택(Spring · PostgreSQL · Next.js · Ollama)을
**EC2 한 대에 한 번에** 올리는 졸업작품 통합 리포지토리.

```
.
├── deploy.sh            # ★ 한방 배포 오케스트레이터 (재부팅 1회 포함, 재실행 가능)
├── .env.example         # 배포 설정 (cp .env.example .env)
├── tpot/                # T-Pot 포크 — ml-classifier·threat-console 사이드카 + basePath nginx 라우팅 베이크
├── capstone/            # 졸작 풀스택
│   ├── docker-compose.yml   #   Postgres·Spring(backend/honeypot)·Next.js·Ollama
│   └── frontend/            #   Next.js (basePath=/threat-console)
├── ml/                  # 분류 모델 가중치 (model.pkl 등, Git LFS)
├── scripts/verify.sh    # 배포 검증
└── docs/                # 작업 로그(latest.md = SSoT) · 진행 보고서
```

## 전제

- **신규 Ubuntu 22.04 EC2**, 권장 **t3a.2xlarge (8 vCPU / 32GB RAM)**, EBS gp3 ≥ 300GB.
- 실행 사용자에 **passwordless sudo** (install.sh 가 비대화형으로 시스템을 건드림).
- 보안그룹 인바운드: `64295/tcp`(관리 SSH)·`64297/tcp`(웹 UI)는 **본인 IP/32**, `1-64000`(tcp/udp)은 허니팟용.
  - ⚠️ `8001`(Next)·`8090`(Spring)·`11434`(Ollama)는 `127.0.0.1` 전용 바인딩 → 외부 노출 없음. 직접 보려면 SSH 터널.

## 배포 (한 번에)

```bash
git clone <이 저장소> joljak && cd joljak
cp .env.example .env          # 필요 시 WEB_USER·OLLAMA_MODEL·LLM 키 수정
./deploy.sh
```

`deploy.sh` 흐름 (멱등·재개형):

1. **preflight** — git-lfs 설치 + `git lfs pull`(모델 가중치 실파일화).
2. **T-Pot 설치** — 포크를 `~/tpotce`로 복사 → 순정 clone 스킵 트릭(공식 upstream remote) → `install.sh -s -t h` → MS SQL Server 비활성.
   → **재부팅 안내 후 종료**. `sudo reboot` 하고 재접속하여 **`./deploy.sh` 재실행**.
3. (재실행) **사이드카** — ml-classifier·threat-console·nginx(basePath 라우팅) 빌드·기동 + `/data` 권한 픽스(uid 2000).
4. **capstone 풀스택** — `docker compose up`(Ollama 모델 자동 pull).
5. **검증** — `scripts/verify.sh`.

## 접속

- 웹 UI: `https://<공인IP>:64297` — 계정 `WEB_USER` / 비번 `./webpw.txt`.
- 상단 **Threat Console** 카드 → 졸작 **메인(랜딩)** → 로그인(`admin / admin123`, 데모 mock) → **대시보드**.
- 졸작 직접 접근(외부 미개방)은 SSH 터널:
  ```bash
  ssh -i key.pem -p 64295 -L 8001:127.0.0.1:8001 ubuntu@<IP>
  # 브라우저: http://localhost:8001/threat-console/dashboard
  ```

## 검증

```bash
WEB_USER=tpotadmin bash scripts/verify.sh
# /threat-console, /login, /dashboard, /api/health, /tpot-map/ 가 2xx/3xx 이면 정상
```

## 메모

- T-Pot 본체(`~/tpotce`)는 배포 시 생성되며, 리포의 `tpot/`은 그 **소스**(사이드카·nginx 패치 포함).
- EIP 미사용 시 stop/start 마다 공인 IP 변동 → SG 소스·SSH 대상 IP 갱신 필요.
- 웹 비번은 시연 후 `~/tpotce/genuser.sh` 로 교체 권장.
- 상세 이력은 `docs/latest.md`(단일 진실 원천).
