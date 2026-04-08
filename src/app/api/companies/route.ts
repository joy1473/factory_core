import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl;
  const sido = url.searchParams.get("sido");
  const sigungu = url.searchParams.get("sigungu");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("companies")
    .select("*, company_tags(tag_id, tags(id, name, type, color))", {
      count: "exact",
    });

  if (sido) query = query.eq("sido", sido);
  if (sigungu) query = query.eq("sigungu", sigungu);
  if (search) query = query.or(
    `name.ilike.%${search}%,address.ilike.%${search}%,contact_person.ilike.%${search}%,ceo.ilike.%${search}%,email.ilike.%${search}%,website.ilike.%${search}%,memo.ilike.%${search}%,phone.ilike.%${search}%`
  );

  query = query.order("name").range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
  });
}
