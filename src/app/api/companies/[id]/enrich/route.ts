import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ddgSearch } from "@/lib/api/ddg-search";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

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
      !e.includes("sentry") &&
      !e.includes("webpack") &&
      !e.includes("wixpress") &&
      !e.includes("w3.org") &&
      !e.includes("schema.org") &&
      !e.includes("cloudflare") &&
      !e.includes("googleapis")
  );
  return [...new Set(filtered)];
}

const SKIP_DOMAINS = [
  "naver.com", "daum.net", "tistory.com", "wikipedia.org",
  "facebook.com", "youtube.com", "instagram.com", "linkedin.com",
  "twitter.com", "jobkorea.co.kr", "saramin.co.kr", "catch.co.kr",
  "google.com", "duckduckgo.com", "data.go.kr", "kakao.com",
  "remember.co.kr", "zillinks.com",
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
    // Step 1: DuckDuckGo 검색
    const results = await ddgSearch(company.name + " 홈페이지");

    let website = company.website || "";
    let emails: string[] = [];

    // 포털 제외, 첫 번째 결과 = 홈페이지
    if (!website && results.length > 0) {
      for (const item of results.slice(0, 5)) {
        const isPortal = SKIP_DOMAINS.some((d) => item.url.includes(d));
        if (!isPortal && item.url.startsWith("http")) {
          website = item.url;
          break;
        }
      }
    }

    // Step 2: 홈페이지에서 이메일 추출
    if (website && !company.email) {
      const fetchPage = async (url: string) => {
        try {
          const r = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
          });
          return r.ok ? await r.text() : "";
        } catch {
          return "";
        }
      };

      const mainHtml = await fetchPage(website);
      if (mainHtml) {
        emails.push(...extractEmails(mainHtml));

        // 하위 페이지도 시도
        const baseUrl = new URL(website).origin;
        for (const path of ["/contact", "/about", "/company", "/intro"]) {
          const subHtml = await fetchPage(baseUrl + path);
          if (subHtml) emails.push(...extractEmails(subHtml));
        }
        emails = [...new Set(emails)];
      }
    }

    // Step 3: 저장
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
      searchResults: results.slice(0, 5).map((r) => ({
        title: r.title,
        url: r.url,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
