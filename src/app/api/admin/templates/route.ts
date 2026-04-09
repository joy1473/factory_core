import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("message_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      name: body.name,
      type: body.type || "email",
      content: body.content,
      template_type: body.template_type || "general",
      form_schema: body.form_schema || { questions: [] },
      email_subject: body.email_subject || null,
      match_rules: body.match_rules || {},
      status: body.status || "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
