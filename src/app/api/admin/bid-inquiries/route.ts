import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("bid_inquiries")
    .select("*, bids(title, organization, field)")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json(data || []);
}
