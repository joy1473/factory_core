import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [companies, tags, history, newInquiries, newBidInquiries] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("tags").select("*", { count: "exact", head: true }),
    supabase.from("send_history").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("bid_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return NextResponse.json({
    companies: companies.count || 0,
    tags: tags.count || 0,
    sent: history.count || 0,
    unreadInquiries: (newInquiries.count || 0) + (newBidInquiries.count || 0),
  });
}
