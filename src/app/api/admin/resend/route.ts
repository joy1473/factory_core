import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || "",
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@joy.it.kr";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { history_ids } = await request.json();

  if (!Array.isArray(history_ids) || history_ids.length === 0) {
    return NextResponse.json({ error: "No history IDs provided" }, { status: 400 });
  }

  // 재발송 대상 조회
  const { data: items } = await supabase
    .from("send_history")
    .select("id, phone, rendered_content, company_id, template_id, companies(name)")
    .in("id", history_ids);

  let sent = 0;
  let failed = 0;

  for (const item of items || []) {
    const email = item.phone;
    if (!email) { failed++; continue; }

    // 제목/본문 추출
    const lines = item.rendered_content.split("\n");
    const companyName = item.companies ? (item.companies as unknown as { name: string }).name : "안내";
    let subject = `[Factory Core] ${companyName}`;
    let body = item.rendered_content;
    if (lines[0].startsWith("제목:")) {
      subject = lines[0].replace("제목:", "").trim();
      body = lines.slice(2).join("\n");
    }

    try {
      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: body, Charset: "UTF-8" },
            Html: { Data: body.replace(/\n/g, "<br>"), Charset: "UTF-8" },
          },
        },
      }));

      // 기존 이력 상태 업데이트
      await supabase.from("send_history").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", item.id);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ total: (items || []).length, sent, failed });
}
