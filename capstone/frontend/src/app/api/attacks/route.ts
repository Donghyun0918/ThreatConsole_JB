// GET /api/attacks?view=ml|llm — T-Pot ES 공격 로그 목록.
// Spring threat-console 백엔드를 서버사이드로 프록시 후 공격로그입력 형태로 매핑.
//   view=ml (기본): ml-analysis-* (분류 로그 전체, 공격+정상). 개요 "총/공격/고위험" 필터용.
//   view=llm       : llm-analysis-* (LLM 분석된 로그). 개요 "LLM 분석" 필터용.

import { NextResponse } from "next/server";
import type { 공격로그입력, 공격유형코드, 위험등급코드 } from "@/types/input";

const API = process.env.SPRING_API_URL ?? "http://localhost:8090";

// 9-class ML 모델 라벨(label_names.pkl) → 공격유형코드.
// classify.py가 model.predict() 정수(0-8)를 label_names로 이름 매핑해 ml_label에 기록한 값과 일치.
const 유형맵: Record<string, 공격유형코드> = {
  "Normal": "NORMAL",
  "Recon": "RECON",
  "Brute Force": "BRUTE_FORCE",
  "Intrusion": "INTRUSION",
  "Malware": "MALWARE",
  "Web Attack": "WEB_ATTACK",
  "Service Attack": "SERVICE_ATTACK",
  "ICS Attack": "ICS_ATTACK",
  "Etc": "UNKNOWN",
};

function 등급계산(score: number): 위험등급코드 {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// 공통 필드 추출
function base(r: Record<string, unknown>, score: number, conf: number): 공격로그입력 {
  const ts = String(r["@timestamp"] ?? new Date().toISOString());
  const ip = String(r["src_ip"] ?? "0.0.0.0");
  const label = String(r["ml_label"] ?? "");
  const honeypot = String(r["honeypot"] ?? "unknown");
  const port = r["dest_port"] != null ? Number(r["dest_port"]) : undefined;
  return {
    사건ID: `ES-${ts.slice(0, 19)}-${ip}`,
    허니팟ID: honeypot,
    발생시각: ts,
    공격자IP: ip,
    공격유형: 유형맵[label] ?? "UNKNOWN",
    위험점수: score,
    탐지신뢰도: conf,
    위험등급: 등급계산(score),
    MITRE전술: r["mitre_technique"] ? String(r["mitre_technique"]) : undefined,
    대상URI: port ? `:${port}` : undefined,
    행위시퀀스: label ? [`${honeypot} 접속`, label] : [],
    요청횟수: 1,
    ...({ _ml_label: label } as Record<string, unknown>),
  };
}

// ml-analysis-* 행 → 입력 (+ _is_attack)
function mapMl(r: Record<string, unknown>): 공격로그입력 {
  // ml_multi_conf는 0~100(%) 스케일로 저장됨 → 0~1로 정규화 (이미 0~1이면 그대로).
  const c = Number(r["ml_multi_conf"] ?? 0);
  const out = base(r, Number(r["mitre_score"] ?? 0), c > 1 ? c / 100 : c);
  return { ...out, ...({ _is_attack: r["ml_is_attack"] !== false } as Record<string, unknown>) };
}

// llm-analysis-* 행 → 입력 (위험점수=risk_score, 위험등급=severity, summary 포함)
function mapLlm(r: Record<string, unknown>): 공격로그입력 {
  const score = Number(r["risk_score"] ?? r["mitre_score"] ?? 0);
  const out = base(r, score, 0.9);
  const sev = r["severity"] ? String(r["severity"]) as 위험등급코드 : 등급계산(score);
  return {
    ...out,
    위험등급: sev,
    ...({ _is_attack: true, _summary: r["summary_ko"] ?? "" } as Record<string, unknown>),
  };
}

// 같은 공격자IP+공격유형 반복(스캐너 노이즈) 제거 — desc 정렬이라 최초=최신 1건만 유지.
function 중복제거(list: 공격로그입력[]): 공격로그입력[] {
  const seen = new Set<string>();
  const out: 공격로그입력[] = [];
  for (const a of list) {
    const k = `${a.공격자IP}|${a.공격유형}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const view = sp.get("view") === "llm" ? "llm" : "ml";
  const filter = sp.get("filter") ?? "all"; // all | attacks | highrisk
  const path = view === "llm" ? "/api/export/llm" : "/api/export/ml";
  try {
    const res = await fetch(`${API}${path}?format=json&since=now-7d`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ 공격목록: [], 오류: `backend ${res.status}` });
    const rows = (await res.json()) as Record<string, unknown>[];
    const arr = Array.isArray(rows) ? rows : [];
    // 1) 매핑 → 2) 노이즈 중복제거 → 3) 서버측 필터(전체 기준) → 4) 상위 100건
    let mapped = 중복제거(view === "llm" ? arr.map(mapLlm) : arr.map(mapMl));
    if (filter === "attacks") {
      mapped = mapped.filter((a) => (a as unknown as { _is_attack?: boolean })._is_attack !== false);
    } else if (filter === "highrisk") {
      mapped = mapped.filter((a) => a.위험점수 >= 70);
    }
    const list = mapped.slice(0, 100);
    return NextResponse.json({ 공격목록: list, 건수: list.length, view, filter });
  } catch (e) {
    return NextResponse.json({ 공격목록: [], 오류: String(e) });
  }
}
