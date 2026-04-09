import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const hid = request.nextUrl.searchParams.get("hid");
  const t = request.nextUrl.searchParams.get("t");
  const to = request.nextUrl.searchParams.get("to");

  if (hid && t) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const ua = request.headers.get("user-agent") || "unknown";

    // 이벤트 기록
    await supabase.from("email_tracking").insert({
      history_id: hid,
      event_type: "click",
      ip_address: ip,
      user_agent: ua,
    });

    // 최초 클릭 시간 기록
    await supabase
      .from("send_history")
      .update({ click_at: new Date().toISOString() })
      .eq("id", hid)
      .is("click_at", null);
  }

  // 리다이렉트
  const redirectTo = to || "/";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
