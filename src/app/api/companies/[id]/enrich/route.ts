import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { search, SafeSearchType } from "duck-duck-scrape";

// 이메일 정규식
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// HTML에서 이메일 추출
function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_RE) || [];
  const filtered = matches.filter(
    (e) =>
      !e.endsWith(".png") &&
      !e.endsWith(".jpg") &&
      !e.endsWith(".gif") &&
      !e.endsWith(".svg") &&
      !e.endsWith(".webp") &&
      !e.includes("example.com") &&
      !e.includes("sentry.io") &&
      !e.includes("webpack") &&
      !e.includes("wixpress") &&
      !e.includes("w3.org") &&
      !e.includes("schema.org") &&
      !e.includes("cloudflare")
  );
  return [...new Set(filtered)];
}

// 포털/SNS 도메인 제외
const SKIP_DOMAINS = [
  "naver.com",
  "daum.net",
  "tistory.com",
  "wikipedia.org",
  "facebook.com",
  "youtube.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "jobkorea.co.kr",
  "saramin.co.kr",
  "catch.co.kr",
  "google.com",
  "duckduckgo.com",
  "data.go.kr",
  "kakao.com",
];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: company } = await supabase
    .from("companies")
    .select("name, website, email")
    .eq("id", id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Step 1: DuckDuckGo 검색 → 홈페이지 URL 찾기
    const results = await search(company.name + " 공식 홈페이지", {
      safeSearch: SafeSearchType.OFF,
      locale: "kr-ko",
    });

    const items = results.results || [];
    let website = company.website || "";
    let emails: string[] = [];

    // 포털 제외하고 첫 번째 결과 = 홈페이지
    if (!website && items.length > 0) {
      for (const item of items.slice(0, 5)) {
        const url = item.url || "";
        const isPortal = SKIP_DOMAINS.some((d) => url.includes(d));
        if (!isPortal && url.startsWith("http")) {
          website = url;
          break;
        }
      }
    }

    // Step 2: 홈페이지에서 이메일 추출
    if (website && !company.email) {
      try {
        const pageRes = await fetch(website, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (pageRes.ok) {
          const html = await pageRes.text();
          emails = extractEmails(html);

          // 연락처/회사소개 페이지도 시도
          const contactPaths = [
            "/contact",
            "/about",
            "/company",
            "/intro",
            "/about-us",
            "/contact-us",
          ];
          for (const path of contactPaths) {
            try {
              const baseUrl = new URL(website).origin;
              const subRes = await fetch(baseUrl + path, {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                signal: AbortSignal.timeout(5000),
                redirect: "follow",
              });
              if (subRes.ok) {
                const subHtml = await subRes.text();
                emails.push(...extractEmails(subHtml));
              }
            } catch {
              // 서브페이지 실패 무시
            }
          }
          emails = [...new Set(emails)];
        }
      } catch {
        // fetch 실패 무시
      }
    }

    // Step 3: Supabase 업데이트
    const updates: Record<string, string> = {};
    if (website && !company.website) updates.website = website;
    if (emails.length > 0 && !company.email) updates.email = emails[0];
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length > 1) {
      await supabase.from("companies").update(updates).eq("id", id);
    }

    return NextResponse.json({
      website: website || null,
      emails,
      updated: Object.keys(updates).length > 1,
      searchResults: items.slice(0, 5).map((i) => ({
        title: i.title,
        url: i.url,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
