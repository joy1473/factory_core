import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "토큰이 필요합니다" }, { status: 400 });
  }

  // 토큰으로 send_history 확인
  const { data: history } = await supabase
    .from("send_history")
    .select("id, company_id, template_id")
    .eq("tracking_token", token)
    .single();

  if (!history) {
    return NextResponse.json({ error: "유효하지 않은 링크입니다" }, { status: 404 });
  }

  // 템플릿 조회
  const { data: template } = await supabase
    .from("message_templates")
    .select("id, name, form_schema, template_type")
    .eq("id", templateId)
    .single();

  if (!template) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다" }, { status: 404 });
  }

  // 이미 응답했는지 확인
  const { data: existing } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("token", token)
    .single();

  return NextResponse.json({
    template: {
      id: template.id,
      name: template.name,
      type: template.template_type,
    },
    formSchema: template.form_schema,
    alreadyResponded: !!existing,
  });
}
