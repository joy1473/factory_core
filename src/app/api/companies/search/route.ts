import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Public: 회사명 검색 (자동완성용, 로그인 불필요)
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // (주), 주식회사 등 제거하고 핵심 키워드만 추출
  const cleaned = q
    .replace(/\(주\)|주식회사|㈜|\(사\)|사단법인|재단법인/g, "")
    .trim();

  if (!cleaned) return NextResponse.json([]);

  const { data } = await supabase
    .from("companies")
    .select("id, name, contact_person, phone, email, address, sido, sigungu")
    .or(`name.ilike.%${cleaned}%`)
    .limit(5);

  return NextResponse.json(data || []);
}
