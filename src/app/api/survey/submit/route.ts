import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { template_id, token, answers } = await request.json();

  if (!template_id || !token || !answers) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
  }

  // 토큰 → send_history 매칭
  const { data: history } = await supabase
    .from("send_history")
    .select("id")
    .eq("tracking_token", token)
    .single();

  if (!history) {
    return NextResponse.json({ error: "유효하지 않은 토큰입니다" }, { status: 404 });
  }

  // 중복 응답 체크
  const { data: existing } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("token", token)
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 응답하셨습니다" }, { status: 409 });
  }

  // 응답 저장
  const { error: insertError } = await supabase.from("survey_responses").insert({
    template_id,
    history_id: history.id,
    token,
    answers,
    completed_at: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // send_history에 응답 시간 기록
  await supabase
    .from("send_history")
    .update({ responded_at: new Date().toISOString() })
    .eq("id", history.id);

  return NextResponse.json({ success: true });
}
