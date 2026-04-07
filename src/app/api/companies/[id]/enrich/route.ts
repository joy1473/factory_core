import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ddgSearch } from "@/lib/api/ddg-search";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_RE) || [];
  return [
    ...new Set(
      matches.filter(
        (e) =>
          !/\.(png|jpg|gif|svg|webp|css|js)$/i.test(e) &&
          !/(example|sentry|webpack|wixpress|w3\.org|schema\.org|cloudflare|googleapis)/i.test(e)
      )
    ),
  ];
}

const SKIP_DOMAINS = [
  "naver.com", "daum.net", "tistory.com", "wikipedia.org",
  "facebook.com", "youtube.com", "instagram.com", "linkedin.com",
  "twitter.com", "jobkorea.co.kr", "saramin.co.kr", "catch.co.kr",
  "google.com", "duckduckgo.com", "data.go.kr", "kakao.com",
  "zillinks.com", "remember.co.kr",
];

async function fetchPage(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    return r.ok ? await r.text() : "";
  } catch {
    return "";
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const websiteFromClient = body.website || "";

  const { data: company } = await supabase
    .from("companies")
    .select("name, website, email")
    .eq("id", id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let website = company.website || websiteFromClient;
  let emails: string[] = [];
  let searchResults: { title: string; url: string }[] = [];

  // Step 1: 홈페이지 없으면 DDG 검색 (서버에서 시도)
  if (!website) {
    try {
      const results = await ddgSearch(company.name + " 홈페이지");
      searchResults = results.slice(0, 5);

      for (const item of results.slice(0, 5)) {
        const isPortal = SKIP_DOMAINS.some((d) => item.url.includes(d));
        if (!isPortal && item.url.startsWith("http")) {
          website = item.url;
          break;
        }
      }
    } catch {
      // DDG 검색 실패 (Vercel에서 차단될 수 있음) → 클라이언트에서 재시도
    }
  }

  // Step 2: 홈페이지에서 이메일 추출
  if (website && !company.email) {
    const mainHtml = await fetchPage(website);
    if (mainHtml) {
      emails.push(...extractEmails(mainHtml));

      try {
        const baseUrl = new URL(website).origin;
        for (const path of ["/contact", "/about", "/company", "/intro"]) {
          const sub = await fetchPage(baseUrl + path);
          if (sub) emails.push(...extractEmails(sub));
        }
      } catch { /* URL parse fail */ }
      emails = [...new Set(emails)];
    }
  }

  // Step 3: 저장
  const updates: Record<string, string> = {};
  if (website && !company.website) updates.website = website;
  if (emails.length > 0 && !company.email) updates.email = emails[0];
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
    await supabase.from("companies").update(updates).eq("id", id);
  }

  return NextResponse.json({
    website: website || null,
    emails,
    updated: Object.keys(updates).length > 0,
    searchResults,
  });
}
