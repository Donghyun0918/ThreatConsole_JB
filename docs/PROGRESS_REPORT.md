# T-Pot 한국어 위협 분석 모듈 통합 — 진행 보고

> 캡스톤 33팀. T-Pot(Telekom Security) 포크에 ML 분류 + LLM 위험도 분석 + 통합 한국어 콘솔을 모듈로 추가하여 본가에 PR 기여하는 프로젝트.

---

## 1. 프로젝트 방향성

### 1-1. 초기 구상

자체 로컬 플랫폼(`honeypot-integrated`) — 7종 허니팟 + Kali 공격자 컨테이너 + ML 분류 + LLM 분석 + Spring Boot 프로파일링 + Next.js 대시보드를 docker-compose로 묶은 통합 플랫폼.

### 1-2. 피벗 결정 (2026-04-30)

로컬 시뮬레이션의 데이터 다양성·실효성 한계로, **T-Pot 포크에 모듈을 얹어 PR**하는 방식으로 전환.

| 결정 | 내용 |
| --- | --- |
| 본체 | T-Pot 포크 (`tpotce/`)가 본체. `honeypot-integrated/`는 참고용 자산 |
| Spring Boot + PostgreSQL | 폐기. T-Pot Elasticsearch에 `ml-analysis-*`, `llm-analysis-*` 인덱스로 흡수 |
| 프론트엔드 | Next.js 폐기. 한국어 라벨 Kibana saved objects (`.ndjson`) + threat-console (Flask) |
| PR 전략 | 가벼운 것부터 단계적: #1 한국어 Kibana → #2 ML 사이드카 → #3 LLM 사이드카 → #4 통합 콘솔 |
| 백업 플랜 | Issue 반응이 부정적이면 PR 포기, 포크 자체를 졸업작품으로 확정 |

---

## 2. PR 구성 및 현황

| PR | 브랜치 | 모듈 | 상태 |
| --- | --- | --- | --- |
| #1 | `feat/korean-kibana` | 한국어 라벨 Kibana saved objects | 로컬 커밋 완료 |
| #2 | `feat/ml-classifier` | ML 분류 사이드카 (LightGBM) | 로컬 커밋 완료 |
| #3 | `feat/llm-analyzer` | 한국어 LLM 위험도 요약 사이드카 | 로컬 커밋 완료 |
| #4 | (분리 예정) | Threat Console — 통합 한국어 콘솔 | 미커밋, AWS EC2에 배포·검증 완료 |

---

## 3. 모듈 구성

### 3-1. ml-classifier (PR #2)

T-Pot의 `logstash-*` 인덱스를 폴링하여 각 허니팟 이벤트를 분류, 결과를 `ml-analysis-YYYY.MM.dd`에 기록하는 사이드카.

| 출력 필드 | 의미 |
| --- | --- |
| `ml_label` | `Recon`, `Brute Force`, `Malware`, `Intrusion`, `Etc` 중 하나 |
| `ml_is_attack` | 라벨이 `Etc`이면 `false`, 아니면 `true` (라벨 기반 자동 판정) |
| `ml_multi_conf` | 0–100 신뢰도 (rule-based fallback 시 100) |
| `mitre_score` | MITRE ATT&CK 위협 점수 0–100 |
| `mitre_technique` | MITRE 기법 ID (예: `T1110`, `T1046`) |
| `model_used` | `rule` 또는 `ml` |

**폴백 동작:** 학습된 모델이 없으면 `rule_label.py`의 결정론적 룰 사용 (Suricata 알림 카테고리 / Cowrie eventid / 페이로드 패턴 등).

### 3-2. llm-analyzer (PR #3)

`ml-analysis-*` 도큐먼트 중 `mitre_score >= 70`인 고위험 이벤트만 한국어 LLM(Ollama)으로 2차 분석. 결과는 `llm-analysis-*`에 기록.

출력: `summary_ko`, `solution_ko`, `severity` (LOW/MEDIUM/HIGH/CRITICAL), `risk_score` (0–10), `ttp_inferred` (MITRE 기법 ID 배열).

### 3-3. threat-console (PR #4 후보)

Flask 기반 통합 한국어 웹 UI. T-Pot nginx에 `/threat-console/` 경로로 마운트.

