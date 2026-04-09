import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon.svg", color: "#00ff41" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Factory Core",
  },
  openGraph: {
    title: "Factory Core | 팩토리코어",
    description: "중소제조기업을 위한 Agentic AI 솔루션",
    url: "https://joy.it.kr",
    siteName: "Factory Core",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-icon.png",
        width: 1200,
        height: 1200,
        alt: "Factory Core",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
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
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
