import { SIDO_FULL_MAP, type Sido } from "@/lib/constants/regions";

export function parseSido(address: string): Sido | "기타" {
  for (const [full, short] of Object.entries(SIDO_FULL_MAP)) {
    if (address.includes(full) || address.startsWith(short)) {
      return short;
    }
  }
  return "기타";
}

export function parseSigungu(address: string): string {
  const match = address.match(
    /(?:시|도|광역시|특별시|특별자치시|특별자치도)\s*(\S+?[구군시])/
  );
  if (match) return match[1];

  const parts = address.split(/\s+/);
  for (const p of parts.slice(1, 3)) {
    if (/[구군시]$/.test(p)) return p;
  }
  return "기타";
}