| 탭 | 기능 |
| --- | --- |
| 개요 | 24시간 카드 (총 이벤트 / 분류된 공격 / 고위험 / LLM 분석) + 시계열 + MITRE 점수 분포 |
| ML 분류 | 공격 유형 도넛 + 허니팟별 막대 |
| LLM 분석 | 심각도/위험도 차트 + 한국어 요약 표 (필터 가능) |
| 리포트 | 기간 선택 → 한국어 PDF 리포트 생성 |
| 모델 학습 | ES에서 데이터셋 자동 빌드 → LightGBM 학습 → 활성화 (UI에서 한 번에) |

ES는 읽기 전용. 인덱스나 saved object 수정하지 않음.

---

## 4. 이번 주 핵심 작업 — ML 학습 파이프라인 단순화

### 4-1. 발단

학습 파이프라인 비교 모드(RF / LightGBM / XGBoost / LogReg / GBM 5종) 실행 시 XGBoost에서 다음 오류 발생:

```
ValueError: Invalid classes inferred from unique values of `y`.
Expected: [0], got [1]
```

학습 결과를 보면 RF/LightGBM의 이진 분류 정확도가 모두 1.0. 의심스러워서 분석.

### 4-2. 원인 분석

`_to_binary` 함수는 `ATTACK_LABELS = {Recon, Brute Force, Malware, Intrusion}`인 라벨을 1, 그 외(`Etc`)를 0으로 매핑.

- T-Pot ES 데이터 30,000행을 분석하니 **`Etc` 라벨 0건** — 모든 트래픽이 공격
- 결과적으로 이진 라벨 `yb`는 전부 1
- RF/LightGBM은 단일 클래스로 fit해 항상 1을 예측 → test도 전부 1이라 정확도 100% (가짜 신호)
- XGBoost는 `[0, 1]` 시작을 강제해 단일 클래스 거부 → 위 오류

**근본 원인:** 허니팟 본질상 "정상 vs 공격" 이진 분류는 구조적으로 정의 불가. 정상 트래픽이 honeypot에 거의 들어오지 않음.

### 4-3. 해결 방향

| 항목 | 변경 |
| --- | --- |
| ML 이진 분류기 | **제거**. `rule_label.is_attack(label)` 이 라벨 기반(`Etc` 외 = 공격)으로 처리 |
| 알고리즘 5종 비교 모드 | 제거. **LightGBM 단일** 기본값 |
| 다른 알고리즘 사용 | BYOM(Bring Your Own Model). 사용자가 직접 학습한 `multi_model.pkl` 업로드 |

### 4-4. 영향 파일

| 파일 | 변경 |
| --- | --- |
| `training/train.py` | 통째 재작성 — LightGBM 다중분류만, 비교 모드 / 알고리즘 옵션 / 이진 블록 / `ATTACK_LABELS` / `_to_binary` 모두 제거 |
| `training/requirements.txt` | xgboost 제거 |
| `dist/requirements.txt` | **lightgbm 추가** (런타임 추론용) |
| `dist/Dockerfile` | **`libgomp1` apt 설치 추가** (LightGBM OpenMP 의존) |
| `dist/classify.py` | binary 블록 제거, `is_atk = rule_label.is_attack(label)` 로 multi 결과 기반 재계산, `ml_binary_conf` 필드 삭제 |
| `threat-console` UI/API | 알고리즘 select / 비교 모드 체크박스 / 비교 결과 표 / `algorithm` 파라미터 제거 |
| `llm-analyzer` | `ml_binary_conf` → `ml_multi_conf` 필드 변경 |
| README 2건 | LightGBM 기준 + BYOM 가이드로 갱신 |

---

## 5. AWS EC2 클라우드 배포

### 5-1. 환경

| 항목 | 값 |
| --- | --- |
| 서버 | AWS EC2 (Ubuntu) |
| 퍼블릭 IP | 변동성 있음 — `100.53.15.194` → `54.82.84.210` → `100.54.149.84` (Elastic IP 미부착, stop/start 시 변경) |
| SSH | `ubuntu@<IP>:64295` (T-Pot 표준), 키 인증 (`tpot-key.pem`) |
| 웹 | `https://<IP>:64297/` (HTTPS only, basic auth) |
| T-Pot 경로 | `/home/ubuntu/tpotce/` (24.04.1 master) |
| 사용자 환경 보존 | `.env`(WEB_USER), `docker-compose.yml`/`standard.yml`(nginx 호스트 마운트), `data/nginx/{html,conf}/` (한국어 랜딩 페이지 + threat-console 라우팅) — 모두 5/1에 사용자가 직접 작성. 손대지 않음 |

