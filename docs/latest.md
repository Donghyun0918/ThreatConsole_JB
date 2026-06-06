# T-POT_PR — Claude 작업 로그

> 이 파일은 프로젝트의 **현재 상태 + 마지막 작업**을 기록하는 단일 진실 원천(SSoT)입니다.
> 작업 시작 시 항상 먼저 읽고, 작업 종료 시 "마지막 작업" 섹션을 갱신합니다.
> (구 CLAUDE.md — 2026-05-07 latest.md로 이름 변경)

## 프로젝트 개요 — 두 트랙 분리 (2026-05-07)

캡스톤 33팀은 **두 개의 결과물**을 동시에 만든다:

1. **PR 트랙** (`tpot-fork/`) — Telekom Security 본가에 PR 제출용. 사이드카 모듈만, 영어, 머신 의존성 0. Spring Boot/PostgreSQL/Next.js 포함 금지.
2. **졸작 트랙** (`capstone/`) — 졸업작품 심사 시연용. T-Pot + Spring Boot + Next.js + Ollama 풀스택 통합.

두 트랙은 서로 독립. `capstone/`의 변경을 `tpot-fork/`로 가져오지 않는다 (PR 오염 방지). `tpot-fork/`에서 좋은 게 생기면 `capstone/tpotce/`로 수동 동기화한다 (한 방향).

## 디렉토리 구조

```
/mnt/d/T-POT_PR/
├── tpot-fork/              # PR 트랙 본체. T-Pot 포크 + 사이드카 모듈
│   ├── compose/            # 프로파일별 compose 파일
│   ├── docker/             # 컨테이너별 빌드 컨텍스트
│   └── .git                # branches: feat/{korean-kibana,ml-classifier,llm-analyzer,threat-console}
├── capstone/               # 졸작 트랙 (2026-05-07 신규)
│   ├── tpotce/             # tpot-fork 스냅샷 (.git 제외, 78MB)
│   ├── profiling-service/  # Spring Boot 4.0.3 + JPA + JWT + Postgres
│   ├── frontend/           # Next.js 15 (login/signup/dashboard, port 8001)
│   └── README.md           # 졸작 본체 안내
├── integration-tests/      # ES 샘플 주입 / Kibana 한글화 검증 스크립트
├── joljak33-main/          # (소스) 팀이 보내준 Spring/Next.js 원본 — capstone/로 복사 후 보존
├── profiling-service/      # (구버전) joljak33-main에 더 최신 버전 있음 (InternalController 빠짐)
├── honeypot-integrated/    # (참고용) 4/30에 폐기한 원본 로컬 플랫폼
├── logs/                   # T-Pot 클라우드에서 받아온 원시 공격 로그 + CSV 변환본
└── latest.md               # ← 이 파일 (SSoT)
```

## PR 진행 현황

| PR  | 브랜치                | 상태       | 커밋(현재)    | 내용 |
|-----|----------------------|-----------|---------------|------|
| #1  | `feat/korean-kibana` | fork 푸시  | `cb88701c`    | 한국어 Kibana saved objects (.ndjson) |
| #2  | `feat/ml-classifier` | fork 푸시  | `ea3c3317`    | ML 분류 사이드카 (LightGBM, ES `ml-analysis-*`) — 2026-05-07 amend (LGBM 단순화 + binary 제거 + CONF_THRESHOLD) |
| #3  | `feat/llm-analyzer`  | fork 푸시  | `723ffdc3`    | 한국어 LLM 위험도 요약 사이드카 (Ollama) — 2026-05-07 amend (`ml_binary_conf` → `ml_multi_conf`) |
| #4  | `feat/threat-console`| fork 푸시  | `8ff87e06`    | threat-console 통합 UI + ML 학습 파이프라인 + nginx 라우트 + **BYOM 모델 업로드** (베이스: `feat/ml-classifier`) |

**fork:** https://github.com/Donghyun0918/tpot-based  
**upstream:** https://github.com/telekom-security/tpotce
- `docker/nginx/dist/conf/tpotweb.conf`  ← threat-console 리버스 프록시 라우팅
- `docker/nginx/dist/html/index.html`

## 핵심 결정사항 (2026-04-30)

1. **본체는 T-Pot 포크**, `honeypot-integrated/`는 폐기/참고용
2. **Spring Boot + PostgreSQL 폐기** → T-Pot Elasticsearch에 `ml-analysis-*`, `llm-analysis-*` 인덱스로 흡수
   ※ **2026-05-07 보완:** PR 트랙에서는 여전히 폐기. 졸작 트랙(`capstone/`)에서는 부활시켜 시연용 풀스택 구성.
3. **프론트엔드는 한국어 Kibana saved objects (.ndjson)** (Next.js 폐기)
   ※ **2026-05-07 보완:** PR 트랙에서는 Kibana만. 졸작 트랙에서는 Next.js도 함께 시연.
