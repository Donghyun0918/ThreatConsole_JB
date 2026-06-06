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

## 빠른 시작 (이미 EC2가 있다면)

```bash
git clone https://github.com/Donghyun0918/ThreatConsole_JB.git joljak && cd joljak
cp .env.example .env          # 필요 시 WEB_USER·OLLAMA_MODEL·LLM 키 수정
./deploy.sh                   # T-Pot 설치 후 재부팅 안내 → 재접속 후 ./deploy.sh 재실행
```

처음부터(AWS 인스턴스 생성)라면 아래 **1단계**부터 따라오세요.

---

## 1. AWS EC2 준비

### 1-1. 인스턴스 생성 (EC2 콘솔 → 인스턴스 시작)

| 항목 | 값 |
|---|---|
| AMI | **Ubuntu Server 22.04 LTS** (64-bit x86) |
| 인스턴스 유형 | **t3a.2xlarge** (8 vCPU / 32GB RAM) — Ollama CPU 추론 때문에 RAM 넉넉히 |
| 스토리지 | **gp3, 300GB** |
| 키 페어 | 새로 생성 후 `.pem` 다운로드(예: `key.pem`) — SSH 접속에 사용 |

> Ubuntu AMI의 기본 사용자 `ubuntu` 는 **passwordless sudo** 가 이미 설정돼 있어 deploy.sh 가 비대화형으로 동작합니다.

### 1-2. 보안그룹 인바운드 규칙

`<내IP>` = 본인 공인 IP (https://whatismyipaddress.com 에서 확인, `/32` 로 지정).

| 유형 | 포트 | 소스 | 용도 |
|---|---|---|---|
| SSH | `22/tcp` | `<내IP>/32` | **설치 전** 초기 SSH (설치 후엔 허니팟이 됨) |
| Custom TCP | `64295/tcp` | `<내IP>/32` | **설치 후** 관리 SSH |
| Custom TCP | `64297/tcp` | `<내IP>/32` | 웹 UI(T-Pot + Threat Console) |
| Custom TCP | `1-64000/tcp` | `0.0.0.0/0` | 허니팟(공격 유인) |
| Custom UDP | `1-64000/udp` | `0.0.0.0/0` | 허니팟(공격 유인) |

> ⚠️ `8001`(Next)·`8090`(Spring)·`11434`(Ollama)는 컨테이너가 `127.0.0.1` 로만 바인딩되어 외부에 안 열립니다. 직접 보려면 SSH 터널(아래 3단계).

### 1-3. SSH 접속 (설치 **전**: 기본 22번)

```bash
# (Windows) 키 권한 에러 시 PowerShell:
#   icacls "key.pem" /inheritance:r /grant:r "%USERNAME%:R"
ssh -i key.pem ubuntu@<공인IP>
```

> 🔴 **중요 함정:** T-Pot 설치·재부팅 **후에는 관리 SSH 포트가 64295 로 바뀝니다**(22번은 허니팟 Cowrie가 점유). 재부팅 뒤에는 반드시 `-p 64295` 로 접속하세요. 22번으로 붙으면 가짜 RHEL 쉘(허니팟)이 떠도 그건 함정입니다.

---

## 2. 배포 실행

```bash
git clone https://github.com/Donghyun0918/ThreatConsole_JB.git joljak && cd joljak
cp .env.example .env          # WEB_USER / OLLAMA_MODEL / LLM 키 등 (기본값으로도 동작)
./deploy.sh
```

`deploy.sh` 흐름 (멱등·재개형 — 끊겨도 다시 실행하면 이어감):

1. **preflight** — git-lfs 설치 + `git lfs pull`(모델 가중치 실파일화).
2. **T-Pot 설치** — 포크를 `~/tpotce`로 복사 → 순정 clone 스킵 트릭 → `install.sh -s -t h` → MS SQL Server 비활성.
   → **여기서 "재부팅 안내" 후 종료한다.**
3. 🔁 **재부팅 & 재접속 & 재실행:**
   ```bash
   sudo reboot
   # 잠시 후 (포트가 64295로 바뀜!)
   ssh -i key.pem -p 64295 ubuntu@<공인IP>
   cd joljak && ./deploy.sh        # 이어서 진행
   ```
4. (재실행분) **사이드카** — ml-classifier·threat-console·nginx(basePath 라우팅) 빌드·기동 + `/data` 권한 픽스(uid 2000).
5. **capstone 풀스택** — `docker compose up`(Ollama 모델 자동 pull, 수 분 소요).
6. **검증** — `scripts/verify.sh` 자동 실행.

---

## 3. 접속 & 사용

- 웹 UI: `https://<공인IP>:64297` — 계정 `WEB_USER`(기본 `tpotadmin`) / 비번 `./webpw.txt`.
- 상단 **Threat Console** 카드 → 졸작 **메인(랜딩)** → 로그인(`admin / admin123`, 데모 mock) → **대시보드**.
- 졸작 직접 접근(외부 미개방)은 SSH 터널:
  ```bash
  ssh -i key.pem -p 64295 -L 8001:127.0.0.1:8001 ubuntu@<공인IP>
  # 브라우저: http://localhost:8001/threat-console/dashboard
  ```

## 4. 검증

```bash
WEB_USER=tpotadmin bash scripts/verify.sh
# /threat-console, /login, /dashboard, /api/health, /tpot-map/ 가 2xx/3xx 이면 정상
```

---

## 문제 해결 / 메모

- **SSH timeout** → 보안그룹에 본인 IP가 없거나(64295/64297), 잘못된 포트. 설치 전 22, 설치 후 64295.
- **`rhel9-app01` 가짜 쉘** → 허니팟에 접속됨. `-p 64295` 빠뜨린 것.
- **EIP 미사용 시** stop/start 마다 공인 IP 변동 → 보안그룹 소스·SSH 대상 IP 갱신 필요.
- **웹 비번 교체**(시연 후 권장): `cd ~/tpotce && ./genuser.sh`.
- T-Pot 본체(`~/tpotce`)는 배포 시 생성되며, 리포의 `tpot/`은 그 **소스**(사이드카·nginx 패치 포함).
- 상세 이력은 `docs/latest.md`(단일 진실 원천).
