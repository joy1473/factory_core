import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { company_ids, template_id } = await request.json();

  const { data: template } = await supabase
    .from("message_templates")
    .select("content")
    .eq("id", template_id)
    .single();

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, ceo, contact_person, email, sido, sigungu")
    .in("id", company_ids);

  const previews = (companies || []).map((c) => ({
    name: c.name,
    email: c.email ? c.email.split("\n")[0] : null,
    preview: template.content
      .replace(/{기업명}/g, c.name || "")
      .replace(/{대표자}/g, c.ceo || "")
      .replace(/{담당자}/g, c.contact_person || c.ceo || "담당자")
      .replace(/{지역}/g, `${c.sido} ${c.sigungu}`),
  }));

  return NextResponse.json({ previews });
}