4. **PR 전략**: 가벼운 것부터 단계적 (#1 Kibana → #2 ML → #3 LLM → #4 threat-console)
5. **백업 플랜**: Issue 반응 부정적이면 PR 포기, 포크 자체를 졸업작품으로
6. **두 트랙 분리 (2026-05-07 추가)**: PR 깨끗함과 졸작 풍부함을 동시 충족하기 위해 `tpot-fork/`(PR)와 `capstone/`(졸작) 디렉토리를 독립 운영.

## 마지막 작업

**날짜:** 2026-06-06
**작업 내용(세션 요약):** **AWS EC2 배포 계획 수립 + 실제 배포 완료(같은 세션).** 졸작 풀스택 전체 + Ollama를 **새 EC2 한 대**에 올리기로 결정 → 사양 확정(t3a.2xlarge 32GB, CPU Ollama) → 보안그룹 **"T-Pot 포트만 개방"** → **로컬에서 SSH로 EC2를 드라이브**해 T-Pot HIVE + 사이드카 + capstone 풀스택까지 **실제 기동·검증 완료**. 실 허니팟 데이터 흐름 확인. 결과는 아래 '배포 실행 결과(완료)'.

**배포 범위/사양 (확정):**
- 범위: **졸작 트랙(capstone/) 풀스택 전체** — T-Pot HIVE 24.04.1 + ml-classifier/threat-console 사이드카 + Spring(profiling)+Postgres + Next.js(:8001) + **Ollama(:11434)**. 새 인스턴스 신규 생성.
- 인스턴스 **t3a.2xlarge** (8 vCPU / **32GB RAM, GPU 없음 → CPU Ollama**), EBS **gp3 300GB**.
- OS: 기존엔 **Ubuntu 22.04**만 사용(문서상 유일). "24.04"는 OS가 아니라 **T-Pot 버전**(`TPOT_VERSION=24.04.1`)이니 혼동 주의. 신규는 22.04(검증됨) 또는 24.04 LTS 중 택1 — 미확정.
- LLM: CPU Ollama라 응답 느림(분석은 비동기라 데모 OK). **Beelzebub/Galah LLM 허니팟은 CPU 부적합 → 비활성 권장.** 주 모델 미정(일단 llama3.1:8b, 느리면 llama3.2:3b 등 경량 교체).

**보안그룹 — "T-Pot 포트만 개방" (AWS 콘솔 적용 완료):**
- 최종 인바운드 4개만 유지: `64295/tcp`(SSH 관리, **«관리자 IP 마스킹»/32**) · `64297/tcp`(웹 UI, «관리자 IP 마스킹»/32) · `1-64000/tcp`(허니팟, 0.0.0.0/0) · `1-64000/udp`(허니팟, 0.0.0.0/0).
- 삭제한 잉여 규칙: 8001·8090(/32)·SSH 22·MSSQL 1433 — 전부 1-64000 범위에 이미 포함돼 무의미. (22는 관리SSH 아님, T-Pot Endlessh/Cowrie 허니팟. 실제 관리SSH는 64295.)
- ⚠️ **핵심 함정(졸작 배포 시 반드시 처리):** 8001(Next)·8090(Spring)·11434(Ollama)가 **1-64000 개방 범위 안** → 컨테이너가 0.0.0.0 바인딩이면 전 세계 노출됨. SG는 deny 불가(허용만, 느슨한 규칙이 이김)라 /32 제한해도 무력. → capstone `docker-compose.yml`의 host publish를 **`127.0.0.1` 바인딩**(Ollama는 host포트 제거, docker network 내부통신)으로 바꾸고 **SSH 터널**(`ssh -p 64295 -L 8001:127.0.0.1:8001 -L 8090:... -L 11434:...`)로만 접근해야 실제로 가려짐. 64295/64297은 64000 밖이라 진짜 보호됨.
- 포트충돌 주의: T-Pot 허니팟이 8001/8090 선점 시 127.0.0.1 바인딩 충돌 → `ss -tlnp` 확인 후 capstone 포트 변경.

**운영 방식 결정:**
- **탄력적 IP 미사용** (사용자 결정). 서버 내에서 직접 작업하므로 IP 변동은 SSH 재접속만 영향. 단 내 IP(«관리자 IP 마스킹») 유동 시 64295/64297 SG 소스 갱신 필요.
- **EC2 안에 Claude Code 설치해 서버에서 직접 작업** 방향. 설치: Node 20(nodesource) → `npm i -g @anthropic-ai/claude-code` → 헤드리스 인증(구독 OAuth URL 복붙 or `ANTHROPIC_API_KEY`) → **tmux**로 세션 유지.
- 코드 전송: 이 통합 리포는 원격 push 미설정(capstone 로컬 git만) → GitHub private push 또는 `rsync -e "ssh -p 64295"` 필요. tpot-fork는 `github.com/Donghyun0918/tpot-based`에 있어 바로 clone 가능.

**EC2용 .env 교체 필수 항목 (현재 WSL 로컬값 → EC2값):** `TPOT_OSTYPE=win→linux`, `TPOT_DATA_PATH=/home/kdh20/...→/home/ubuntu/tpotce/data`, `TPOT_PULL_POLICY=missing→always`, Ollama 호스트 `http://ollama.local:11434→http://localhost:11434`, `WEB_USER`는 install.sh로 새 생성.

### 배포 실행 결과 (완료, 2026-06-06)

**인스턴스/접속:**
- EC2 `t3a.2xlarge`(8vCPU/32GB, 처음 16GB로 떠서 32GB로 리사이즈), Ubuntu 22.04.5, gp3 ~300GB. **EIP 없음 → stop/start마다 퍼블릭 IP 변동**(이번 IP `54.224.189.237`, 변하면 무의미).
- SSH 키: 로컬 `~/.ssh/ec2-new.pem`(원본 `/mnt/d/key.pem`, NTFS 777이라 600 복사본 사용). 설치 후 **포트 64295**.
- T-Pot 웹UI: `https://<IP>:64297` — **`tpotadmin` / `«webpw.txt 참조 — 공개리포에서 마스킹»`** (install.sh 자동생성, transcript 노출됨 → `genuser.sh`로 교체 권장).

**코드 전송:** GitHub `atom0599/AI-Profiling-Service`(public)에서 `git clone`. ⚠️ **repo가 Git LFS 사용**(`.gitattributes`: `*.json *.node *.pkl *.csv`) → clone만 하면 package.json 등이 **LFS 포인터**라 빌드 실패. **`sudo apt install git-lfs && git lfs install && git lfs pull` 필수**(GitHub에 객체 있어 복구됨). capstone/tpotce는 .gitignore라 repo에 없음 → T-Pot 본체는 `tpot-fork/` 사용.

**T-Pot 설치:** `tpot-fork`를 `~/tpotce`에 복사 후 **`git init`(master)+upstream remote**로 만들어, 플레이북 git 태스크(`update:no`)가 **순정 clone을 건너뛰게** 함 → 우리 사이드카 보존. `bash install.sh -s -t h -u tpotadmin -p <pw>` 비대화형(passwordless sudo). 재부팅 후 `tpot.service`로 자동 기동(**41 컨테이너**, ES healthy).
- ⚠️ **AMI에 MS SQL Server(mssql-server) 사전설치**돼 1433 점유(dionaea 충돌)+RAM 1GB → `systemctl stop+disable mssql-server`로 해결.

**사이드카(ml-classifier+threat-console):** `docker compose -f docker-compose.yml -f compose/sidecars_overlay.yml up -d --build ml-classifier threat-console nginx`.
- ⚠️ **알려진 권한 이슈 재현**: `/data/ml-classifier`·`/data/threat-console`를 docker가 root로 mkdir → uid2000 거부(threat-console 부팅실패→502, ml cursor 저장실패). 해결: `docker exec tpotinit sh -c 'mkdir -p .../reports .../training && chown -R 2000:2000 ... && chmod -R ug+rwX ...'` + 사이드카 restart → `/threat-console/` **200**.

**capstone 풀스택:** `capstone/docker-compose.yml` 수정 후 `docker compose up -d --build`(v2 사용가능).
- 수정: 모든 host publish **`127.0.0.1` 바인딩**(5433/8090/8001), `ES_HOST: http://elasticsearch:9200`(실 ES), **ollama host포트 제거**(honeytrap 허니팟이 11434 점유). 
- **외부망 baked-in**: compose 최상위 `networks: tpot: {external: true, name: tpotce_nginx_local}` + backend/frontend에 `networks: [default, tpot]` → backend가 `elasticsearch:9200`, frontend가 `map_web:64299` 도달 + **재부팅 durable**(수동 `network connect` 아님).
- ollama `llama3.1:8b`(4.9GB) pull 완료.
- **검증**: backend `/api/overview` **실 T-Pot 데이터**(6000+ events/attacks), frontend·overview·ml-stats·health 전부 **200**, `/tpot-map/` **200**.

**졸작 UI 접근(외부 미개방):** SSH 터널만 →
`ssh -i ~/.ssh/ec2-new.pem -p 64295 -L 8001:127.0.0.1:8001 -L 8090:127.0.0.1:8090 ubuntu@<IP>` 후 브라우저 `localhost:8001`.

**Claude Code on EC2:** Node20 + `@anthropic-ai/claude-code`(2.1.167) 설치 + 구독 로그인 완료(서버 작업용). 단 이번 배포는 **로컬에서 SSH로 드라이브**함.

### Threat Console → 졸작 대시보드 재배선 (2026-06-06, basePath 정석)

**목표:** T-Pot 웹UI의 **Threat Console** 카드 클릭 시 옛 Flask 콘솔(`threat-console:8080`)이 아니라 **졸작 Next.js 대시보드**(`capstone-frontend:8001`의 `/dashboard`)가 뜨게.

**문제의 본질:** Next.js가 `/`·`/websocket`·`/api`·`/_next` 등 **루트 경로**를 쓰는데 `/websocket`은 T-Pot 어택맵과, `/`는 T-Pot 랜딩과 충돌. → 단순 프록시 불가. **basePath로 `/threat-console` 아래에 앱 전체를 격리**(사용자 선택: 정석안).

**수정한 곳** (`AI-Profiling-Service/T-POT_PR/capstone/frontend/`, EC2 직접 — `*.bak.<ts>` 백업 있음):
- `next.config.ts`: `basePath = "/threat-console"` 추가 (`/_next`·API·`<Link>`·rewrites는 Next가 자동 prefix).
- `src/app/dashboard/page.tsx`: Next가 **자동 prefix 안 하는** raw `fetch("/api/..")` 5곳 + `<iframe src="/tpot-map/">`에 `const BP="/threat-console"` 접두.
- `server.js`: 커스텀 어택맵 프록시가 basePath를 흡수하도록 `stripBase()` 도입 — `isMap/isWs/toMapPath/toWsPath`가 `/threat-console` prefix 유무 모두 처리.
- `docker compose build frontend && up -d frontend` 재빌드(로그 `basePath=/threat-console` 확인). 양쪽 네트워크(`capstone_default`,`tpotce_nginx_local`) 재부착됨.

**T-Pot nginx** (`tpotce/docker/nginx/dist/conf/tpotweb.conf`, `html/index.html` — `*.bak.<ts>` 백업):
- `location /threat-console/` → **`proxy_pass http://capstone-frontend:8001;`** (끝 `/` 제거 → prefix 유지), `proxy_buffering off`(SSE용).
- `location = /threat-console` → `301 /threat-console/dashboard`.
- `index.html` 카드 링크 `/threat-console/` → **`/threat-console/dashboard`**.
- `nginx -t` 통과 후 `nginx -s reload`.

**E2E 검증(64297 HTTPS, `tpotadmin`):** `/threat-console`→301→`/dashboard` · `/threat-console/dashboard`**200** · `/threat-console/_next/...js`**200** · `/threat-console/api/health`**200**(`Ollama연결:true`) · `/api/overview`**200** · `/threat-console/tpot-map/`**200**(어택맵 타이틀). 카드 링크 갱신 확인.

⚠️ **부작용:** basePath 적용으로 직접 `:8001/dashboard`는 이제 **404**(정상 진입점은 `:8001/threat-console/dashboard` 또는 T-Pot UI 경유). 소스 수정은 **EC2에만** 반영 — 통합 리포(이 git)에는 미반영(필요 시 미러/커밋).

### 대시보드 버그 3건 수정 (2026-06-06)

데모에 보이는 버그 3건. **EC2 + 로컬 리포 양쪽** 수정 후 frontend 재빌드.

1. **탐지 신뢰도 10000%** — ES `ml_multi_conf`가 **0~100(%)** 스케일(rule 기반은 `100.0`)인데 프론트가 `0~1` 가정으로 또 ×100. → `attacks/route.ts` `mapMl`에서 `c>1?c/100:c` 정규화. 검증: 모든 `탐지신뢰도`≤1.
2. **"보안 건강 점수" → "위험도"(역전환)** — 게이지가 `100-위험점수`(높을수록 초록=안전)였음. `page.tsx` 게이지그리기+상단변수+JSX에서 `건강점수→위험도`(=위험점수 직접), 배경 세그먼트 색 반전(저위험 초록→고위험 빨강), `활성색`·라벨(양호/주의/위험) 반전, 제목 "위험도"(아이콘 `ShieldAlert`).
3. **최근 공격로그 매치 안 됨 + 고위험 필터 빈 목록** — 백엔드 `rawExport`는 `@timestamp` DESC·10000건 정상 반환하나, 프론트가 `.slice(0,100)` 후 **클라이언트에서만** 필터 → 최신 100건이 한 스캐너 IP(P0f recon) 도배, 고위험(전체 725건)이 범위 밖. → `route.ts` GET에 **서버측**: ① `공격자IP+공격유형` **중복제거** ② `filter`(attacks/highrisk) **전체 기준 필터** ③ slice(100). `page.tsx` fetch에 `&filter=${f}` 추가.

**검증(64297 API):** `filter=highrisk` → **79건 전부 위험점수 85~92**(이전 0건), 중복 없음, 신뢰도≤1. `filter=all` → **고유 IP 82개**(이전 도배). frontend 빌드 타입에러 0.

> 주의: rule 기반 분류는 conf=1.0 → 100% 표시(정상이나 "rule이 100% 확신"은 의미상 추후 개선 여지). 리포 구조화/한방배포(Part B)는 별도 보류 중(plan: foamy-spinning-waffle).

### 진입점 변경: 대시보드 직행 → 메인(랜딩) 페이지 (2026-06-06)

사용자가 "Threat Console 누르면 로그인/메인페이지가 나온다"고 함 → 확인 결과 **누락 아님**(대시보드 인증가드 없음, 라이브는 대시보드 직행이 맞았고 사용자 화면은 브라우저 캐시였음). 다만 진입점을 **앱 메인(랜딩)→로그인→대시보드 전체 흐름**으로 재결정.
- nginx `tpotweb.conf`: `location = /threat-console` 를 `301 /threat-console/dashboard` → **`proxy_pass http://capstone-frontend:8001;`** 로 교체(Next가 basePath 루트=랜딩 서빙). `location /threat-console/` 프록시는 유지.
- `index.html` 카드 링크 `/threat-console/dashboard` → **`/threat-console`**(랜딩).
- 검증: `/threat-console`**200**(랜딩 "정사평…", 대시보드 바로가기·로그인·무료가입), `/threat-console/login`·`/dashboard` 200, `_next` 200. 흐름: 랜딩→(대시보드 바로가기/로그인)→`admin/admin123`→대시보드(`router.push("/dashboard")`는 basePath 자동적용).
- ⚠️ 사용자 측은 **하드 리프레시(Ctrl+Shift+R)** 필요(구 index.html/캐시).

### 리포 구조화 + 한방 배포 (Part B, 2026-06-06)

clone→deploy 한 번에 올리도록 리포 재구성(plan: foamy-spinning-waffle). **이 latest.md 도 `T-POT_PR/latest.md`→`docs/latest.md` 로 이동됨.**

**평탄화:** `T-POT_PR/` 래퍼 제거 → 루트 `capstone/`·`tpot/`(구 tpot-fork)·`ml/`(구 ML)·`docs/`·`scripts/`. 폐기 트랙 삭제(honeypot-integrated·joljak33-main·구 profiling-service·logs·integration-tests·최상위 backend·중복 capstone/tpotce 78MB).

**드리프트 회수:** EC2에서 직접 고친 것 전부 리포 반영 — frontend basePath, capstone compose(127.0.0.1·ES=elasticsearch:9200·external tpot망·ollama 내부화), tpot nginx(basePath+랜딩 진입), 대시보드 버그 3건.

**신규:** `deploy.sh`(멱등·재개형: preflight→T-Pot설치+mssql비활성→재부팅→사이드카+권한픽스+nginx→capstone+ollama pull→verify), `scripts/verify.sh`, `README.md`, `.env.example`.

**git 슬림:** `.gitattributes` `*.json/csv/node` LFS 제거 → **`*.pkl`만**. orphan 단일 커밋 재초기화. ⚠️ **renormalize 필수였음**(`git add`가 미변경 파일 재필터 안 해 json이 LFS 포인터로 커밋될 뻔 → `git rm --cached -r . && git add -A`). 구 히스토리 = `backup/pre-cleanup-20260606` 브랜치.

**검증:** lfs-skip clone 시뮬 → package.json/tsconfig.json **실파일**, model.pkl만 포인터. LFS=pkl 3개.

**푸시 보류(사용자 결정):** `git push --force origin main`(공유 remote 재작성→팀원 이현 재클론 필요)은 **팀 타이밍 맞춰 나중에**. 현재 **로컬만**, 원격은 구 구조 그대로. 구 히스토리 백업 = 로컬 `backup/pre-cleanup-20260606` 브랜치 + `/mnt/d/integration-history-backup-20260606.bundle`(178MB, 복구: `git clone <bundle> dir`). deploy.sh 실배포는 새 EC2에서만 완전검증 가능(현 EC2 무관·계속 동작).

**새 리포 푸시(2026-06-06):** 슬림 단일 커밋 main 을 **`github.com/Donghyun0918/ThreatConsole_JB`** 에 푸시(LFS pkl 3개 7MB 포함, force 불필요=신규 빈 리포). 구 origin(atom0599/AI-Profiling-Service)은 미변경. 푸시 전 `docs/latest.md`의 EC2 웹비번·관리자IP **마스킹**. ⚠️ **사용 후 즉시 회전 필요**: ① 공유된 PAT(ghp_…) 폐기, ② EC2 웹비번(genuser.sh) — 둘 다 평문 노출됨. 구 origin 히스토리에는 비번이 남아있음.

**잡은 사고 2건(재발 주의):** ① `.gitattributes` 바꿔도 `git add`는 미변경 파일 재필터 안 함 → orphan 전 `git rm --cached -r . && git add -A` 필수(안 하면 json이 LFS 포인터로 커밋). ② `.gitignore`에 `dist/` 넣으면 **T-Pot `docker/*/dist/` 필수설정 2060개 제외**됨 → 절대 금지.

### 다음 작업 / 주의

1. **stop/start 시 IP 변동** → 64295/64297 SG 소스(`«관리자 IP 마스킹»/32`)와 SSH 대상 IP 갱신 필요. 내 IP(집 ISP) 바뀌어도 동일.
2. **llm-analyzer 사이드카 미배포**(overview `llm_analyzed:0`) — capstone은 자체 frontend→ollama로 LLM 분석. T-Pot llm-analysis-* 인덱스 채우려면 별도 배포.
3. **웹 비번 교체**(`~/tpotce/genuser.sh`) — transcript 노출분.
4. **5/25 이월 미수행**: 재학습 6라벨 모델을 ml-classifier `MODEL_DIR`에 배치(옛 5라벨↔6라벨 불일치), cowrie 라벨 개선 재학습 등.
5. nginx 권한 `chattr +i`는 미적용(Linux native라 당장 무해).

> 상세 배포 사양은 자동메모리 `project_ec2_fullstack_deploy.md`에도 기록됨.

---

## 이전 작업 (2026-05-25 — ML 재학습 + 모델 카드 + 데모 복구)

**날짜:** 2026-05-25
**작업 내용(세션 요약):** 외부 CICIDS 22피처 모델 배치 → 검사 결과 **라벨 부재·Init_Win 결손으로 활성화 보류** → **경로1 채택: 기존 16피처 ml-classifier 모델을 허니팟 수집 데이터로 재학습**(LightGBM 6라벨, holdout acc/F1 0.998) → **핀 버전 unpickle 검증 통과** → **프론트 대시보드에 "현재 분류 모델" 카드 추가** → **데모 스택 복구**. (아래 시간순 하위 블록 참조. 다음 할 일은 이 섹션 맨 끝 "다음 작업".)

**작업 내용:** **외부 LightGBM 모델(22 CICIDS 플로우 피처 / 9라벨) 파일을 capstone 리포에 배치** — 추론 파이프라인 연결은 하지 않음(파일만 배치).

- **원본:** `/mnt/d/integration/11/` — `model.pkl`(6.97MB, LightGBM), `feature_cols.pkl`, `label_names.pkl`
- **배치 위치:** `capstone/tpotce/data/ml-classifier/models/cicids-lgbm/` (원본 파일명 유지, 크기 일치 확인)
- **호환성 주의 — 기존 ml-classifier와 입력 스키마가 다름:**
  - 기존 `feature_extract.py`: 허니팟 로그 16피처(`hour, dst_port, cmd_length, login_attempts, has_wget…`) / 라벨 5~6개(Recon/Brute Force/Malware/Intrusion/Etc)
  - 이 모델: CICIDS 네트워크 플로우 22피처(`Flow Duration, SYN Flag Count, Init_Win_bytes_forward, honeypot_id…`) / 라벨 9개(Normal/Recon/Brute Force/Intrusion/Malware/Web Attack/Service Attack/ICS Attack/Etc)
  - → 그대로 활성화하면 16 vs 22 shape 불일치로 추론 실패 → 룰 기반 폴백. **실제 동작하려면 feature_extract + 라벨 재작성 + 플로우 피처 데이터 소스 확보 필요(미수행).**
- **자동 로드 안 됨:** 활성 로더(`classify.py`)는 `MODEL_DIR` 최상위의 `multi_model.pkl` + `encoders.json`만 읽음. `cicids-lgbm/` 서브폴더라 무시됨 → 활성 모델과 충돌 없이 분리 보관.
- **gitignore:** capstone는 `*.pkl` + `tpotce/` 무시 → 커밋엔 미포함, 작업 트리에만 존재.

**추가 분석 — 모델 완전 파싱 + 수정 명세 작성 (`cicids-lgbm/pkl.md`):**
- 모델 파싱: `LGBMClassifier` multiclass, n_features=22, classes=[0..8] **정수 출력**, num_leaves 63 / lr 0.05 / class_weight=balanced / 1584트리(176라운드). 내부 피처명 `Column_0..21` → **입력 순서가 절대적**.
- ⚠️ **추론 시 코드 수정 필수:** `model.predict()`가 정수(0-8) 반환 → `classify.py`의 `str(pred)`로는 라벨이 `"3"`이 되어 오작동. `label_names[int(pred)]` 매핑 필요.
- **Suricata flow 가용성 결론:** 중요도 기준 ~70% 직접/유도 가능하나, **결손 21%** (특히 `Init_Win_bytes_forward`(10.8%)+`backward`(7.3%)=18.1%가 Suricata eve.json에 아예 없음) + 근사 ~4.5% + honeypot_id 간접 4%. → 0으로 채우면 변별력 크게 손상.
- **수정 시나리오 3종 문서화:** A(미수정·결손 0채움, 비권장) / B(가용 18피처 재학습 — model+feature_cols 동시, **단 원본 CICIDS 학습 데이터 필요·현재 없음**) / C(label_names만 리매핑). 원본 sha256 + 버전핀(컨테이너 lightgbm 4.5.0 vs 로드환경 4.6.0) 기록, 검증 체크리스트 포함.

**원본 보존 + 18피처 수정본 생성 (시나리오 B 대비):** `cicids-lgbm/`을 `original/`(원본 3개 불변)·`modified/`(수정본)로 분리.
- `modified/feature_cols.pkl`: 22→**18** (Suricata 결손 `Min/Max Packet Length`+`Init_Win_bytes_forward/backward` 제거, 원본 순서 유지). sha256 `58fb39bb…d860da`
- `modified/label_names.pkl`: 9라벨 변경 없음(원본 동일).
- `modified/MODEL_PENDING.md`: model.pkl은 18피처 **재학습 필요**(원본 학습데이터 확보 후) → 자리표시.
- 기록: `pkl.md` §1 구조도 + §6 버전 로그 갱신. 원본 해시는 /11·original/ 양쪽 동일 검증 완료.

**프론트엔드(capstone/frontend, Next.js)를 9라벨에 맞춤:**
- `src/types/input.ts` — `공격유형코드`에 모델 9-class 카테고리 추가(`NORMAL/RECON/BRUTE_FORCE/INTRUSION/MALWARE/WEB_ATTACK/SERVICE_ATTACK/ICS_ATTACK`). 기존 웹/네트워크 코드는 하위호환 유지.
- `src/app/api/attacks/route.ts` — `유형맵` 재작성. 기존 키(`ssh-bruteforce` 등)는 실제 `ml_label`(`Brute Force` 등)과 안 맞아 **항상 UNKNOWN**이던 버그 수정 → 9라벨 문자열 1:1 매핑.
- `src/app/dashboard/page.tsx` — `라벨한글` 맵 추가, `공격표시명`이 영문 ml_label을 한국어로 표시(정찰/무차별 대입/침입/악성코드/웹 공격/서비스 공격/산업제어 공격/기타/정상).
- **전제:** classify.py가 `model.predict()` 정수(0-8)를 `label_names`로 이름 매핑해 `ml_label`에 기록해야 위 매핑이 동작(아직 미구현 — `pkl.md` §3 제약). node_modules 없어 tsc 미실행(타입상 안전).
- **미반영:** Kibana 대시보드(`kibana_export_ko.ndjson`)는 여전히 5라벨 — 별도 작업 필요.

**ML 실사용 경로 결정 + 기존 16피처 모델 허니팟 데이터로 재학습 (경로1):**
- **데이터 배치** (`capstone/tpotce/data/ml-classifier/dataset/`, gitignore로 미커밋): `tpot_dataset.csv`(정제 7.4만), `tpot_raw.csv`(ES 원본 27.5만), `csv/`(허니팟별 18개 — suricata 72.7만행/flow 44.5만, p0f 206MB, cowrie/honeytrap/fatt 등).
- **검사 결론 — CICIDS 22피처 모델 실사용 막힘**: ① 9라벨 정답 라벨이 어느 파일에도 없음(suricata alert.category로 약라벨만 가능, mitre_technique는 727,868행 중 191건뿐) ② suricata flow로 22피처 중 ~70%만 가용, `Init_Win_bytes_fwd/bwd`(중요도 18%) 컬럼 자체가 없음(pkl.md §2.4 실측 확정). → 사용자 결정 **경로1**(기존 16피처 모델을 이 데이터로 재학습). CICIDS 모델은 보관.
- **재학습 파이프라인(기존 training 스크립트 그대로, 신규 코드 0)**: `csv_to_training.py`(csv/ → 29.8만행 16피처+약라벨; Recon 81.4%/Malware 9.9%/Brute Force 6.9%/Intrusion 1.5%/Etc 0.3%, Normal 0) → `fetch_normal.py`(NSL-KDD Normal 1만 다운로드) → 병합+balance-n 10000(**45,431행 6클래스**) → `train.py`(LGBM, stratified 80/20+5fold). **holdout acc/macro-F1 0.9978, CV 0.998±0.0005**.
- ⚠️ **0.998은 과대평가**: 약라벨(rule_label)의 입력(source_honeypot/has_wget 등)이 16피처에 들어있어 모델이 룰을 재현한 것. 실익은 ① Normal 분류(룰엔 없음) ② 피처공간 보간 ③ CONF_THRESHOLD 저신뢰 컷.
- **스모크(추론 로직 인라인 재현)**: `classes_`가 **문자열**이라 `str(predict)` 정상(정수버그 무관). 정상http→Normal·p0f→Recon·dionaea→Malware·cowrie로그인→Brute Force 정확. **cowrie 멀웨어/리버스셸→Brute Force 오분류**(cowrie 학습분포가 Brute Force 편향 + 스모크 doc 피처 부실).
- **생성물**: `dataset/work/models/{multi_model.pkl(3.1MB), encoders.json, metrics.json, confusion_multi.txt}`. 학습환경 lightgbm 4.6/sklearn 1.8 (컨테이너 핀 4.5/1.5 — **unpickle 미검증**).
- **환경 메모**: ml-classifier 사이드카 현재 미가동 → hot-reload·e2e ES 추론 미검증. `capstone-backend` crash loop(postgres/ES 의존성 미기동, ML과 무관). `build_dataset.py`는 `--from-csv` 모드인데도 top-level `elasticsearch` import로 죽음 → 병합/밸런싱은 인라인 처리(PR 트랙 오염·패키지 설치 회피).
- **핀 버전 unpickle 검증 완료**: `tpot/ml-classifier:local` 빌드(python3.11+libgomp1+핀 4.5.0/1.5.2/1.26.4) → 컨테이너 안 `joblib.load` 성공, 동일 입력 벡터(`work/vectors.json`)에 대해 학습환경(4.6/1.8/2.4)과 **예측 라벨+확률 소수4자리까지 비트단위 일치**(cowrie멀웨어/브루트→Brute Force, dionaea→Malware 0.7123, p0f→Recon 1.0, 정상→Normal 1.0). `n_features_in_=16`, classes_ 6개 문자열. pkl.md §7 통과 → **4.6→4.5 다운그레이드 배포 안전 확정**.
- **남은(미수행)**: 모델 배치(`MODEL_DIR`)+ml-classifier hot-reload, e2e ES 추론(logstash-*→ml-analysis-*), 라벨 개선(cowrie 세분화) 재학습.

**프론트(capstone/frontend)에 학습 모델 카드 표시:**
- **신규 `/api/model` Next route**: train.py가 출력한 `metrics.json`을 읽어 모델 요약 반환. 소스 우선순위 = env `MODEL_METRICS_PATH` 파일 → 없으면 **빌드 번들 `src/data/model-metrics.json`**(work/models/metrics.json 복사본) fallback. `algorithm` lgbm→LightGBM 매핑, accuracy/macro_f1/cv/labels/n_total/n_features 정제.
- **dashboard 개요밴드 아래 풀폭 "현재 분류 모델" 카드**: 알고리즘(LightGBM)·정확도 99.8%·Macro-F1 99.8%·5-Fold CV 99.8%·학습샘플 45,431·6라벨 칩(한국어 `라벨한글` 재사용). `모델정보` 상태 + `/api/model` fetch useEffect + CSS(`.모델밴드/.모델카드/.모델지표그리드` 등) 추가, lucide `BrainCircuit`. 기존 로직 무변경(외과적 삽입).
- **검증**: `docker build`(next build) 통과(12라우트, `/api/model` 컴파일) → 임시 컨테이너 `/api/model` 정상 확인 → **capstone-frontend를 새 이미지로 교체**(env 6개 복제: NODE_ENV/OLLAMA_HOST/LLM_PROVIDER/SPRING_API_URL/TPOT_MAP_TARGET/PORT, capstone_default, :8001, restart unless-stopped). 교체 후 `/api/model`(LightGBM 0.9978 6라벨 45431)·dashboard·landing·health 전부 정상.
- **주의**: 카드는 번들 metrics 기반이라 ES 실데이터·backend 가동과 **무관하게 항상 표시**(현재 capstone-backend crash loop여도 카드는 뜸). 모델 재학습 시 `src/data/model-metrics.json` 갱신(또는 `MODEL_METRICS_PATH`로 metrics.json 마운트)해야 카드 수치 갱신됨.

**데모 스택 복구:** capstone-postgres·phase1-es가 16h 정지 → backend crash loop로 대시보드 실데이터(개요/공격로그/LLM) 전멸 상태였음.
- 복구 순서: `docker start phase1-es capstone-postgres`(postgres healthy 11s, ES yellow) → `capstone-backend restart`(의존성 뜬 뒤 health 200) → **ES 샘플 +24.8h 재-shift**(painless `_update_by_query`, logstash 12/ml-analysis 8/llm-analysis 5 = 25문서, 최신=now-5분, failures 0 — 안 하면 `now-24h` 밖이라 개요 0).
- 검증: overview 12/6/4/5, attacks ml 8·llm 5 복원(이전 검증값 일치). 4페이지·health 정상.
- **불일치 주의**: 공격로그 목록(ml-analysis)은 **옛 5라벨 샘플**, 모델 카드는 **새 6라벨 LightGBM** → 목록을 새 모델 결과로 맞추려면 모델 배치+ml-classifier 재분류 필요(미수행).
- **미정리**: `phase1-postgres`/`phase1-backend`(구 검증용 잔여, 제거 가능), `tenzir-node`(프로젝트 무관 추정 — 사용자 확인 대기).

### 다음 작업 (우선순위 순)

1. **모델 배치 + ml-classifier 재분류 (ML 실사용 완성)** — `dataset/work/models/{multi_model.pkl, encoders.json}`을 ml-classifier `MODEL_DIR`에 배치 + 사이드카 기동 → ES `ml-analysis-*`를 **새 6라벨로 재분류**. 현재 공격로그 목록(옛 5라벨)과 모델 카드(새 6라벨) **불일치 해소**가 목표. ※ `classify.py`/`build_dataset.py`의 top-level `elasticsearch` import는 추론/from-csv와 무관하니 lazy import로 옮기는 것도 검토(PR 트랙은 별도 동기화).
2. **라벨 품질 개선 후 재학습** — cowrie 멀웨어/리버스셸→Brute Force 오분류. `rule_label.py` cowrie 분기 세분화(command.input의 wget/chmod→Malware, `/dev/tcp`→Intrusion 우선순위 강화) + cowrie 학습분포 편향 완화(다운샘플). 재학습 시 `metrics.json`과 프론트 번들 `frontend/src/data/model-metrics.json` 동기화.
3. **환경 정리** — `phase1-postgres`/`phase1-backend` 제거(backend는 `phase1-es`만 ES로 사용). `tenzir-node` 정체 확인 후 무관하면 정리.
4. **운영 안정화** — backend `depends_on`+healthcheck로 기동 순서 보장(현재 `restart:unless-stopped`라 의존성보다 먼저 뜨면 crash loop). 데모 전 ES 재-shift를 스크립트화.
5. **(보류) CICIDS 22피처 모델** — 9-class 정답 라벨 달린 플로우 학습데이터 확보 시 `pkl.md` 시나리오 B(18피처 재학습) 재개. 그 전까지 `cicids-lgbm/`에 보관만.
6. **PR 트랙 동기화** — capstone에서 검증된 개선을 `tpot-fork/`로 단방향 반영(예: index.html ML Analyzer 카드 제거 미커밋분).

**데모 직전 체크리스트:** ES·postgres 먼저 기동 → backend restart → ES 샘플 재-shift(`now-24h` 안) → 4페이지+overview(12/6/4/5) 확인.

## 이전 작업 (2026-05-23 — Phase 1 검증 + SOAR 제거)

**날짜:** 2026-05-23
**작업 내용:** **Phase 1 (조회+Export 6개 엔드포인트) 빌드/런타임 검증 완료 — Flask와 1:1 일치 확인** + SOAR 스택 제거.

### 발견: Phase 1 코드는 이미 작성돼 있었음 (5/22 로그보다 앞서 있음)

5/22 로그는 "Phase 1 시작 예정"이라 적었으나, 실제로는 `capstone/backend/honeypot/`에 이미 구현돼 있었다 (원본 `/mnt/d/integration/backend/honeypot/`엔 없는 3개 파일):
- `controller/ThreatConsoleController.java` (135줄, 6 엔드포인트: overview/ml-stats/llm-recent/llm-stats/export-ml/export-llm)
- `service/ThreatConsoleService.java` (276줄, ES Java client 8.13 + aggregation 추출 + 폴백)
- `config/ElasticsearchConfig.java` + build.gradle ES 의존성 + SecurityConfig 인증 제외 경로 + HealthController
→ **단, 빌드/런타임은 한 번도 검증된 적 없었음** (로컬 Java 없음, Dockerfile 없음). 이번에 그걸 검증.

### 한 일

1. **Dockerfile + .dockerignore 작성** (`capstone/backend/honeypot/`) — profiling-service 패턴 적응, 멀티스테이지 temurin-17-jdk→jre, `bootJar -x test`.
2. **docker build 성공** (exit 0, 255MB `capstone/backend:local`) → 컴파일 + ES client 8.13 의존성 해결 검증.
3. **검증 환경 구성** (`phase1-verify` 네트워크):
   - `phase1-es` = ES 8.13.0 단일노드, security off, host :19200
   - `phase1-postgres` = postgres:16 (백엔드 JPA 기동 의존성 충족용)
   - `phase1-backend` = capstone/backend:local, host :18080, `ES_HOST=http://phase1-es:9200`
   - 샘플 주입: logstash=12, ml-analysis=8, llm-analysis=5 (llm-analysis는 severity=keyword 명시 매핑 — Flask가 keyword로 집계하므로)
4. **6개 엔드포인트 전부 Flask와 1:1 일치 검증**:
   - overview: events=12 attacks=6 high_risk=4 llm=5 ✅
   - ml-stats: labels/honeypots/model_used/score_dist/by_hour ✅
   - llm-recent: count=5 desc, `?severity=HIGH`→2 ✅
   - llm-stats: severity **keyword 집계 정상**(가장 위험했던 부분) ✅
   - export/ml: JSON 8행 + CSV 컬럼순서 ✅
   - export/llm: BOM(ef bb bf) + ttp 세미콜론 + filename slug(now7d) + text/csv;charset=utf-8 ✅
   - 유일한 사소차이: CSV 줄바꿈 `\n` vs Python csv `\r\n` (다운로드용, 무관)

### SOAR 스택 제거 (사용자 지시 — 프로젝트 무관)

`shuffle`/`thehive`/`cortex` 스택은 이 프로젝트(`/mnt/d/integration`)와 무관 → 사용자 지시로 완전 제거: 컨테이너 8 + 볼륨 3(`shuffle_shuffle-database`, `thehive_cassandra_data`, `thehive_es_data`) + 네트워크 3. 메모리 가용분 9→15Gi 회수. SOAR **이미지**는 디스크에 남김 (재pull 가능).

### capstone 풀스택 로컬 기동 (당일 후속)

`capstone/docker-compose.yml` 재배선 후 졸작 본체 풀스택을 로컬 기동·검증 완료.
- **compose 재배선**: `profiling-service` 서비스의 `build: ./profiling-service`(구) → **`./backend/honeypot`**(신 통합본). `ES_HOST: http://host.docker.internal:19200` + `extra_hosts: host-gateway` 추가해 threat-console 조회를 phase1-es(샘플데이터)에 연결. 서비스명은 frontend `depends_on` 호환 위해 `profiling-service` 유지, container_name만 `capstone-backend`.
- **환경 변화 발견**: 이 WSL은 더 이상 Docker Desktop이 아니라 **Docker Engine 29.1.3 직접 설치** + **구형 `docker-compose v1.29.2`** 만 있음 (`docker compose` v2 플러그인 없음). v1으로도 정상 파싱·기동됨. → compose 명령은 `docker-compose`(하이픈) 사용.
- **기동 결과 (5 컨테이너)**:
  | 컨테이너 | 포트 | 검증 |
  |---|---|---|
  | capstone-frontend | :8001 | `/`,`/login`,`/signup`,`/dashboard`,`/api/health` 모두 200, 타이틀 "정사평 — 허니팟 공격 분석 시스템" |
  | capstone-backend | :8090 | `/api/health` 200, threat-console 조회 실데이터(events=12/attacks=6) |
  | capstone-postgres | :5433 | healthy (postgres/capstone-dev) |
  | capstone-ollama | :11434 | healthy, `llama3.1:8b`(4.9GB) 풀 완료, 한국어 생성 OK |
  | (capstone-ollama-pull) | — | 1회성, 완료 후 제거 |
- frontend `/api/analyze/stream` → Ollama 경유 200. frontend는 Spring 백엔드 미참조(코드상 OLLAMA_HOST만 사용), Ollama 직접 호출.

### 프론트엔드 개편 — 가짜 시나리오/어택맵 → 실 T-Pot 데이터 (당일 후속)

사용자 요청: dashboard의 (1) 하드코딩 공격시나리오 4개 picker, (2) 커스텀 d3 어택맵을 제거하고 T-Pot의 것을 끌어다 쓰기. 결정: 어택맵=**Next.js 리버스프록시 임베드**, 분석입력=**실 T-Pot 공격로그(ES)로 교체**.

- **제거**: `시나리오목록`(가짜 4개), `AttackMap.tsx`(d3 지도 컴포넌트 삭제), 관련 state/JSX. `선택시나리오`→`선택공격`(공격로그입력) 전면 치환.
- **신규 `/api/attacks` (Next route)**: `SPRING_API_URL`(=profiling-service:8080)의 `/api/export/ml?format=json`을 서버사이드 프록시 → ml-analysis 행을 `공격로그입력`으로 매핑(ml_label→공격유형코드, mitre_score→위험점수/등급, ml_multi_conf→탐지신뢰도, 행위시퀀스 합성). ml_is_attack=false 필터, 최근 50건.
- **dashboard 섹션1**: "공격 시나리오 선택"→"최근 공격 로그" 실데이터 목록(IP·허니팟·위험점수·시각, 위험등급 배지). 게이지/네트워크그래프/레이더·바차트/PDF는 선택공격 기준으로 유지.
- **어택맵 카드**: d3 지도 → `<iframe src="/tpot-map/">` (T-Pot Attack Map). 프록시는 #10(완료).
- **검증**: `next build` 타입체크 통과(10 라우트), `/api/attacks`가 phase1-es 실 ml-analysis 6건 정확 매핑 반환, dashboard에 신규 요소 전부 렌더 확인. `/tpot-map/`은 프록시 전이라 308.
- **compose v1 버그 발견**: `docker-compose` v1.29.2가 Docker Engine 29.x 이미지 포맷과 충돌 — 컨테이너 **recreate 시 `KeyError: 'ContainerConfig'`**. 우회: `docker rm -f <c>` 후 재생성 또는 `docker run` 직접 사용. (최초 `up`은 정상, recreate만 터짐. 장기적으로 compose v2 플러그인 설치 권장.)

### 프론트엔드 전면 리뉴얼 (당일 후속) — Clean Light SaaS + 이모지→SVG

사용자 요청: 프론트 전면 수정(디자인+레이아웃+플로우+리팩터링) + 이모지 아이콘을 SVG로 교체. 결정: **Clean Light SaaS** 톤(인디고 #6366f1, 부드러운 그림자, 라운드 카드), **전 페이지**(랜딩+로그인/가입+대시보드), 아이콘 **lucide-react**.

- **디자인 시스템 신설** `globals.css`: 토큰(CSS vars: surface/text/accent/semantic/shadow/radius) + 재사용 클래스(`.card .btn .badge .input .alert .topbar .auth-* .step* .pw-meter` 등). 페이지별 거대 인라인 `<style>` 제거 → 코드 정리.
- **lucide-react 추가**(deps). 전 페이지 이모지(🍯🌍🛡️⚠️📋🎯🧠🚨📊📈🔍📄👤🔒…) 전부 SVG 아이콘으로 교체. d3 네트워크 노드 글리프·HTML-string 헬퍼·결과제목맵·PDF헤더의 이모지까지 제거(텍스트화). **대시보드 잔존 이모지 0 확인.**
- **page.tsx(랜딩)**: 다크→라이트 재작성(nav/hero/features/cta/footer), FEATURES 배열화.
- **login/signup**: 라이트 재작성, auth 레이아웃 CSS를 globals로 공통화. **mock auth(ACCOUNTS)·quickLogin·redirect, 회원가입 스텝/비번강도/검증/redirect(/login) 로직 그대로 보존.**
- **dashboard**: 다크 헤더→라이트 topbar, 토큰 정렬, 아이콘 교체. **d3(게이지/네트워크그래프/레이더·바차트)·/api/attacks 실로그 picker·T-Pot 맵 iframe·스트리밍·결과카드·PDF 로직 전부 보존**(외과적 편집).
- **검증**: `next build` 통과(타입+lint, 10 라우트), 4개 페이지 200, 디자인 마커 존재, /api/attacks=6·/tpot-map/=200 회귀 없음.
- **어택맵 전용 칸 분리 + 확대(2026-05-24)**: 우측 패널의 작은 맵(440px)을 헤더 아래 전용 `.맵섹션`으로 이동. 이후 폭 피드백 반영해 본문 레이아웃·맵을 함께 **1440→1760px**로 확대(맵 가용폭 ~1010→~1700, 높이 640, 모바일 440). 카드와 끝선 정렬 유지. 텍스트 카피는 앱 동작과 일치 확인(스테일 문구는 코드 주석 1곳뿐).

### 대시보드 구조 재편 — 파이프라인 명시 + 개요밴드 + 맵 접기 (2026-05-24)

사용자 요청(디자인+구조 개선, 추천대로): capstone 대시보드를 사용자의 파이프라인(티팟로그→학습ML 1차 다중분류→2차 LLM→리포트)이 화면에 드러나게 재편.
- **개요 통계 밴드**: 신규 Next `/api/overview`(Spring `/api/overview` 프록시) → 헤더 아래 4-스탯 카드(총 이벤트/분류된 공격/고위험≥70/LLM 분석). 검증: 12/6/4/5.
- **맵 접기/펼치기**: 640px 풀폭 맵에 토글(ChevronUp/Down) 추가 → 컨트롤이 안 밀리게.
- **파이프라인 단계화(우측 패널)**: ①"학습 ML 1차 다중분류" 카드(선택 로그의 ml_label·위험등급·점수·신뢰도·MITRE·허니팟) → ②"LLM 2차 분석"(진행단계+스트리밍+결과+차트) → ③ 리포트(PDF). 단계번호 칩으로 시각화.
- **시각 폴리시**: 스탯카드/분류그리드/단계헤더 토큰 정렬, 빈상태 안내를 3단계 흐름으로.
- lucide 아이콘 추가(Database/ShieldAlert/Flame/Sparkles/Chevron). 로직(d3·실로그·맵프록시·PDF) 전부 보존. `next build` 통과, 4페이지 200, 이모지 0.

### 개요 스탯 카드 클릭 → 로그 필터 (2026-05-24)

개요 4-스탯 배너를 클릭하면 "최근 공격 로그" 목록이 해당 조건으로 필터링.
- 총 이벤트→전체 / 분류된 공격→`_is_attack` / 고위험→위험점수≥70 (클라이언트 필터, ml-analysis 소스) · LLM 분석→`view=llm`(llm-analysis 소스 별도 조회).
- `/api/attacks?view=ml|llm`: ml은 전체 분류 로그(공격+정상, `_is_attack`/`위험점수` 포함, pre-filter 제거), llm은 export/llm 매핑.
- 대시보드: `필터` 상태 + `표시목록`(클라 필터) + 스탯카드 onClick(활성=인디고 링) + 필터 배지/"전체 해제".
- 검증: ml=8(공격6/정상2), llm=5, highrisk=4. 빌드·타입 통과.
- 참고: "총 이벤트" 배너(=logstash-* raw 24h)와 목록(ml-analysis-*)은 출처 인덱스가 달라 수치가 정확히 일치하진 않음(공격/고위험/LLM은 일치).

### T-Pot 메인 카드 통합 — ML Analyzer 제거, Threat Console 단일화 (2026-05-24)

T-Pot nginx 메인 페이지(`docker/nginx/dist/html/index.html`)의 카드 중 **"ML Analyzer"(=Kibana `ml-analysis-dashboard` 링크) 제거**, **"Threat Console" 단일 진입**으로 통합.
- 근거: ML Analyzer·Threat Console **둘 다 우리 추가물**(원본 T-Pot엔 없음. blame: ML Analyzer=`ea3c33171`/2026-05-01/PR#2, Threat Console=`8ff87e06`/PR#4). Threat Console이 이미 **개요/ML분류/LLM분석/모델학습/리포트** 5탭으로 사용자가 원하는 파이프라인(티팟로그→학습ML 1차 다중분류→2차 LLM 분석→리포트)을 전부 포함 → ML Analyzer는 같은 `ml-analysis-*`의 Kibana 뷰라 중복.
- 적용: **PR 트랙**(`tpot-fork/`) + **capstone 스냅샷**(`capstone/tpotce/`) 양쪽 index.html에서 ML Analyzer `<a>` 한 줄 제거. 원본 카드(Attack Map/Cyberchef/Elasticvue/Kibana/Spiderfoot)는 그대로.
- **주의**: PR 트랙 파일은 `feat/threat-console`(PR #4)에 커밋된 것 → 현재 **워킹트리 변경만, 커밋 안 함**. PR 반영하려면 추후 amend 필요.

### capstone 졸작 본체 로컬 git 커밋 + 구 CLAUDE.md 삭제 (2026-05-24)

최근 작업(capstone 풀스택+프론트 리뉴얼)이 버전관리 밖이라 **로컬 git에 올림**(원격 push 없음, 사용자 지시: "로컬로 일단").
- **범위**: `capstone/`만 (사용자 선택). `git init` → 첫 커밋 `0126034`(master, 140파일: backend 58/frontend 25/profiling-service 54/설정 3).
- **`.gitignore`**: `tpotce/`(78MB 스냅샷, tpot-fork에 원본 + `.env` 비밀 포함) · node_modules · build · .gradle · `__pycache__` · `.env`/`*.pkl` 제외. 검증: tpotce 0건 추적, `.env` 미추적 확인.
- **nested .git 정리**: `capstone/profiling-service/.git`(커밋 0개, staged만 방치) 제거 — 무손실. capstone 단일 repo로 통일.
- **구 `T-POT_PR/CLAUDE.md` 삭제**(사용자 지시 "날려도 됨"): 2026-05-04에서 멈춘 구버전, latest.md가 SSoT라 정보손실 없음. (`PROGRESS_REPORT.md`는 미언급이라 유지)
- 미반영: tpot-fork PR 트랙의 미커밋 변경(index.html ML Analyzer 카드 제거 등)은 이번 범위 밖 — 여전히 워킹트리에만 있음.

### capstone 풀스택 로컬호스트 재기동 + ES 샘플 타임스탬프 신선화 (2026-05-24)

사용자 지시 "로컬호스트로 올린다" → capstone 풀스택을 로컬에 재기동.
- **기동 순서**: 죽어있던 `phase1-es`(:19200)·`capstone-postgres`(:5433) `docker start` → postgres healthy 확인 → postgres 연결 실패로 crash 중이던 `capstone-backend`(:8090)와 `capstone-frontend`(:8001) `docker restart` → ollama(:11434)는 계속 healthy. **5컨테이너 전부 Up**, 4페이지(/·login·dashboard·api)·backend health·ollama tags 모두 정상.
- **개요 스탯 0 문제 → 신선화**: ES 샘플(logstash 12/ml-analysis 8/llm-analysis 5)이 5/23 09:53 주입분이라 **27h 전 → overview의 `now-24h` 윈도우 밖**이라 0. 세 인덱스 모두 시간필드 `@timestamp` 단일. `_update_by_query` + painless(`Instant.parse(...).plusMillis(offset)`)로 25개 문서 전부 **+26h offset 일괄 shift**(최신=now-5분, 내부 분포 유지) → overview `events=12/attacks=6/high_risk=4/llm=5` 복원(이전 검증값 일치). failures 0.
- **주의**: backend는 `restart:unless-stopped`라 postgres/ES보다 먼저 뜨면 Hibernate "Unable to determine Dialect"로 crash loop → 의존성 먼저 띄우고 backend restart해야 함. ES 데이터는 시간이 지나면 다시 24h 밖으로 빠지므로 데모 직전 재-shift 필요.

### LLM 제공자 추상화 — Ollama 외 OpenAI/Anthropic/Gemini 추가 (2026-05-24)

사용자 요청: "llm도 ollama 외에 다른거 넣을 수 있게". 확인된 방향: **API 키 없이 코드 골격만 넣고 나중에 키만 채우는 방식**.
- **신규 `frontend/src/lib/llm-providers.ts`**: `LLM제공자` 인터페이스(`호출`/`스트리밍`/`상태확인`) + 구현 4종 — `Ollama제공자`(기존 로직 이동), `OpenAI제공자`(+openai-compatible 재사용: LM Studio·vLLM·Together·Groq, `/v1/chat/completions` SSE, `response_format json_object`), `Anthropic제공자`(`/v1/messages` SSE, content_block_delta), `Gemini제공자`(`:streamGenerateContent?alt=sse`, responseMimeType json). 공통 `SSE라인들` 파서. 팩토리 `제공자생성()`이 env `LLM_PROVIDER`로 분기(기본 ollama).
- **`llm-service.ts` 수정**: `LLM분석서비스`가 provider 주입받아 위임. 기존 `_ollama호출`/`_ollama스트리밍` 제거 → `provider.호출`/`provider.스트리밍`. 재시도·단일/전체리포트 스트리밍·라우트(`/api/analyze/stream`,`/[type]`)·대시보드는 **무변경 재사용**.
- **`health` 라우트**: `제공자` 필드 추가. `Ollama연결`은 대시보드 호환 위해 필드명 유지(=제공자 무관 연결여부).
- **env 배선**: `docker-compose.yml` frontend에 `LLM_PROVIDER`/`LLM_MODEL`/`*_API_KEY` `${VAR:-}` 추가 + **`.env.example`** 신설(키 자리·제공자별 기본모델 안내). `.env`는 gitignore라 키 노출 없음.
- **키 빈값 처리**: `env()` 헬퍼가 빈 문자열도 기본값으로(컴포즈가 미설정 env를 ""로 넘김). 키 없으면 `상태확인()=false`.
- **검증**: `docker build`(=next build 타입/린트) 통과 → v1 compose `ContainerConfig` 버그로 `docker run` 직접 기동. ① ollama 기본: health `제공자=ollama 연결=true`, 4페이지 200, overview 12/6/4, **실제 스트리밍 분석 동작**(시작+토큰 이벤트). ② 임시 `LLM_PROVIDER=openai`: `제공자=openai 모델=gpt-4o-mini 연결=false`(키없음 깔끔 degrade, crash 없음). → 나중에 `.env`에 `LLM_PROVIDER`+키만 채우고 frontend 재기동하면 전환.

### 프론트 디자인 — Navy Pro 테마 (다크 크롬 + 밝은 본문) (2026-05-25)

사용자 요청: 프론트 디자인 수정(전 영역·전 측면). 4개 방향안(Security Console/Navy Pro/Cyber Neon/Refined Light) 중 **Navy Pro** 선택 — 상단바·헤더·auth 브랜드 패널은 다크 네이비 크롬, 본문·카드는 밝게 유지, 강조색 인디고 #4f46e5.
- **globals.css**: ① 강조색 `--accent` #6366f1→**#4f46e5**(hover #4338ca) ② **네이비 크롬 토큰 신설**(`--chrome #0f172a`/`--chrome-2`/`--chrome-text`/`--chrome-text-2`/`--chrome-border`/`--chrome-accent #a5b4fc`) ③ `.topbar` 네이비화 + 자식(brand-name/sub/status-chip) 대비 처리 ④ `.auth-brand` 배경 라이트→네이비 그라데이션(`165deg,#0f172a→#1e293b`) + 격자선·헤드라인·설명·하이라이트 아이콘 전부 라이트 텍스트화 + 허니팟 링 가시성 강화.
- **랜딩 page.tsx**: `.lp-nav` 라이트→네이비(`rgba(15,23,42,0.85)`+blur), 링크/브랜드 대비 처리. hero/features/cta/footer는 밝은 본문 유지.
- **대시보드 page.tsx**: 자체 인라인 `<header>`(=.topbar 아님)를 `var(--chrome)` 네이비로, 헤더제목 span·부제·서버상태칩 대비 처리. 개요밴드·맵·카드·d3·차트는 무변경.
- **로직 무변경**: 토큰/클래스 색상만 교체(외과적). 모든 인터랙션·데이터·프록시·PDF 그대로.
- **검증**: `docker build`(next build) 통과 → `docker run` 교체 기동(v1 compose 버그 회피). 4페이지(/·login·signup·dashboard) 200, served CSS에 `--accent:#4f46e5`/`--chrome:#0f172a`/`--chrome-accent:#a5b4fc` + auth-brand 네이비 그라데이션 + 랜딩 nav `15,23,42` + 대시보드 header `var(--chrome)` 전부 확인. health=ollama 정상 회귀.

### T-Pot 어택맵 연결 실패 복구 (`EAI_AGAIN map_web`) (2026-05-25)

증상: 대시보드 어택맵이 `getaddrinfo EAI_AGAIN map_web`로 연결 실패.
- **원인**: `map_web`·`map_redis` 컨테이너가 21시간 전 종료(둘 다 capstone_default에 존재) → frontend `server.js`의 `/tpot-map/` 프록시가 `map_web` DNS 해석 불가. (`docker exec capstone-frontend getent hosts map_web` 실패 확인)
- **조치**: `docker start map_redis → map_web` (이미지 `ghcr.io/telekom-security/{map,redis}:24.04.1` 보유). DNS 복구(`map_web`→172.18.0.7), `/tpot-map/`=200(맵 HTML `T-Pot Attack Map`), map_web 로그에 WebSocket 연결 활성 확인.
- **재발 방지**: 두 컨테이너 `restart=no`였음(이번 실패 근본 원인) → `docker update --restart unless-stopped map_web map_redis`로 변경. 정지/재부팅 시 자동 재기동.
- 참고: map_web/map_redis는 `capstone/docker-compose.yml`에 없고 별도 `docker run`으로 운영(#10). live 공격 arc는 여전히 map_data+ES 데이터 필요(현재 빈 세계지도, 인프라/프록시는 정상).

### 남은 마무리 / 다음 작업

0. ✅ **(#10 완료) T-Pot 어택맵 리버스프록시**: 커스텀 `server.js`(http-proxy)로 `/tpot-map/*`→map_web:64299/*, `/websocket`→map_web:64299/websocket(WS 업그레이드 포함). next.config standalone 제거, Dockerfile을 전체빌드+node_modules+server.js로 변경, `npm ci`→`npm install`(http-proxy 락 회피), package.json deps에 http-proxy + start=node server.js. env `TPOT_MAP_TARGET`.
   - **검증(전체 infra 없이 map_web+map_redis만 standalone 기동)**: `ghcr.io/telekom-security/{map,redis}:24.04.1`을 capstone_default에 띄움. `/tpot-map/`=200(맵 HTML), 상대경로 static 자산=200, `/websocket`=**101 Switching Protocols**(aiohttp). 맵 JS의 `WS_HOST=//location.host/websocket`이 iframe origin(capstone) 기준이라 프록시가 정확히 처리.
   - **남은 것(실시간 공격 arc)**: map_web UI/소켓은 동작하나 live 공격 데이터는 map_data+ES(+허니팟 트래픽 or 이벤트 주입)가 있어야 채워짐. 현재는 빈 세계지도. (infra_only는 허니팟 제외라 그것만으론 데이터 없음)
   - 검증용 기동: `docker run map_redis(redis:24.04.1)` + `map_web(map:24.04.1, MAP_COMMAND=AttackMapServer.py)` on capstone_default.
1. ✅ ~~compose 재배선~~ 완료. 단 현재 ES는 검증용 phase1-es(샘플데이터). **실 T-Pot 데이터로 전환**하려면 `tpot-fork/compose/infra_only.yml` 띄우고 `ES_HOST`를 그쪽 ES로 변경. (그러면 /api/attacks도 실 공격으로 자동 전환)
2. **Phase 2 (학습+BYOM 7개)**: Dockerfile에 Python 3.11+lightgbm 추가(multi-stage), ProcessBuilder subprocess, 비동기 job 관리, 모델 atomic move + hot-reload.
3. **Phase 3 (PDF 3개)**: OpenHTMLtoPDF + Noto CJK.
4. 가동 중 컨테이너: capstone 풀스택 5개 + 검증용 phase1-es/phase1-postgres(capstone backend가 ES로 사용 중이라 **phase1-es는 유지 필요**), phase1-backend는 중복이라 제거 가능.
5. **SOAR/MISP 제거됨**(당일): shuffle/thehive/cortex/misp 컨테이너·볼륨·네트워크·이미지 전부 삭제 (프로젝트 무관, 자원 회수).

---

## 이전 작업 (2026-05-22 — Phase 0: backend/honeypot 이동)

**날짜:** 2026-05-22
**작업 내용:** **threat-console → Spring Boot 통합 프로젝트 시작, Phase 0 완료** — Flask 기반 `threat-console`을 `backend/honeypot` (Spring Boot 4.0.3) 위에 흡수해 졸작 트랙 단일 백엔드로 만드는 작업 착수.

### 통합 결정사항 (사용자 확인 받음)
1. **재작성 방식**: Spring Boot로 재작성 (단순 코로케이션/단일 컨테이너 다중 프로세스 아님)
2. **위치**: `capstone/backend/honeypot/` 신규 — `capstone/tpotce/docker/threat-console/`의 Flask는 백업으로 그대로 유지 (시연/비교용)
3. **.git 처리**: 자체 `.git` 제거 후 이동 (T-POT_PR 트리에 통합되므로 독립 레포 불필요)
4. **Python subprocess 처리**: Spring Boot Docker 이미지에 Python 3.11 + lightgbm/sklearn/pandas 함께 설치 (1.5GB+ 예상, 단일 컨테이너 유지)
5. **진행 방식**: 단계적 — Phase 1 (조회) → Phase 2 (학습+BYOM) → Phase 3 (PDF)

### Phase 0 (완료) — backend/honeypot 이동

`rsync -a --exclude='.git' --exclude='.gradle' --exclude='build' --exclude='*.iml'`로 `/mnt/d/integration/backend/honeypot/` → `/mnt/d/integration/T-POT_PR/capstone/backend/honeypot/` 복사.

- 결과: 62개 파일, 208KB
- 원본 `/mnt/d/integration/backend/honeypot/` **그대로 보존** (자체 .git 포함 — 백업 역할)
- 통합 검증 완료 후 원본 삭제 결정 예정

### 작업 견적

| Phase | 범위 | 난이도 | 예상 |
|---|---|---|---|
| Phase 0 ✓ | backend 이동 | 하 | 완료 |
| Phase 1 | 조회 4 + Export 2 + Health 7개 엔드포인트 | 중 | 2-3일 |
| Phase 2 | 학습 인프라(Python subprocess) + BYOM 7개 엔드포인트 | 상 | 2-3일 |
| Phase 3 | PDF 리포트 (OpenHTMLtoPDF + Noto CJK) 3개 엔드포인트 | 상 | 2-3일 |

### threat-console 분석 (16개 엔드포인트)

- 조회: `/api/overview`, `/api/ml-stats`, `/api/llm-recent`, `/api/llm-stats`
- Export: `/api/export/ml`, `/api/export/llm`
- 리포트: `/api/report` POST, `/api/report/<id>`, `/api/reports`
- 학습: `/api/train/dataset`, `/api/train/upload`, `/api/train/start`, `/api/train/activate`, `/api/train/jobs`, `/api/train/job/<id>`, `/api/train/active-model`
- BYOM: `/api/model/upload`
- Health: `/api/health`

Flask app.py 678라인, `build_dataset.py`/`train.py` subprocess 호출 구조.

### 핵심 기술 도전 (Phase별)

1. **Phase 1**: ES 8.13 → Spring Data Elasticsearch (또는 elasticsearch-rest-client). 응답 JSON을 Flask 출력과 1:1 동일하게 맞춰야 console.js 그대로 사용 가능.
2. **Phase 2**: ProcessBuilder + 비동기 job 관리. Dockerfile에 Python 추가 시 multi-stage 필요 (JRE base + Python apt 설치). 모델 파일 atomic move 후 hot-reload.
3. **Phase 3**: WeasyPrint(CSS3 paged media) vs OpenHTMLtoPDF/Flying Saucer 시각적 회귀. 한국어 Noto CJK 폰트 임베드.

### 다음 작업

Phase 1 — Phase 1 시작 시 다음을 진행:
1. `build.gradle`에 `spring-boot-starter-data-elasticsearch` 또는 ES Java RestClient 추가
2. `app.py`의 ES 쿼리 8개 분석 후 Spring 서비스로 포팅
3. 7개 엔드포인트 컨트롤러 (가능하면 단일 `ThreatConsoleController`로 묶음)
4. Flask 출력과 응답 JSON 동일 검증

---

## 이전 작업 (2026-05-21 ~ 2026-05-22 — infra_only 프로파일 신설 + 14개 컨테이너 기동)

**날짜:** 2026-05-21 ~ 2026-05-22
**작업 내용:** **허니팟 제외 infra_only 프로파일 신설 + WSL2 로컬에서 14개 컨테이너 기동 완료** — WSL2 + Docker Desktop 환경의 허니팟 빌드/기동 이슈를 우회하기 위해 인프라 전용 compose 프로파일을 새로 만들고 실제 기동까지 검증.

### 1. 신규 파일

`tpot-fork/compose/infra_only.yml` — mac_win.yml에서 허니팟 service 블록 20개(adbhoney, ciscoasa, cowrie, dicompot, dionaea, elasticpot, heralding, honeyaml, ipphoney, mailoney, medpot, miniprint, redishoneypot, sentrypeer, tanner_redis, tanner_phpox, tanner_api, tanner, snare, wordpot) 제거. 남은 서비스 12개:

- 필수: `tpotinit`, `elasticsearch`, `kibana`, `logstash`, `nginx`
- 패시브 센서: `fatt`, `suricata` (호스트 네트워크 스니핑, 허니팟 아님)
- 보조: `map_redis`, `map_web`, `map_data`, `ewsposter`, `spiderfoot`

네트워크도 허니팟용 17개 제거, 4개만 유지 (tpotinit_local, suricata_local, nginx_local, ewsposter_local).

설계 의도: 기존 `docker-compose.yml`(=mac_win.yml 복사본) 손대지 않음 → 필요시 풀스택 복귀 쉬움. `sidecars_overlay.yml` 그대로 재사용. PR 트랙 영향 0 (이 파일은 PR 제출 대상 아닌 로컬 개발용).

### 2. 환경

- WSL2 (사용자 kdh20), Docker Desktop 29.1.3 + Compose 2.40.3
- WSL2 eth0 IP: `172.22.96.204`
- 데이터 경로: `/home/kdh20/tpotce/data` (WSL2 ext4, NTFS /mnt/d/ 불가)
- 작업 디렉토리: `/mnt/d/integration/T-POT_PR/tpot-fork/`

### 3. .env 수정

- `TPOT_DATA_PATH=/home/kimdonghyun0918/tpotce/data` → `/home/kdh20/tpotce/data` (이전 머신 경로 잔존)

### 4. 기동 명령

```bash
cd /mnt/d/integration/T-POT_PR/tpot-fork
docker compose --project-directory . -f compose/infra_only.yml up -d
docker compose --project-directory . -f compose/infra_only.yml -f compose/sidecars_overlay.yml up -d --build ml-classifier threat-console nginx
```
※ `--project-directory .` 필수. 없으면 `-f compose/...` 때문에 project dir이 `compose/`로 잡혀 .env 미로딩 + 빈 변수 평가 에러 발생.

### 5. 기동 중 발생/해결한 이슈

1. **suricata/fatt OCI mount 에러** (Docker Desktop WSL2 바인드마운트 캐싱 버그): tpotinit이 데이터 디렉토리 만들기 전에 컨테이너 시작 시도. `docker rm -f <stuck>` 후 `up -d` 재실행으로 해결 (5/7 노트의 기존 알려진 패턴).
2. **사이드카 PermissionError**: `/data/ml-classifier`, `/data/threat-console`는 tpotinit이 모르는 디렉토리. Docker가 자동 mkdir 시 root 소유로 만듦 → 컨테이너 uid 2000 권한 거부.
   - 해결: `docker exec tpotinit chown -R 2000:2000 /data/ml-classifier /data/threat-console` + chmod u+rwX,g+rwX + 사이드카 restart.
   - **재발 가능성**: 데이터 디렉토리 통째 삭제 후 재기동 시 같은 문제 재현. infra_only.yml에 init container 추가하거나 사이드카 Dockerfile에서 USER 변경 검토 필요.
3. **nginx HTTP 500 (`pread() nginxpasswd failed: Is a directory`)** — 5/7 노트의 알려진 이슈 재현. tpotinit이 `.env`의 base64 WEB_USER를 디코딩해 `/data/nginx/conf/nginxpasswd` 파일에 써야 하는데 빈 path 탐지 후 디렉토리로 mkdir해버림.
   - 해결: `docker exec tpotinit sh -c 'rm -rf /data/nginx/conf/nginxpasswd && echo "<WEB_USER_BASE64>" | base64 -d > /data/nginx/conf/nginxpasswd && chmod 644 ...'` 후 nginx 컨테이너 **rm + recreate** (단순 restart는 마운트 캐싱 버그로 실패 — inode 잔존).
   - 검증: `curl -ksI https://IP:64297/` → 401 (basic auth challenge), `-u admin:admin` → 200, `/kibana/` → 302, `/threat-console/` → 200.

### 6. 최종 상태 (14 containers)

| 종류 | 컨테이너 |
|---|---|
| healthy | tpotinit, elasticsearch, kibana, logstash, spiderfoot, threat-console |
| Up | nginx, ml-classifier, fatt, suricata, map_data, map_web, map_redis, ewsposter |

### 7. 접속 URL (Windows 브라우저)

- T-Pot 메인: `https://172.22.96.204:64297` (admin/admin)
- Kibana: `https://172.22.96.204:64297/kibana`
- threat-console: `https://172.22.96.204:64297/threat-console/`
- ES 직접 (localhost only): `http://127.0.0.1:64298`

### 8. 관찰

- ml-classifier 첫 폴링 사이클: `polled=106 indexed=4 errors=102` — 기존 logstash-* 인덱스에 ml 필드 mapping 충돌 가능성. ES `ml-analysis-*` 인덱스 mapping 확인 필요.
- 실제 공격 트래픽 없는 환경(허니팟 제외)이므로 logstash-* 인덱스는 거의 비어있을 것 — 실데이터 검증은 CSV 주입 필요.

### 9. 다음 작업 후보

1. ml-classifier `errors=102` 원인 파악 (ES mapping 충돌 vs 필드 타입 불일치)
2. 5/3 작업의 CSV 주입 스크립트로 실 공격 로그 ES에 주입 → 사이드카 동작 검증
3. ML 모델 학습 (threat-console UI Step 1→2)
4. capstone 트랙: backend/honeypot ↔ T-Pot ES 연동 (InternalController)

---

## 이전 작업 (2026-05-16 — backend/honeypot ↔ profiling-service 통합)

**작업 내용:** **backend/honeypot ↔ profiling-service 코드 통합** — `/mnt/d/integration/backend/honeypot/`를 메인 백엔드로 채택, `T-POT_PR/capstone/profiling-service/`의 개선사항을 흡수. T-Pot 측 백엔드(profiling-service)는 치우고 backend/honeypot으로 단일화 방향.

**통합 범위:** 코드만 (Dockerfile/docker-compose 손대지 않음)

**수정된 파일 (backend/honeypot 안):**
- `config/SecurityConfig.java` — 인증 제외 경로에 `/api/health`, `/api/internal/**` 추가
- `domain/AttackLog.java` — payload 필드 `@Column(columnDefinition = "TEXT")` 추가, 한글 주석 제거
- `service/AnalysisService.java` — `@Value("${fastapi.url}")` 환경변수화, null 처리, `RestClientException` 폴백 (실패 시 riskScore=50/MEDIUM 반환)
- `src/main/resources/application.yaml` — DB 설정 환경변수화 (`${SPRING_DATASOURCE_*}`), `fastapi.url`, `internal.service-token` 추가, `show-sql: false`

**신규 추가:**
- `controller/InternalController.java` — T-Pot ES→Postgres 동기화용 내부 API. `X-Service-Token` 헤더 검증, 유저/프로젝트 자동 생성 후 AttackLog 저장
- `dto/InternalAttackLogRequest.java` — InternalController용 DTO

**제거:**
- `dto/ErrorResponse.java`
- `exception/GlobalExceptionHandler.java`
- `exception/` 디렉토리 (비게 됨)

**선택 사항 (사용자 결정):**
1. GlobalExceptionHandler/ErrorResponse → 제거 (profiling-service에 없음)
2. application.yaml DB → 환경변수화 (profiling-service 방식)
3. `T-POT_PR/capstone/profiling-service/` 원본 → 그대로 유지 (삭제 안 함, 비교 가능)

**검증:**
- `backend/honeypot/src` vs `profiling-service/src` 파일 목록 비교 → 완전 일치 (diff empty)

**주의/남은 작업:**
- application.yaml 기본값이 `postgres:5432` + password `postgres`로 변경됨 → 기존 로컬 dev(`localhost:5432`, password `9134246c`)에서 돌리려면 환경변수 export 또는 IDE Run Configuration 설정 필요
- `backend/honeypot/build/`는 손대지 않음 (다음 빌드 때 재생성)
- 다음 통합 대상: frontend(=joljak33-main의 Next.js) ↔ T-POT_PR/capstone/frontend (도커 제외)

---

## 이전 작업 (2026-05-07 — 두 트랙 분리)

**작업 내용:** **두 트랙 분리** — `capstone/` 디렉토리 신설하여 졸작용 풀스택 분리. `tpot-fork/`는 PR 전용 유지.

**capstone/ 구조 (오늘 만든 것):**
```
capstone/
├── tpotce/             # tpot-fork 스냅샷 (rsync, .git/build/__pycache__ 제외, 78MB)
├── profiling-service/  # joljak33-main/profiling-service/honeypot 복사 (Spring Boot 4.0.3 + Dockerfile, 130 파일)
├── frontend/           # joljak33-main/joljak33-main 복사 (Next.js 15 + Dockerfile, 22 파일)
└── README.md           # 졸작 본체 안내 + PR 트랙과의 분리 명시
```

**소스 위치 발견:**
- Spring Boot: `joljak33-main/profiling-service/honeypot/` (구버전 `/profiling-service/`보다 최신 — InternalController/InternalAttackLogRequest 추가됨)
- Next.js: `joljak33-main/joljak33-main/` (포트 8001, login/signup/dashboard, d3 지도)
- 두 컴포넌트 모두 자체 Dockerfile 보유 (Spring: temurin-17 multi-stage, Next: node-20 standalone)

**다음 작업 (capstone 트랙):**
1. `capstone/docker-compose.yml` 통합 작성 — T-Pot + profiling-service + frontend + Ollama 한 번에 기동
2. profiling-service의 PostgreSQL 비번 평문 노출 정리 (application.yaml → 환경변수)
3. T-Pot ES → Postgres 동기화 잡 작성 (logstash-* / ml-analysis-* / llm-analysis-* → AttackLog/AnalysisResult)
4. Spring Boot가 의존하는 외부 분석 엔드포인트(`127.0.0.1:8000/analyze`)를 ml-classifier+llm-analyzer 사이드카로 연결할지, Next.js + Ollama 직접 호출로 갈지 결정

---

## 이전 작업 (2026-05-07 — WSL2 로컬 기동 + fork 푸시 + 이모지 정리)

**오늘 한 일 요약:**
1. WSL2 + Docker Desktop 환경에서 풀 T-Pot 스택 정상 기동 (35개 컨테이너)
2. nginx 라우팅 + 메인 페이지에 threat-console 카드 노출 (sidecars_overlay.yml에 conf+html 마운트)
3. PR 전략 (B): 기존 PR #2/#3 amend + 신규 `feat/threat-console` 브랜치 생성
4. fork(`Donghyun0918/tpot-based`)에 5개 브랜치(`master` + 4 PR) 푸시 완료
5. UI 코드 이모지 제거 (PR 커밋에 들어간 7개 이모지: index.html, style.css, console.js)

**커밋 변동:**
- `feat/ml-classifier`: `26c39d21` → `ea3c3317` (amend)
- `feat/llm-analyzer`: `44b7a7dd` → `723ffdc3` (rebase + amend)
- `feat/threat-console`: `eebcddf0` → `e8631dd8` (이모지 제거) → `f316c083` (베이스 master→feat/ml-classifier 재정렬, nginx 충돌 해결: ML Analyzer + Threat Console 둘 다 유지) → `8ff87e06` (BYOM `/api/model/upload` 추가)

**BYOM 추가 사항 (PR #4):**
- 백엔드: `POST /api/model/upload` — multipart로 `multi_model.pkl`(필수) + `encoders.json`(선택). joblib 로드 + `predict`/`predict_proba` 인터페이스 검증 후 `MODEL_ACTIVE_DIR` 안 임시 staging에서 atomic move. ml-classifier가 mtime 변경 감지로 자동 재로드.
- UI: 모델 학습 탭에서 "현재 활성 모델" 패널 바로 아래 "사전 학습 모델 직접 업로드 (BYOM)" 패널 추가. 학습 파이프라인 우회 경로.
- 검증: 가짜 .pkl → `pickle load failed`, 실 sklearn 모델 → 활성화 + 60초 후 ml-classifier가 `model files changed on disk → reloading` 로그 확인.

**환경:**
- WSL2 (Ubuntu), Docker Desktop for Windows
- WSL2 IP: `172.23.8.225` (재부팅 시 변동)
- 데이터 경로: `~/tpotce/data/` (WSL2 ext4 — NTFS /mnt/d/ 불가)

**로컬 머신 한정 변경 (커밋 안 됨, 머신별):**
- `.env`: `WEB_USER=admin/admin htpasswd`, `TPOT_PULL_POLICY=missing`, `TPOT_DATA_PATH=~/tpotce/data`, `TPOT_OSTYPE=win`
- `docker-compose.yml`: `compose/mac_win.yml`로 교체 (Docker Desktop은 network_mode:host 미지원)
  - 원본 백업: `docker-compose.yml.standard_bak`
- `setup_local.sh`: WSL2 setup 스크립트 (커밋 제외 — PR 노이즈 우려)
- `latest.md`: 이름 변경 (구 CLAUDE.md → latest.md, 2026-05-07)

**커밋된 PR #4 변경 (feat/threat-console):**
- `compose/sidecars_overlay.yml`: nginx 볼륨 오버라이드 (tpotweb.conf + index.html 마운트)
- `compose/local_dev.yml`, `compose/threat_intel.yml`: 신규 프로파일
- `docker/threat-console/`, `docker/ml-classifier/training/`: 신규
- `docker/nginx/dist/{conf/tpotweb.conf, html/index.html}`: threat-console 라우트 + 카드

**트러블슈팅:**
1. `tpotinit` unhealthy: `TPOT_OSTYPE=linux` + Docker Desktop 감지 충돌 → `TPOT_OSTYPE=win` + mac_win.yml로 해결
2. 허니팟 컨테이너 `Created` stuck: Docker Desktop 바인드마운트 캐싱 버그 (tpotinit이 디렉토리 생성 후 타이밍 이슈) → `docker rm` 후 `docker compose up -d` 재실행으로 해결
3. 사이드카 빌드 실패: `credsStore=desktop.exe` VSock 에러 → `docker pull python:3.11-slim` 수동 선행 후 해결
4. nginx HTTP 500 on `/threat-console/`: 두 가지 이슈
   - 기본 T-Pot nginx conf에 threat-console 라우트 없음 → `sidecars_overlay.yml`에 nginx 볼륨 오버라이드 추가 (수정 conf 마운트)
   - `~/tpotce/data/nginx/conf/nginxpasswd`가 파일 아닌 **디렉토리**로 생성됨 (tpotinit이 빈 path 탐지 후 mkdir) → tpotinit 안에서 `rmdir` 후 admin/admin htpasswd 파일로 재생성

**현재 실행 중인 컨테이너 (35개):**
- 핵심: tpotinit(healthy), elasticsearch(healthy), kibana(healthy), logstash(healthy), nginx
- 허니팟: adbhoney, ciscoasa, cowrie, dicompot, dionaea, elasticpot, fatt, h0neytr4p, heralding, honeyaml, ipphoney, mailoney, medpot, miniprint, p0f, redishoneypot, sentrypeer, snare, suricata, tanner, tanner_api, tanner_phpox, tanner_redis, wordpot
- 사이드카: **threat-console(healthy)**, **ml-classifier(Up)**
- 기타: map_data, map_redis, map_web, ewsposter, spiderfoot

**접속 주소 (Windows 브라우저):**
- T-Pot 웹UI: `https://172.23.8.225:64297` (admin/admin)
- Kibana: `https://172.23.8.225:64297/kibana`
- threat-console: `https://172.23.8.225:64297/threat-console/`
- WSL2 NAT로 외부 공격 차단 — 방화벽/포트포워딩 불필요

**주의:** WSL2 IP는 재부팅 시 변동. 변경 시 Windows 브라우저에서 접속 불가 → `ip addr show eth0` 로 확인

**남은 작업:**
- 클라우드 서버에서 수집한 CSV 로그를 로컬 ES에 주입 (csv_to_es.py)
- ML 모델 학습 (threat-console UI 또는 train.py)
- PR #4 (feat/threat-console) 브랜치 정리 및 제출

---

## 이전 작업 (2026-05-04 → nginx 403 해결)

**작업 내용:** nginx HTTP 403 해결 (권한 770→774) + 클라우드 서버 파일 동기화 검증 완료

---

## 이전 작업 (2026-05-03)

**작업 내용:** LGBM 단순화 + 이진 분류기 제거 → 클라우드 서버 배포까지 완료

**클라우드 서버 정보 (현재 운영):**
- 퍼블릭 IP: **100.54.149.84** (이전 100.53.15.194에서 재부팅 후 변경)
- SSH: `ssh -i ~/tpot-key.pem -p 64295 ubuntu@100.54.149.84`
- T-Pot 경로: `/home/ubuntu/tpotce/`
- 사이드카 운영: `compose/sidecars_overlay.yml` (overlay 방식, 표준 docker-compose.yml 위에 ml-classifier + threat-console만 추가)
- 빌드된 이미지: `tpot/ml-classifier:local`, `tpot/threat-console:local`
- llm-analyzer는 미운영 (Ollama 백엔드 없음)

**코드 변경 (서버 반영 완료):**
- `train.py` → LGBM 단일 + multi-class only
- `dist/requirements.txt` → xgboost 제거, **lightgbm 추가** (런타임 추론용)
- `Dockerfile` → **`libgomp1` apt 설치 추가** (LightGBM OpenMP 의존)
- `classify.py` → 이진 분류기 제거, `rule_label.is_attack()` 라벨 기반 재계산
- `threat-console` UI/API → 알고리즘 select / 비교 모드 통째 제거
- `llm-analyzer` → `ml_binary_conf` → `ml_multi_conf` 필드 변경
- README 2건 갱신 + BYOM 가이드 추가

**검증 (서버에서 실측):**
- 학습 1회 (2000행, LGBM 1.1초) → multi acc 0.99, macro-F1 0.9791
- metrics.json에 binary 키 부재 ✅
- 모델 디렉토리에 `multi_model.pkl`만 (binary_model.pkl 없음) ✅
- ml-classifier 로그: `multi model loaded`, hot-reload 동작 ✅
- ES 새 도큐먼트: `model_used=ml`, `ml_binary_conf` 필드 없음 ✅
- 지난 1분 동안 62건 모두 ML 분류기로 처리 ✅

**서버 사용자 환경 보존:**
- `~/tpotce/.env` (WEB_USER 비밀번호) 미수정
- `~/tpotce/docker-compose.yml`, `compose/standard.yml` (사용자 nginx 호스트 마운트 추가) 미수정
- `~/tpotce/data/nginx/{html/index.html, conf/tpotweb.conf}` (사용자 한국어 페이지 + threat-console 라우팅) 미수정 — 이미 5/1에 사용자가 적용해놓음
- 백업 위치: 서버 `/tmp/tpot-pre-rsync-backup-20260502/`

**남은 작업 (다음 차):**
- 클라우드 인스턴스에 Elastic IP 붙여서 IP 변경 방지 권장
- llm-analyzer 운영하려면 Ollama 백엔드 결정 (서버 LAN의 `ollama.local` 미해석 — Beelzebub LLM 설정 가짜? 또는 별도 머신?)
- PR #2/#3 코드(`classify.py`, `llm-analyzer`)도 수정됐으니 기존 브랜치 amend/rebase 필요
- 모델 업로드 UI/엔드포인트(BYOM) 별도 작업
- PR 제출 전 새 브랜치 `feat/threat-console`로 분리 후 깔끔한 커밋 구성

---

**갱신 규칙:** 작업 끝날 때마다 "마지막 작업" 섹션과 "PR 진행 현황" 표를 갱신할 것.
