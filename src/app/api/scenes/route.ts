import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from("factory_scenes")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("factory_scenes")
    .insert({
      name: body.name,
      description: body.description,
      splat_url: body.splat_url,
      thumbnail_url: body.thumbnail_url,
      camera_position: body.camera_position || { x: 0, y: 5, z: 10 },
      camera_target: body.camera_target || { x: 0, y: 0, z: 0 },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
