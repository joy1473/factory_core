import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: 모든 편집 가능 콘텐츠 조회
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const table = request.nextUrl.searchParams.get("table");

  if (table === "company_info") {
    const { data } = await supabase.from("company_info").select("*").limit(1).single();
    return NextResponse.json(data);
  }

  if (table === "tag_keywords") {
    const { data } = await supabase.from("tag_keywords").select("*").order("keyword_type").order("tag_name");
    return NextResponse.json(data || []);
  }

  if (table === "scene_presets") {
    const { data } = await supabase.from("scene_presets").select("*").order("sort_order");
    return NextResponse.json(data || []);
  }

  return NextResponse.json({ error: "Unknown table" }, { status: 400 });
}

// PATCH: 레코드 업데이트
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { table, id, updates } = await request.json();

  if (!table || !id || !updates) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const allowed = ["company_info", "tag_keywords", "scene_presets"];
  if (!allowed.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: 새 레코드 추가 (tag_keywords)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { table, record } = await request.json();

  if (table === "tag_keywords") {
    const { data, error } = await supabase.from("tag_keywords").insert(record).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Not supported" }, { status: 400 });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { table, id } = await request.json();

  if (table === "tag_keywords") {
    const { error } = await supabase.from("tag_keywords").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not supported" }, { status: 400 });
}
