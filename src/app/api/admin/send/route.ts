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

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!process.env.AWS_SES_ACCESS_KEY) {
    console.log(`[EMAIL SIMULATE] To: ${to}, Subject: ${subject.substring(0, 50)}`);
    return true;
  }

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: body, Charset: "UTF-8" },
        Html: {
          Data: body.replace(/\n/g, "<br>"),
          Charset: "UTF-8",
        },
      },
    },
  });

  await ses.send(command);
  return true;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { company_ids, template_id } = await request.json();

  // 템플릿 조회
  const { data: template } = await supabase
    .from("message_templates")
    .select("name, content")
    .eq("id", template_id)
    .single();

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  // 기업 목록
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, ceo, contact_person, email, sido, sigungu")
    .in("id", company_ids);

  let sent = 0;
  let failed = 0;
  let noEmail = 0;

  for (const c of companies || []) {
    const email = c.email ? c.email.split("\n")[0].trim() : null;

    if (!email) {
      noEmail++;
      continue;
    }

    // 변수 치환
    const content = template.content
      .replace(/{기업명}/g, c.name || "")
      .replace(/{대표자}/g, c.ceo || "")
      .replace(/{담당자}/g, c.contact_person || c.ceo || "담당자")
      .replace(/{지역}/g, `${c.sido} ${c.sigungu}`);

    // 제목 추출 (첫 줄이 "제목:" 이면)
    const lines = content.split("\n");
    let subject = template.name;
    let body = content;
    if (lines[0].startsWith("제목:")) {
      subject = lines[0].replace("제목:", "").trim();
      body = lines.slice(2).join("\n");
    }

    try {
      const success = await sendEmail(email, subject, body);

      // 발송 이력 저장
      await supabase.from("send_history").insert({
        company_id: c.id,
        template_id,
        phone: email,
        rendered_content: content,
        status: success ? "sent" : "failed",
      });

      if (success) sent++;
      else failed++;
    } catch (err) {
      failed++;
      // 실패 이력도 저장
      await supabase.from("send_history").insert({
        company_id: c.id,
        template_id,
        phone: email,
        rendered_content: content,
        status: "failed",
      });
    }
  }

  return NextResponse.json({
    total: (companies || []).length,
    sent,
    failed,
    noEmail,
  });
}
