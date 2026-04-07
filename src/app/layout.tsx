import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Factory Core | 팩토리코어 - 스마트팩토리 Agentic AI 솔루션",
  description:
    "중소제조기업을 위한 AI 기반 설비관리 솔루션. Gen3 IoT 센서 + 웨어러블 연동으로 실시간 이상감지, 자동 보고서, 예측유지보수를 제공합니다.",
  keywords: [
    "스마트팩토리",
    "AI",
    "예측유지보수",
    "Factory Core",
    "팩토리코어",
    "IoT",
    "중소기업",
    "제조AI",
  ],
  openGraph: {
    title: "Factory Core | 팩토리코어",
    description: "중소제조기업을 위한 Agentic AI 솔루션",
    url: "https://joy.it.kr",
    siteName: "Factory Core",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#e0e0e0]">
        {children}
      </body>
    </html>
  );
}
