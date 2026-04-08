import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// AWS SES 발송 (SES 인증 완료 후 활성화)
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // TODO: AWS SES 연동 후 실제 발송으로 교체
  // 현재는 시뮬레이션 (항상 성공)
  const SES_CONFIGURED = !!process.env.AWS_SES_ACCESS_KEY;

  if (SES_CONFIGURED) {
    // AWS SES SDK 호출
    // const ses = new SESClient({ region: "ap-northeast-2" });
    // await ses.send(new SendEmailCommand({...}));
    return true;
  }

  // SES 미설정 시 로그만 남김
  console.log(`[EMAIL SIMULATE] To: ${to}, Subject: ${subject.substring(0, 50)}`);
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
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    total: (companies || []).length,
    sent,
    failed,
    noEmail,
  });
}
