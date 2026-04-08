import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// POST: 문의 접수 (기업 자동 매칭/생성 + 추적코드 반환)
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

  // 1. 기존 기업 매칭 (전화번호 또는 회사명)
  let companyId: string | null = null;

  if (phone) {
    const { data: byPhone } = await supabase
      .from("companies")
      .select("id")
      .eq("phone", phone)
      .limit(1)
      .single();
    if (byPhone) companyId = byPhone.id;
  }

  if (!companyId && company_name) {
    const { data: byName } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", `%${company_name}%`)
      .limit(1)
      .single();
    if (byName) companyId = byName.id;
  }

  // 2. 없으면 신규 기업 자동 생성 + "신규" 태그 부여
  if (!companyId && company_name) {
    try {
      const { data: newCompany } = await supabase
        .from("companies")
        .insert({
          name: company_name,
          contact_person: contact_name,
          phone: phone || null,
          email: email || null,
          memo: `[신규] 지원사업 문의를 통해 자동 등록`,
          sido: "기타",
          sigungu: "기타",
        })
        .select("id")
        .single();
      if (newCompany) {
        companyId = newCompany.id;
        // "신규" 태그 자동 부여
        const { data: newTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", "신규")
          .single();
        if (newTag) {
          await supabase.from("company_tags").upsert({
            company_id: newCompany.id,
            tag_id: newTag.id,
          }, { onConflict: "company_id,tag_id" });
        }
      }
    } catch {
      // RLS block — continue without
    }
  }

  // 3. 문의 접수 (tracking_code는 DB 트리거 자동 생성)
  const { data: inquiry, error } = await supabase
    .from("bid_inquiries")
    .insert({
      bid_id: bid_id || null,
      company_name: company_name || null,
      contact_name,
      phone: phone || null,
      email: email || null,
      message,
      service_type: service_type || "proposal",
      company_id: companyId,
    })
    .select("tracking_code")
    .single();

  if (error) {
    return NextResponse.json({ error: "저장 실패: " + error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tracking_code: inquiry?.tracking_code,
  });
}

// GET: 추적코드로 진행 상태 조회 (로그인 불필요)
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const phone = request.nextUrl.searchParams.get("phone");

  if (!code && !phone) {
    return NextResponse.json({ error: "추적코드 또는 전화번호가 필요합니다." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from("bid_inquiries")
    .select("tracking_code, company_name, contact_name, service_type, status, admin_note, created_at, updated_at, bids(title, organization, field)")
    .order("created_at", { ascending: false });

  if (code) {
    query = query.eq("tracking_code", code);
  } else if (phone) {
    query = query.eq("phone", phone);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
