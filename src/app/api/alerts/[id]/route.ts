import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();

  if (action === "acknowledge") {
    await supabase.from("alerts").update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
    }).eq("id", id);
  } else if (action === "resolve") {
    await supabase.from("alerts").update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    }).eq("id", id);
  }

  return NextResponse.json({ success: true });
}