### 5-2. 통합 방식 — Overlay Compose

표준 T-Pot의 `docker-compose.yml`은 그대로 두고, 사이드카만 정의한 `compose/sidecars_overlay.yml` 을 추가 적용:

```bash
docker compose -f docker-compose.yml -f compose/sidecars_overlay.yml \
    up -d --build threat-console ml-classifier
```

이렇게 하면 T-Pot 표준 22개 컨테이너에 영향 없이 ml-classifier + threat-console 두 컨테이너만 추가 기동. 빌드 컨텍스트는 `./docker/{ml-classifier,threat-console}/`. 이미지는 `tpot/{ml-classifier,threat-console}:local` 로컬 태그.

### 5-3. 검증 (실측)

| 항목 | 결과 |
| --- | --- |
| 학습 1회 (실 ES 데이터 2,000행, LightGBM) | 1.1초, multi accuracy **0.99**, macro-F1 **0.9791** |
| 학습 결과 metrics.json | `binary` 키 없음, `algorithm: "lgbm"` |
| 모델 디렉토리 | `multi_model.pkl` + `encoders.json` + `metrics.json` + `confusion_multi.txt` (binary_model.pkl 없음) |
| 모델 활성화 → ml-classifier hot-reload | 로그 `model files changed on disk → reloading` → `multi model loaded` |
| ES `ml-analysis-*` 새 도큐먼트 키 | `ml_binary_conf` 부재 (필드 정상 제거됨) |
| 활성화 직후 1분간 분류 결과 | 62건 모두 `model_used: ml` (rule fallback 0건) |
| 19개 핵심 파일 md5 (로컬 vs 서버) | 완전 일치 (`ALL_IDENTICAL`) |

---

## 6. 운영 중 발견한 이슈와 해결

### 6-1. lightgbm 패키지 누락 (런타임)

**증상:** 모델 활성화 후 ml-classifier 로그 `model reload failed: No module named 'lightgbm'`.
**원인:** `dist/requirements.txt` 에는 추론용 패키지만 있어 lightgbm 미포함. 학습은 LightGBM이지만 추론은 sklearn-only로 가정한 옛 구조.
**해결:** `dist/requirements.txt`에 `lightgbm==4.5.0` 추가, 이미지 리빌드.

### 6-2. libgomp1 시스템 라이브러리 누락

**증상:** 위 패키지 추가 후 `OSError: libgomp.so.1: cannot open shared object file`.
**원인:** LightGBM이 OpenMP 의존. `python:3.11-slim` 이미지에는 OpenMP 런타임 미포함.
**해결:** ml-classifier `Dockerfile`에 `apt-get install -y libgomp1` 추가.

### 6-3. nginx HTTP 403

**증상:** 사용자가 `https://<IP>:64297/` 접속 시 `HTTP 403`.
**원인:** 호스트 마운트 파일 `~/tpotce/data/nginx/html/index.html` 권한이 `tpot:tpot 770`. nginx 컨테이너의 `nginx` user는 호스트 `tpot` 그룹 멤버 아니라 `Permission denied (13)`.
**1차 해결:** `chmod a+r` (770 → 774). nginx reload.
**재발:** EC2 재기동 후 `tpotinit` 컨테이너가 데이터 디렉토리 권한 초기화하면서 다시 770으로 reset.
**영구 해결:** `chmod 644` + `chattr +i` (immutable bit). 이후 어떤 chmod 시도도 EPERM으로 실패해서 644 영구 유지.

### 6-4. EC2 퍼블릭 IP 변동

**증상:** 인스턴스 stop/start 시마다 퍼블릭 IP 변경. 작업 도중 SSH 끊기는 일이 반복.
**임시 대응:** 사용자가 새 IP 알려주면 `~/.ssh/known_hosts` 업데이트 후 재접속.
**영구 해결책 (다음 주):** Elastic IP 부착.

---

## 7. 다음 주 계획

