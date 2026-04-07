import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_RE) || [];
  return [
    ...new Set(
      matches.filter(
        (e) =>
          !/\.(png|jpg|gif|svg|webp|css|js)$/i.test(e) &&
          !/(example|sentry|webpack|wixpress|w3\.org|schema\.org|cloudflare|googleapis)/i.test(
            e
          )
      )
    ),
  ];
}

// POST: 클라이언트가 찾은 website URL을 전달하면 이메일 추출 + 저장
// body: { website?: string }
export async function POST(
  request: NextRequest,
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

  const website = company.website || websiteFromClient;
  let emails: string[] = [];

  // 홈페이지에서 이메일 추출
  if (website) {
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

      const baseUrl = new URL(website).origin;
      for (const path of ["/contact", "/about", "/company", "/intro"]) {
        const sub = await fetchPage(baseUrl + path);
        if (sub) emails.push(...extractEmails(sub));
      }
      emails = [...new Set(emails)];
    }
  }

  // 저장
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
  });
}
