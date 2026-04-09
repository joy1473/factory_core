import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templateId = request.nextUrl.searchParams.get("template_id");

  let query = supabase
    .from("survey_responses")
    .select("*, message_templates(name, form_schema), send_history(company_id, phone, companies(name))")
    .order("completed_at", { ascending: false })
    .limit(200);

  if (templateId) {
    query = query.eq("template_id", templateId);
  }

  const { data } = await query;
  return NextResponse.json(data || []);
}
