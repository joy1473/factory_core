import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Admin: 문의 목록 조회
export async function GET(request: NextRequest) {
  const isAdmin = request.nextUrl.searchParams.get("admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(data || []);
}

// Public: 문의 접수
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_name, contact_name, phone, email, message, type } = body;

    if (!contact_name || !message) {
      return NextResponse.json(
        { error: "담당자명과 문의 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from("inquiries").insert({
      company_name: company_name || null,
      contact_name,
      phone: phone || null,
      email: email || null,
      message,
      type: type || "general",
    });

    if (error) {
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
