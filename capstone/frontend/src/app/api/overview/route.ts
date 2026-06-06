// GET /api/overview — T-Pot 24시간 개요 통계.
// Spring threat-console 백엔드(/api/overview)를 서버사이드로 프록시.
// 반환: { since, total_events, total_attacks, high_risk, llm_analyzed }

import { NextResponse } from "next/server";

const API = process.env.SPRING_API_URL ?? "http://localhost:8090";

export async function GET() {
  try {
    const res = await fetch(`${API}/api/overview`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ total_events: 0, total_attacks: 0, high_risk: 0, llm_analyzed: 0, 오류: `backend ${res.status}` });
    }
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ total_events: 0, total_attacks: 0, high_risk: 0, llm_analyzed: 0, 오류: String(e) });
  }
}
