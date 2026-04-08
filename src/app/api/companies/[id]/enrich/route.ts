import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_RE) || [];
  return [
    ...new Set(
      matches.filter(
        (e) =>
          !/\.(png|jpg|gif|svg|webp|css|js)$/i.test(e) &&
          !/(example|sentry|webpack|wixpress|w3\.org|schema\.org|cloudflare|googleapis|noreply)/i.test(e)
      )
    ),
  ];
}

const SKIP_DOMAINS = [
  "naver.com", "daum.net", "tistory.com", "wikipedia.org",
  "facebook.com", "youtube.com", "instagram.com", "linkedin.com",
  "twitter.com", "jobkorea.co.kr", "saramin.co.kr", "catch.co.kr",
  "google.com", "duckduckgo.com", "data.go.kr", "kakao.com",
  "zillinks.com", "remember.co.kr", "scribd.com",
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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

  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) {
    return NextResponse.json({ error: "Serper API not configured" }, { status: 500 });
  }

  let website = company.website || "";
  let emails: string[] = [];
  let searchResults: { title: string; url: string }[] = [];

  try {
    // Step 1: Serper로 Google 검색 → 홈페이지 찾기
    if (!website) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: company.name + " 홈페이지",
          gl: "kr",
          hl: "ko",
          num: 5,
        }),
      });

      const data = await res.json();
      const organic = data.organic || [];

      searchResults = organic.map((r: { title: string; link: string }) => ({
        title: r.title,
        url: r.link,
      }));

      for (const item of organic) {
        const url = item.link as string;
        const isPortal = SKIP_DOMAINS.some((d) => url.includes(d));
        if (!isPortal && url.startsWith("http")) {
          website = url;
          break;
        }
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

    // Step 3: 저장 (여러 이메일은 줄바꿈으로 구분)
    const updates: Record<string, string> = {};
    if (website && !company.website) updates.website = website;
    if (emails.length > 0 && !company.email) {
      updates.email = emails.slice(0, 5).join("\n"); // 최대 5개
    }
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
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
