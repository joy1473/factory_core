import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Public: 공고 문의 접수
export async function POST(request: Request) {
  const body = await request.json();
  const { bid_id, company_name, contact_name, phone, email, message, service_type } = body;

  if (!contact_name || !message) {
    return NextResponse.json({ error: "담당자명과 문의 내용은 필수입니다." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("bid_inquiries").insert({
    bid_id: bid_id || null,
    company_name: company_name || null,
    contact_name,
    phone: phone || null,
    email: email || null,
    message,
    service_type: service_type || "proposal",
  });

  if (error) return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  return NextResponse.json({ success: true });
}
