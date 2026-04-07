import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 기업에 태그 일괄 부여/제거
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company_ids, tag_id, action } = await request.json();

  if (
    !company_ids?.length ||
    !tag_id ||
    !["add", "remove"].includes(action)
  ) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  if (action === "add") {
    const rows = company_ids.map((cid: string) => ({
      company_id: cid,
      tag_id,
    }));
    const { error } = await supabase
      .from("company_tags")
      .upsert(rows, { onConflict: "company_id,tag_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      count: company_ids.length,
    });
  }

  // remove
  const { error } = await supabase
    .from("company_tags")
    .delete()
    .eq("tag_id", tag_id)
    .in("company_id", company_ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, count: company_ids.length });
}
