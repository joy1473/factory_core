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

  const sido = request.nextUrl.searchParams.get("sido");

  if (sido) {
    // 특정 시도의 시군구 목록 + 카운트
    const { data } = await supabase.rpc("get_sigungu_counts", {
      p_sido: sido,
    });

    // fallback: RPC 없으면 직접 쿼리 (페이지네이션)
    if (!data) {
      const allSgg = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data: batch } = await supabase
          .from("companies")
          .select("sigungu")
          .eq("sido", sido)
          .range(from, from + batchSize - 1);
        if (!batch || batch.length === 0) break;
        allSgg.push(...batch);
        if (batch.length < batchSize) break;
        from += batchSize;
      }

      const counts: Record<string, number> = {};
      allSgg.forEach((c) => {
        counts[c.sigungu] = (counts[c.sigungu] || 0) + 1;
      });

      const result = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json(result);
    }

    return NextResponse.json(data);
  }

  // 시도 목록 + 카운트 (전체 데이터 순회)
  const allCompanies = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch } = await supabase
      .from("companies")
      .select("sido")
      .range(from, from + batchSize - 1);

    if (!batch || batch.length === 0) break;
    allCompanies.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  const counts: Record<string, number> = {};
  allCompanies.forEach((c) => {
    counts[c.sido] = (counts[c.sido] || 0) + 1;
  });

  const result = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(result);
}
