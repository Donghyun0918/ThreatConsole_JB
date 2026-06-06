// 랜딩 페이지 — Clean Light SaaS

import Link from "next/link";
import {
  Shield, Activity, BarChart3, ShieldCheck, Target, FileText, Plug,
  ArrowRight, CheckCircle2,
} from "lucide-react";

const FEATURES = [
  { icon: Activity, tone: "indigo", title: "LLM 실시간 스트리밍", desc: "Ollama + Llama 3.1이 토큰 단위로 분석 결과를 스트리밍해 실시간 추론 과정을 그대로 보여줍니다." },
  { icon: BarChart3, tone: "cyan", title: "D3 공격 시각화", desc: "공격 흐름 네트워크 그래프, 보안 건강 게이지, 위협 레이더 차트로 직관적으로 파악합니다." },
  { icon: ShieldCheck, tone: "green", title: "5단계 자동 분석", desc: "사건 요약 → 공격 의도 → 숙련도 → 대응 권고 → 리포트까지 5단계를 자동 수행합니다." },
  { icon: Target, tone: "red", title: "MITRE ATT&CK 매핑", desc: "MITRE ATT&CK·OWASP Top 10 기반으로 공격을 분류하고 대응 방안을 제시합니다." },
  { icon: FileText, tone: "amber", title: "PDF 리포트 자동화", desc: "분석 결과와 차트를 담은 전문 인시던트 리포트를 PDF로 즉시 내려받습니다." },
  { icon: Plug, tone: "violet", title: "Spring 연동 API", desc: "RESTful API로 기존 보안 시스템과 연동하거나 단건 분석 결과를 그대로 활용합니다." },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 64px;
          display: flex; align-items: center; justify-content: space-between; padding: 0 40px;
          background: rgba(15,23,42,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--chrome-border);
        }
        .lp-nav .brand-name { color: var(--chrome-text); }
        .lp-nav .brand-name span { color: var(--chrome-accent); }
        .lp-links { display: flex; align-items: center; gap: 6px; }
        .lp-link { padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--chrome-text-2); transition: all 0.18s; }
        .lp-link:hover { color: #fff; background: rgba(255,255,255,0.08); }

        .hero {
          position: relative; overflow: hidden; padding: 150px 24px 90px; text-align: center;
          background:
            radial-gradient(ellipse 70% 55% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%),
            var(--bg);
        }
        .hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
          background-size: 56px 56px; mask-image: radial-gradient(ellipse 60% 55% at 50% 30%, #000 0%, transparent 75%);
        }
        .hero-inner { position: relative; max-width: 760px; margin: 0 auto; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 26px;
          background: var(--accent-soft); border: 1px solid var(--accent-border); border-radius: 20px;
          padding: 6px 15px; font-size: 0.78rem; font-weight: 600; color: var(--accent-hover);
        }
        .hero h1 { font-size: clamp(2.3rem, 5.5vw, 3.7rem); font-weight: 900; line-height: 1.15; letter-spacing: -0.02em; }
        .hero h1 .grad { background: linear-gradient(120deg, #6366f1, #818cf8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.08rem; color: var(--text-2); line-height: 1.8; max-width: 600px; margin: 22px auto 36px; }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        .features { padding: 96px 40px; max-width: 1140px; margin: 0 auto; }
        .sec-label { font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); text-align: center; }
        .sec-title { font-size: clamp(1.6rem, 3vw, 2.3rem); font-weight: 800; text-align: center; margin: 10px 0 12px; letter-spacing: -0.01em; }
        .sec-sub { font-size: 0.95rem; color: var(--text-2); text-align: center; max-width: 520px; margin: 0 auto 52px; line-height: 1.7; }
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; }
        .feat-card { padding: 26px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.25s; }
        .feat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--accent-border); }
        .feat-ic { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; margin-bottom: 16px; }
        .feat-ic.indigo { background: var(--accent-soft); color: var(--accent); }
        .feat-ic.cyan { background: var(--cyan-soft); color: var(--cyan); }
        .feat-ic.green { background: var(--green-soft); color: var(--green); }
        .feat-ic.red { background: var(--red-soft); color: var(--red); }
        .feat-ic.amber { background: var(--amber-soft); color: var(--amber); }
        .feat-ic.violet { background: #f5f3ff; color: #7c3aed; }
        .feat-card h3 { font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .feat-card p { font-size: 0.85rem; color: var(--text-2); line-height: 1.7; }

        .cta { padding: 90px 40px; text-align: center; }
        .cta-box {
          max-width: 880px; margin: 0 auto; padding: 56px 32px; border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; box-shadow: var(--shadow-lg);
        }
        .cta-box h2 { font-size: clamp(1.7rem, 3vw, 2.4rem); font-weight: 900; letter-spacing: -0.01em; }
        .cta-box p { font-size: 0.98rem; opacity: 0.9; margin: 14px 0 30px; }
        .btn-on-accent { background: #fff; color: var(--accent-hover); }
        .btn-on-accent:hover { background: #f8fafc; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }

        footer { padding: 30px 40px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-3); }
        footer .brand-name { font-size: 0.85rem; }
        @media (max-width: 768px) {
          .lp-nav { padding: 0 18px; } .lp-links .lp-link:not(.is-btn) { display: none; }
          .features, .cta { padding: 56px 18px; } footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <div className="brand">
          <span className="brand-mark"><Shield className="icon" /></span>
          <span className="brand-name">정사<span>평</span></span>
        </div>
        <div className="lp-links">
          <a href="#features" className="lp-link">기능</a>
          <Link href="/login" className="lp-link">로그인</Link>
          <Link href="/signup" className="btn btn-primary is-btn" style={{ padding: "8px 16px" }}>무료 시작</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge"><span className="dot dot-live" /> AI 기반 실시간 위협 분석</span>
          <h1>허니팟 공격을<br /><span className="grad">AI가 즉시 분석</span>합니다</h1>
          <p>수집된 사이버 공격 데이터를 대규모 언어 모델이 실시간 스트리밍으로 분석해
            사건 요약·공격 의도·숙련도·대응 권고를 자동 생성합니다.</p>
          <div className="hero-btns">
            <Link href="/login" className="btn btn-primary btn-lg">대시보드 바로가기 <ArrowRight className="icon" /></Link>
            <Link href="/signup" className="btn btn-outline btn-lg">무료 회원가입</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="sec-label">핵심 기능</div>
        <h2 className="sec-title">강력한 AI 보안 분석</h2>
        <p className="sec-sub">Llama 3.1 기반 LLM이 허니팟 공격 로그를 다각도로 분석합니다.</p>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feat-card">
              <div className={`feat-ic ${f.tone}`}><f.icon className="icon" /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-box">
          <h2>지금 바로 무료로 시작하세요</h2>
          <p>계정을 만들고 AI 공격 분석 대시보드를 경험해보세요.</p>
          <div className="hero-btns">
            <Link href="/signup" className="btn btn-on-accent btn-lg">무료 회원가입 <ArrowRight className="icon" /></Link>
            <Link href="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>로그인</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 className="icon" style={{ color: "var(--green)" }} /> 정사평 — 허니팟 기반 사이버 공격 분석 시스템
        </span>
        <span>Powered by Llama 3.1 · Built with Next.js</span>
      </footer>
    </>
  );
}
