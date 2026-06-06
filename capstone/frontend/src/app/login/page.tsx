"use client";

// 로그인 페이지 — Clean Light SaaS (auth 로직은 mock 유지, 스타일은 globals.css)

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield, User, Lock, Eye, EyeOff, ArrowLeft, ArrowRight,
  AlertTriangle, CheckCircle2, Info, Activity, BarChart3, ShieldCheck,
} from "lucide-react";

const ACCOUNTS: Record<string, { password: string; role: string; name: string }> = {
  admin: { password: "admin123", role: "admin", name: "관리자" },
  user1: { password: "user1234", role: "user", name: "일반 사용자" },
};

const HIGHLIGHTS = [
  { icon: Activity, text: "LLM 실시간 스트리밍 분석" },
  { icon: BarChart3, text: "D3 공격 흐름 시각화" },
  { icon: ShieldCheck, text: "MITRE ATT&CK 기반 대응 권고" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shake, setShake] = useState(false);

  function quickLogin(id: string, pw: string) {
    setUsername(id);
    setPassword(pw);
    handleLogin(id, pw);
  }

  function handleLogin(u = username, p = password) {
    setError("");
    setSuccess("");
    setLoading(true);
    setTimeout(() => {
      const account = ACCOUNTS[u.trim()];
      if (!account || account.password !== p) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      if (account.role === "admin") {
        setSuccess(`관리자 ${account.name}님, 환영합니다! 대시보드로 이동 중...`);
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setSuccess(`${account.name}님, 환영합니다! 이동 중...`);
        setTimeout(() => router.push("/"), 1200);
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div className="auth">
      {/* BRAND PANEL */}
      <aside className="auth-brand">
        <div className="auth-brand-in">
          <div className="brand">
            <span className="brand-mark"><Shield className="icon" /></span>
            <span className="brand-name">정사<span>평</span></span>
          </div>
          <div className="hp-visual">
            <div className="hp-ring-box">
              <div className="hp-ring" /><div className="hp-ring" /><div className="hp-ring" />
              <div className="hp-core"><Shield className="icon" /></div>
            </div>
          </div>
          <div>
            <div className="brand-headline">공격자를 <span>유인</span>하고<br />AI로 <span>분석</span>합니다</div>
            <p className="brand-desc">허니팟에 수집된 사이버 공격 데이터를 대규모 언어 모델이 실시간으로 분석해 위협 인텔리전스를 제공합니다.</p>
            <div className="hl-list">
              {HIGHLIGHTS.map((h) => (
                <div key={h.text} className="hl-item"><span className="hl-ic"><h.icon className="icon" /></span>{h.text}</div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* FORM PANEL */}
      <main className="auth-form">
        <div className={`auth-card ${shake ? "shake" : ""}`}>
          <Link href="/" className="back-link"><ArrowLeft className="icon" /> 홈으로 돌아가기</Link>
          <h1 className="auth-title">다시 오셨군요</h1>
          <p className="auth-sub">계정이 없으신가요? <Link href="/signup">무료 회원가입</Link></p>

          <div className="alert alert-info" style={{ margin: "20px 0" }}>
            <Info className="icon" />
            <span>관리자 <strong>admin / admin123</strong> 로 로그인하면 분석 대시보드로 이동합니다.</span>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 14 }}><AlertTriangle className="icon" /><span>{error}</span></div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 14 }}><CheckCircle2 className="icon" /><span>{success}</span></div>}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="field">
              <label className="label">아이디</label>
              <div className="input-wrap">
                <User className="icon" />
                <input type="text" className="input has-icon" placeholder="아이디를 입력하세요"
                  value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
              </div>
            </div>
            <div className="field">
              <label className="label">비밀번호</label>
              <div className="input-wrap">
                <Lock className="icon" />
                <input type={showPw ? "text" : "password"} className="input has-icon" placeholder="비밀번호를 입력하세요"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" className="input-suffix-btn" onClick={() => setShowPw(!showPw)} aria-label="비밀번호 표시">
                  {showPw ? <EyeOff className="icon" /> : <Eye className="icon" />}
                </button>
              </div>
            </div>
            <div className="row-between">
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.82rem", color: "var(--text-2)", cursor: "pointer" }}>
                <input type="checkbox" /> 로그인 상태 유지
              </label>
              <a href="#" style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>비밀번호 찾기</a>
            </div>
            <button type="submit" className="btn btn-dark btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> 확인 중...</> : <>로그인 <ArrowRight className="icon" /></>}
            </button>
          </form>

          <div className="divider">또는 빠른 로그인</div>
          <div className="demo-grid">
            <button className="demo-btn" onClick={() => quickLogin("admin", "admin123")}>
              <span className="t"><ShieldCheck className="icon" style={{ color: "var(--accent)" }} /> 관리자 계정</span>
              <span className="r">admin / admin123</span>
            </button>
            <button className="demo-btn" onClick={() => quickLogin("user1", "user1234")}>
              <span className="t"><User className="icon" style={{ color: "var(--text-3)" }} /> 일반 사용자</span>
              <span className="r">user1 / user1234</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
