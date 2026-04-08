import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Admin: 문의 목록 / Public: 추적코드 조회
export async function GET(request: NextRequest) {
  const isAdmin = request.nextUrl.searchParams.get("admin");
  const code = request.nextUrl.searchParams.get("code");
  const phone = request.nextUrl.searchParams.get("phone");

  // Public: 추적코드 또는 전화번호로 조회
  if (code || phone) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from("inquiries")
      .select("tracking_code, type, company_name, contact_name, message, status, admin_note, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (code) query = query.eq("tracking_code", code);
    else if (phone) query = query.eq("phone", phone);

    const { data } = await query;
    return NextResponse.json(data || []);
  }

  // Admin: 전체 목록
  if (isAdmin) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json(data || []);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Public: 문의 접수 (tracking_code 반환)
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

    // 신규 기업 자동 등록 (기존 DB에 없는 회사)
    if (company_name) {
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .or(`name.ilike.%${company_name}%,phone.eq.${phone || "NONE"}`)
        .limit(1)
        .single();

      if (!existing) {
        try {
          const { data: newCo } = await supabase
            .from("companies")
            .insert({
              name: company_name,
              contact_person: contact_name,
              phone: phone || null,
              email: email || null,
              memo: `[신규] ${type === "poc" ? "PoC" : "일반"} 문의를 통해 자동 등록`,
              sido: "기타",
              sigungu: "기타",
            })
            .select("id")
            .single();
          if (newCo) {
            const { data: newTag } = await supabase
              .from("tags")
              .select("id")
              .eq("name", "신규")
              .single();
            if (newTag) {
              await supabase.from("company_tags").upsert({
                company_id: newCo.id,
                tag_id: newTag.id,
              }, { onConflict: "company_id,tag_id" });
            }
          }
        } catch { /* RLS block */ }
      }
    }

    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        company_name: company_name || null,
        contact_name,
        phone: phone || null,
        email: email || null,
        message,
        type: type || "general",
      })
      .select("tracking_code")
      .single();

    if (error) {
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tracking_code: data?.tracking_code,
    });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