| 우선순위 | 작업 |
| --- | --- |
| 높음 | EC2에 Elastic IP 부착 — 매 stop/start마다 IP 변경되어 운영 피로 큼 |
| 높음 | PR #4를 별도 브랜치 `feat/threat-console`로 분리 후 정리. 현재 `feat/llm-analyzer` HEAD에 미커밋 작업 섞여있음 |
| 높음 | PR #2 / #3 코드(`classify.py`, `llm-analyzer`) 가 이번 변경에 함께 수정됨 → 기존 브랜치 amend/rebase로 정합성 맞춤 |
| 중간 | T-Pot 본가에 Issue 제안 (PR #1 한국어 Kibana부터). 메인테이너 반응 보고 PR 진입 결정 |
| 중간 | llm-analyzer 운영 시작 — Ollama 백엔드 결정 (자체 호스팅 vs 외부 API) |
| 낮음 | BYOM 모델 업로드 UI/엔드포인트 (`/api/model/upload`) |
| 낮음 | 학습 데이터 다양성 확보 — 현재 90% Recon으로 편중. 추가 데이터 누적 후 재학습 |

---

## 8. 주요 토론 이슈

- **이진 분류기 vacuous 문제** — honeypot 본질상 정상 트래픽 없어 ML 이진 분류기 학습 자체 불가. 라벨 기반 판정으로 충분. 단순화로 코드도 깔끔해짐.
- **LLM 백엔드 선택** — Ollama 자체 호스팅(GPU 비용·지연) vs 외부 API(데이터 외부 유출·과금) trade-off. 캡스톤 데모용과 실제 PR 권장 방식을 분리해야 할 수도.
- **클라우드 운영 안정성** — Elastic IP $0.005/시간 비용 vs 매 IP 변경마다 발생하는 운영 피로 비교. 부착 권장.
- **메인테이너 보수성과 PR 전략** — Telekom Security가 비교적 보수적. 가벼운 PR 먼저 머지받아 신뢰 빌딩 후 큰 모듈 진입.
- **데이터 클래스 불균형** — Recon 90% 편중. `class_weight="balanced"`만으로 부족할 수 있음. 데이터 누적 + 합성 데이터 주입 검토.

---

## 9. 참고 — 자주 쓰는 명령

```bash
# SSH 접속
ssh -i ~/tpot-key.pem -p 64295 ubuntu@<IP>

# 사이드카 빌드 + 기동
cd ~/tpotce
docker compose -f docker-compose.yml -f compose/sidecars_overlay.yml \
    up -d --build threat-console ml-classifier

# 로그 확인
docker logs --tail 30 ml-classifier
docker logs --tail 30 threat-console

# 수동 학습 한 사이클 (basic auth 우회 — 컨테이너 내부에서)
docker exec threat-console curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"since":"now-3h","max":2000}' \
    http://127.0.0.1:8080/api/train/dataset
docker exec threat-console curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"source_job_id":"<DS_JOB_ID>"}' \
    http://127.0.0.1:8080/api/train/start

# 권한 reset 방지
sudo chmod 644 ~/tpotce/data/nginx/html/index.html ~/tpotce/data/nginx/conf/tpotweb.conf
sudo chattr +i ~/tpotce/data/nginx/html/index.html ~/tpotce/data/nginx/conf/tpotweb.conf
```

---

## 10. 디렉토리 구조 (참고)

```
/mnt/d/T-POT_PR/                  # 로컬 (WSL)
├── tpot-fork/                    # 본체. T-Pot 포크 + 모듈
│   ├── compose/
│   │   ├── standard.yml          # T-Pot 표준
│   │   ├── threat_intel.yml      # PR용 통합 프로파일
│   │   └── sidecars_overlay.yml  # 운영용 overlay (위에 얹어 사이드카만 추가)
│   └── docker/
│       ├── ml-classifier/
│       │   ├── dist/             # 추론 런타임
│       │   └── training/         # 학습 파이프라인 (LightGBM 단일)
│       ├── threat-console/       # Flask 통합 UI
│       └── llm-analyzer/         # 한국어 LLM 분석
├── honeypot-integrated/          # 참고용 (피벗 전 자산)
└── CLAUDE.md                     # 작업 진행 단일 진실 원천 (자동 메모리)

서버 (EC2 ubuntu@<IP>)
└── /home/ubuntu/tpotce/          # T-Pot 24.04.1 + 우리 사이드카
    ├── docker-compose.yml        # 사용자 수정 (nginx 호스트 마운트 추가)
    ├── compose/sidecars_overlay.yml
    ├── docker/{ml-classifier,threat-console,llm-analyzer}/
    └── data/
        ├── nginx/{html,conf}/    # 사용자 한국어 페이지 + threat-console 라우팅
        ├── ml-classifier/models/ # 활성 모델 (multi_model.pkl + encoders.json)
        └── threat-console/{reports,training/}
```
