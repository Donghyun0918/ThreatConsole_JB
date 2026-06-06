# 캡스톤 33팀 — 졸업작품 본체

> **이 디렉토리가 졸업작품 시연 본체입니다.**
> 본가 PR 기여용 코드는 `../tpot-fork/`에 별도 분리되어 있습니다.

## 두 트랙 분리

| | 위치 | 목적 | 포함 |
|---|---|---|---|
| **PR 트랙** | `../tpot-fork/` | telekom-security/tpotce 본가에 PR 제출 | T-Pot 포크 + 사이드카 모듈만 |
| **졸작 트랙** | `./` (이곳) | 졸업작품 심사 시연 | T-Pot + Spring Boot + Next.js + Ollama 통합 |

PR 트랙은 본가 컨벤션 (drop-in 사이드카, 영어, 머신 의존성 0)을 따라야 하므로 Spring Boot/PostgreSQL/Next.js를 포함하지 않습니다. 졸작 트랙은 그 위에 팀이 직접 만든 풀스택을 얹어 시연합니다.

## 디렉토리 구조

```
capstone/
├── tpotce/             T-Pot 포크 본체 (../tpot-fork 스냅샷, .git 제외 복사)
├── profiling-service/  Spring Boot 4.0.3 + JPA + JWT (PostgreSQL 사용)
├── frontend/           Next.js 15 (login/signup/dashboard) — Ollama 직접 호출
├── docker-compose.yml  통합 compose (T-Pot + profiling + frontend + ollama) — 다음 단계
└── README.md           이 파일
```

### tpotce/ — T-Pot 포크 본체

`../tpot-fork/`의 스냅샷. 졸작 시점에 freeze하고 그 이후엔 capstone/ 안에서 자유롭게 수정합니다. 사이드카 4개 (한국어 Kibana, ml-classifier, llm-analyzer, threat-console)가 포함되어 있습니다.

### profiling-service/ — Spring Boot 백엔드

JWT 인증으로 User/Project/AttackLog/AnalysisResult를 관리합니다. T-Pot Elasticsearch에서 공격 로그를 가져와 PostgreSQL에 미러링하고, Project 단위로 권한을 적용한 뷰를 제공합니다.

핵심 엔드포인트:
- `POST /api/users/{signup,login}` — 회원가입/로그인 (JWT)
- `GET /api/projects/my` — 내 프로젝트 목록
- `GET /api/projects/{id}/logs` — 프로젝트별 공격 로그 + 분석 결과
- `POST /api/attack-logs` — 로그 적재 (분석 자동 트리거)
- `POST /api/analysis-results` — 분석 결과 저장

### frontend/ — Next.js UI

Spring Boot 백엔드 + Ollama LLM을 소비하는 한국어 사용자 화면입니다. 로그인/회원가입, 대시보드, d3 기반 공격 지도 등을 포함합니다. 포트 8001.

## 데이터 흐름 (계획)

```
공격자 → 허니팟(T-Pot 23종)
           ↓
       Logstash → ES logstash-*
           ↓
   ml-classifier → ES ml-analysis-*
           ↓
   llm-analyzer  → ES llm-analysis-*
           ↓
    [동기화 잡] → PostgreSQL (profiling-service)
                       ↓
                  Spring Boot REST API (8080)
                       ↓
                  Next.js Frontend (8001)
                       ↓
                       사용자
```

T-Pot 자체 화면(Kibana 한국어 + threat-console)은 그대로 두고, 그 위에 Spring/Next.js 레이어를 추가하는 구조입니다. 두 화면은 같은 데이터를 다른 시각에서 보는 경로일 뿐 충돌하지 않습니다.

## 실행 (작업 예정)

```bash
cd /mnt/d/T-POT_PR/capstone
docker compose up -d
# T-Pot UI:           https://172.23.8.225:64297 (admin/admin)
# Spring Boot API:    http://localhost:8080
# Next.js Frontend:   http://localhost:8001
# Ollama:             http://localhost:11434
```

통합 docker-compose.yml은 별도 작업 항목입니다 (T-Pot + profiling + frontend + ollama 한 번에 기동).

## 절대 하지 말 것

- 이 디렉토리 안의 변경을 `../tpot-fork/`로 복사하지 말 것 (PR 오염 방지)
- 본가에 PR 제출 시 `../tpot-fork/`만 사용
- profiling-service의 PostgreSQL 패스워드는 시연 후 반드시 변경
