import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 업종 키워드 매핑 (태그명 → 관련 키워드)
const TAG_KEYWORDS: Record<string, string[]> = {
  "CNC/기계가공": ["cnc", "기계가공", "절삭", "밀링", "선반", "머시닝", "공작기계", "금속가공"],
  "금형/사출": ["금형", "사출", "프레스", "다이캐스팅", "주조", "단조", "성형"],
  "자동차부품": ["자동차", "차량", "오토", "모터", "엔진", "브레이크", "샤시", "자동차부품"],
  "전자/반도체": ["전자", "반도체", "pcb", "회로", "전기전자", "디스플레이", "led", "센서", "전자부품"],
  "식품": ["식품", "음료", "제과", "식자재", "냉동", "유가공", "축산"],
  "화학/소재": ["화학", "소재", "플라스틱", "고무", "도금", "표면처리", "코팅", "섬유"],
  "로봇/자동화": ["로봇", "자동화", "automation", "자동검사", "자동조립", "자동포장", "fa", "plc", "제어"],
  "SW/IT": ["소프트웨어", "it", "ai", "인공지능", "데이터", "클라우드", "솔루션", "프로그램"],
};

// 규모 키워드
const SIZE_KEYWORDS: Record<string, string[]> = {
  "소상공인 (10인 미만)": ["1인", "개인", "소규모", "소호"],
  "소기업 (10~49인)": ["소기업", "중소"],
  "중기업 (50~299인)": ["중기업", "중견"],
  "중견기업 (300인+)": ["중견기업", "대기업", "상장"],
};

// 비즈니스 키워드 → 추가 태그 제안
const EXTRA_TAG_SUGGESTIONS: Record<string, string[]> = {
  "검사장비": ["검사", "측정", "시험", "품질검사", "비전검사", "자동검사"],
  "포장/물류": ["포장", "물류", "배송", "창고", "팔레트"],
  "에너지/환경": ["에너지", "태양광", "환경", "폐수", "재활용"],
  "의료/바이오": ["의료", "바이오", "제약", "의료기기"],
  "항공/방산": ["항공", "방산", "군수", "국방"],
  "조선/해양": ["조선", "해양", "선박"],
  "건설/플랜트": ["건설", "플랜트", "토목", "시공"],
};

interface DbKeyword {
  tag_name: string;
  keyword_type: string;
  keywords: string[];
}

function extractTagsFromText(text: string, dbKeywords: DbKeyword[]): {
  matched: { tagName: string; type: "industry" | "size"; confidence: number }[];
  suggested: { tagName: string; keywords: string[] }[];
} {
  const lower = text.toLowerCase();
  const matched: { tagName: string; type: "industry" | "size"; confidence: number }[] = [];
  const suggested: { tagName: string; keywords: string[] }[] = [];

  // DB 키워드 우선, 없으면 하드코딩 fallback
  const industryKw = dbKeywords.length > 0
    ? dbKeywords.filter(k => k.keyword_type === "industry")
    : Object.entries(TAG_KEYWORDS).map(([tag_name, keywords]) => ({ tag_name, keyword_type: "industry", keywords }));

  const sizeKw = dbKeywords.length > 0
    ? dbKeywords.filter(k => k.keyword_type === "size")
    : Object.entries(SIZE_KEYWORDS).map(([tag_name, keywords]) => ({ tag_name, keyword_type: "size", keywords }));

  const businessKw = dbKeywords.length > 0
    ? dbKeywords.filter(k => k.keyword_type === "business")
    : Object.entries(EXTRA_TAG_SUGGESTIONS).map(([tag_name, keywords]) => ({ tag_name, keyword_type: "business", keywords }));

  for (const kw of industryKw) {
    const hits = kw.keywords.filter((k) => lower.includes(k));
    if (hits.length > 0) {
      matched.push({ tagName: kw.tag_name, type: "industry", confidence: Math.min(1, hits.length * 0.3 + 0.2) });
    }
  }

  for (const kw of sizeKw) {
    const hits = kw.keywords.filter((k) => lower.includes(k));
    if (hits.length > 0) {
      matched.push({ tagName: kw.tag_name, type: "size", confidence: Math.min(1, hits.length * 0.4) });
    }
  }

  for (const kw of businessKw) {
    const hits = kw.keywords.filter((k) => lower.includes(k));
    if (hits.length > 0) {
      suggested.push({ tagName: kw.tag_name, keywords: hits });
    }
  }

  matched.sort((a, b) => b.confidence - a.confidence);
  return { matched, suggested };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 기업 정보 가져오기
  const { data: company } = await supabase
    .from("companies")
    .select("name, memo, address, website, company_tags(tag_id)")
    .eq("id", id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 홈페이지에서 텍스트 추출
  let websiteText = "";
  if (company.website) {
    try {
      const res = await fetch(company.website, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });
      if (res.ok) {
        const html = await res.text();
        // HTML 태그 제거, 텍스트만 추출
        websiteText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .substring(0, 3000); // 최대 3000자
      }
    } catch {
      // 홈페이지 접근 실패 무시
    }
  }

  // 분석할 텍스트 조합 (기업명 + 메모 + 주소 + 홈페이지 텍스트)
  const textToAnalyze = [
    company.name,
    company.memo || "",
    company.address || "",
    websiteText,
  ].join(" ");

  // DB에서 키워드 사전 가져오기
  const { data: dbKeywords } = await supabase.from("tag_keywords").select("tag_name, keyword_type, keywords");

  const { matched, suggested } = extractTagsFromText(textToAnalyze, dbKeywords || []);

  // 기존 태그 목록 가져오기
  const { data: allTags } = await supabase.from("tags").select("id, name, type");
  const existingTagIds = new Set(
    (company.company_tags || []).map((ct: { tag_id: string }) => ct.tag_id)
  );

  // 매칭된 태그 중 DB에 있는 것 (하드코딩 키워드 매칭)
  const tagsToApply = matched
    .map((m) => {
      const dbTag = allTags?.find((t) => t.name === m.tagName);
      if (!dbTag) return null;
      return {
        ...m,
        tagId: dbTag.id,
        alreadyApplied: existingTagIds.has(dbTag.id),
      };
    })
    .filter(Boolean);

  // suggested 중 DB에 이미 태그가 존재하면 matched로 이동
  const finalSuggested = [];
  for (const s of suggested) {
    const dbTag = allTags?.find((t) => t.name === s.tagName);
    if (dbTag) {
      // DB에 이미 있음 → matched로 이동
      tagsToApply.push({
        tagName: s.tagName,
        type: "industry" as const,
        confidence: 0.5,
        tagId: dbTag.id,
        alreadyApplied: existingTagIds.has(dbTag.id),
      });
    } else {
      // DB에 없음 → 새 태그 제안 유지
      finalSuggested.push(s);
    }
  }

  return NextResponse.json({
    matched: tagsToApply,
    suggested: finalSuggested,
    sources: {
      name: !!company.name,
      memo: !!company.memo,
      website: !!websiteText,
      websiteLength: websiteText.length,
    },
  });
}
