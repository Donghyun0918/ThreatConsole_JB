import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정사평 — 허니팟 공격 분석 시스템",
  description: "AI 기반 사이버 공격 자동 분석 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
