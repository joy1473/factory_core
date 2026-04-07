import sys, io, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SIDO_MAP = {
    '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
    '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
    '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기',
    '강원특별자치도': '강원', '강원도': '강원', '충청북도': '충북',
    '충청남도': '충남', '전북특별자치도': '전북', '전라북도': '전북',
    '전라남도': '전남', '경상북도': '경북', '경상남도': '경남',
    '제주특별자치도': '제주',
}

def parse_sido(addr):
    for full, short in SIDO_MAP.items():
        if full in addr or addr.startswith(short):
            return short
    return '기타'

def parse_sigungu(addr):
    m = re.search(r'(?:시|도|광역시|특별시|특별자치시|특별자치도)\s*(\S+?[구군시])', addr)
    if m: return m.group(1)
    parts = addr.split()
    for p in parts[1:3]:
        if re.search(r'[구군시]$', p): return p
    return '기타'

def esc(s):
    if not s: return 'NULL'
    return "'" + s.replace("'", "''") + "'"

with open('C:/Users/joyte/Documents/스마트팩토리/smart_factory_suppliers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Generating SQL for {len(data)} companies...")

lines = []
for d in data:
    addr = d.get('주소', '')
    vals = [
        esc(d.get('기업명', '')),
        esc(d.get('대표자명')),
        esc(d.get('담당자')),
        esc(d.get('담당자연락처')),
        esc(addr),
        esc(parse_sido(addr)),
        esc(parse_sigungu(addr)),
        str(d.get('부여번호', 'NULL') or 'NULL'),
    ]
    lines.append(f"({', '.join(vals)})")

sql = f"""INSERT INTO companies (name, ceo, contact_person, phone, address, sido, sigungu, source_id) VALUES
{',\n'.join(lines)}
ON CONFLICT (source_id) DO NOTHING;
"""

with open('C:/www/claude/factory_core/scripts/import.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Done! scripts/import.sql ({len(data)} rows)")
