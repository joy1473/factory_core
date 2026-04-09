import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// 1x1 투명 GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const hid = request.nextUrl.searchParams.get("hid");
  const t = request.nextUrl.searchParams.get("t");

  if (hid && t) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const ua = request.headers.get("user-agent") || "unknown";

    // 이벤트 기록
    await supabase.from("email_tracking").insert({
      history_id: hid,
      event_type: "open",
      ip_address: ip,
      user_agent: ua,
    });

    // 최초 열람 시간 기록
    await supabase
      .from("send_history")
      .update({ open_at: new Date().toISOString() })
      .eq("id", hid)
      .is("open_at", null);
  }

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
