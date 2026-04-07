import sys, io, json, re, urllib.request, ssl
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ssl._create_default_https_context = ssl._create_unverified_context

SUPABASE_URL = "https://ajrxoolpjohapedgyysc.supabase.co"
ANON_KEY = "sb_publishable_SB_8NfJDlYCdkaPIKTGc0A_97z0QYRl"

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

with open('C:/Users/joyte/Documents/스마트팩토리/smart_factory_suppliers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Importing {len(data)} companies to Supabase...")

# Batch insert via PostgREST (max ~1000 per request to be safe)
BATCH = 500
total_ok = 0
total_fail = 0

for i in range(0, len(data), BATCH):
    batch = data[i:i+BATCH]
    rows = []
    for d in batch:
        addr = d.get('주소', '')
        rows.append({
            'name': d.get('기업명', ''),
            'ceo': d.get('대표자명') or None,
            'contact_person': d.get('담당자') or None,
            'phone': d.get('담당자연락처') or None,
            'address': addr,
            'sido': parse_sido(addr),
            'sigungu': parse_sigungu(addr),
            'source_id': d.get('부여번호') or None,
        })

    body = json.dumps(rows).encode('utf-8')
    url = f"{SUPABASE_URL}/rest/v1/companies"

    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('apikey', ANON_KEY)
    req.add_header('Authorization', f'Bearer {ANON_KEY}')
    req.add_header('Prefer', 'resolution=ignore-duplicates,return=minimal')

    try:
        resp = urllib.request.urlopen(req)
        status = resp.getcode()
        total_ok += len(batch)
        print(f"  Batch {i//BATCH+1}: {len(batch)} rows → {status} OK (total: {total_ok})")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"  Batch {i//BATCH+1}: ERROR {e.code} → {err_body[:200]}")
        total_fail += len(batch)

print(f"\nDone! OK: {total_ok}, Failed: {total_fail}")
