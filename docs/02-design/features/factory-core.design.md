# Factory Core (팩토리코어) — Design Document

> Plan 참조: `docs/01-plan/features/factory-core.plan.md`

---

## 1. 프로젝트 구조

```
factory_core/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Public)
│   │   ├── page.tsx                  # 랜딩 페이지
│   │   ├── solution/page.tsx         # 솔루션 상세
│   │   ├── poc/page.tsx              # PoC 신청
│   │   ├── contact/page.tsx          # 문의
│   │   ├── privacy/page.tsx          # 개인정보처리방침
│   │   ├── api/
│   │   │   ├── inquiries/route.ts    # 문의 접수 API
│   │   │   ├── companies/
│   │   │   │   ├── route.ts          # 기업 목록 API
│   │   │   │   ├── [id]/route.ts     # 기업 상세 API
│   │   │   │   ├── import/route.ts   # 공공데이터 import API
│   │   │   │   └── tags/route.ts     # 기업 태그 일괄 API
│   │   │   ├── tags/route.ts         # 태그 CRUD API
│   │   │   ├── templates/route.ts    # 템플릿 CRUD API
│   │   │   ├── send/route.ts         # 알림톡 발송 API
│   │   │   └── history/route.ts      # 발송 이력 API
│   │   └── admin/                    # Admin 영역
│   │       ├── layout.tsx            # Admin layout (인증 가드)
│   │       ├── page.tsx              # Admin 대시보드
│   │       ├── companies/
│   │       │   ├── page.tsx          # 기업 목록
│   │       │   └── [id]/page.tsx     # 기업 상세
│   │       ├── tags/page.tsx         # 태그 관리
│   │       ├── templates/page.tsx    # 템플릿 관리
│   │       ├── send/page.tsx         # 발송 화면
│   │       ├── history/page.tsx      # 발송 이력
│   │       ├── inquiries/page.tsx    # 문의 목록
│   │       └── login/page.tsx        # Admin 로그인
│   ├── components/
│   │   ├── public/                   # Public 컴포넌트
│   │   │   ├── hero-section.tsx
│   │   │   ├── solution-overview.tsx
│   │   │   ├── stats-section.tsx
│   │   │   ├── contact-form.tsx
│   │   │   └── footer.tsx
│   │   ├── admin/                    # Admin 컴포넌트
│   │   │   ├── sidebar.tsx
│   │   │   ├── company-table.tsx
│   │   │   ├── company-filters.tsx
│   │   │   ├── tag-manager.tsx
│   │   │   ├── template-editor.tsx
│   │   │   ├── send-preview.tsx
│   │   │   ├── send-dashboard.tsx
│   │   │   └── history-table.tsx
│   │   └── ui/                       # 공통 UI
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── modal.tsx
│   │       ├── table.tsx
│   │       ├── badge.tsx
│   │       ├── toast.tsx
│   │       └── loading.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase 클라이언트 (브라우저)
│   │   │   ├── server.ts             # Supabase 서버 클라이언트
│   │   │   └── admin.ts              # Supabase Admin 클라이언트
│   │   ├── api/
│   │   │   ├── open-data.ts          # 공공데이터포털 API
│   │   │   └── kakao-biz.ts          # 카카오 비즈메시지 API
│   │   ├── utils/
│   │   │   ├── address-parser.ts     # 주소 → 시도/시군구 파싱
│   │   │   ├── template-engine.ts    # 변수 치환 엔진
│   │   │   └── csv.ts               # CSV import/export
│   │   └── constants/
│   │       ├── regions.ts            # 시도/시군구 상수
│   │       └── industry-tags.ts      # 업종 분류 상수
│   ├── store/
│   │   ├── company-store.ts          # 기업 선택 상태 (Zustand)
│   │   └── send-store.ts            # 발송 상태 (Zustand)
│   └── types/
│       ├── database.ts               # Supabase 타입 (generated)
│       ├── company.ts
│       ├── template.ts
│       └── send.ts
├── public/
│   ├── images/
│   │   ├── logo.svg                  # Factory Core 로고
│   │   ├── hero-bg.webp
│   │   └── solution/                 # 솔루션 이미지
│   └── favicon.ico
├── supabase/
│   └── migrations/
│       ├── 001_companies.sql
│       ├── 002_tags.sql
│       ├── 003_templates.sql
│       ├── 004_send_history.sql
│       ├── 005_inquiries.sql
│       └── 006_rls_policies.sql
├── .env.local                        # 환경변수 (gitignore)
├── .env.example                      # 환경변수 예시
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 2. 데이터베이스 설계 (Supabase)

### 2.1 ERD

```
┌─────────────┐       ┌──────────────┐       ┌───────────────────┐
│  companies   │──M:N──│ company_tags │──M:N──│      tags         │
│─────────────│       │──────────────│       │───────────────────│
│ id (PK)      │       │ company_id   │       │ id (PK)           │
│ name         │       │ tag_id       │       │ type              │
│ ceo          │       │ created_at   │       │ name              │
│ contact_person│       └──────────────┘       │ color             │
│ phone        │                               │ created_at        │
│ address      │       ┌──────────────┐       └───────────────────┘
│ sido         │──1:N──│ send_history │
│ sigungu      │       │──────────────│       ┌───────────────────┐
│ source_id    │       │ id (PK)      │──N:1──│ message_templates │
│ email        │       │ company_id   │       │───────────────────│
│ website      │       │ template_id  │       │ id (PK)           │
│ memo         │       │ sent_at      │       │ name              │
│ created_at   │       │ status       │       │ type              │
│ updated_at   │       │ result_code  │       │ kakao_tpl_code    │
└─────────────┘       │ result_msg   │       │ content           │
                       └──────────────┘       │ match_rules (jsonb)│
                                               │ status            │
┌─────────────┐                               │ created_at        │
│  inquiries   │                               └───────────────────┘
│─────────────│
│ id (PK)      │
│ company_name │
│ contact_name │
│ phone        │
│ email        │
│ message      │
│ type         │
│ created_at   │
└─────────────┘
```

### 2.2 SQL Migrations

#### 001_companies.sql
```sql
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ceo TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  sido TEXT,
  sigungu TEXT,
  source_id INTEGER,
  email TEXT,
  website TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companies_sido ON companies(sido);
CREATE INDEX idx_companies_sigungu ON companies(sigungu);
CREATE INDEX idx_companies_name ON companies USING gin(to_tsvector('simple', name));
CREATE UNIQUE INDEX idx_companies_source_id ON companies(source_id) WHERE source_id IS NOT NULL;
```

#### 002_tags.sql
```sql
CREATE TYPE tag_type AS ENUM ('industry', 'size', 'custom');

CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type tag_type NOT NULL DEFAULT 'custom',
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00d4ff',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE company_tags (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (company_id, tag_id)
);

-- 기본 업종 태그 시드
INSERT INTO tags (type, name, color) VALUES
  ('industry', 'CNC/기계가공', '#00d4ff'),
  ('industry', '금형/사출', '#00ff88'),
  ('industry', '자동차부품', '#ffaa00'),
  ('industry', '전자/반도체', '#ff6644'),
  ('industry', '식품', '#aa88ff'),
  ('industry', '화학/소재', '#ff88aa'),
  ('industry', '로봇/자동화', '#44ddff'),
  ('industry', 'SW/IT', '#88ff88'),
  ('size', '소상공인 (10인 미만)', '#888888'),
  ('size', '소기업 (10~49인)', '#aaaaaa'),
  ('size', '중기업 (50~299인)', '#cccccc'),
  ('size', '중견기업 (300인+)', '#ffffff');
```

#### 003_templates.sql
```sql
CREATE TYPE template_type AS ENUM ('alimtalk', 'friendtalk');
CREATE TYPE template_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

CREATE TABLE message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type template_type NOT NULL DEFAULT 'alimtalk',
  kakao_template_code TEXT,
  content TEXT NOT NULL,
  match_rules JSONB DEFAULT '{}',
  status template_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- match_rules 예시:
-- { "industry": ["자동차부품", "CNC/기계가공"], "size": ["중기업"], "sido": ["서울", "경기"] }
-- 빈 {} = 모든 기업에 매칭 (기본 템플릿)
```

#### 004_send_history.sql
```sql
CREATE TYPE send_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

CREATE TABLE send_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  rendered_content TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status send_status NOT NULL DEFAULT 'pending',
  result_code TEXT,
  result_message TEXT
);

CREATE INDEX idx_send_history_company ON send_history(company_id);
CREATE INDEX idx_send_history_status ON send_history(status);
CREATE INDEX idx_send_history_sent_at ON send_history(sent_at DESC);
```

#### 005_inquiries.sql
```sql
CREATE TYPE inquiry_type AS ENUM ('poc', 'general', 'survey');

CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  type inquiry_type NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 006_rls_policies.sql
```sql
-- Public: inquiries INSERT만 허용 (문의 폼)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT WITH CHECK (true);

-- Admin: 모든 테이블 full access (인증된 사용자)
-- companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access companies"
  ON companies FOR ALL USING (auth.role() = 'authenticated');

-- tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access tags"
  ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read tags"
  ON tags FOR SELECT USING (true);

-- company_tags
ALTER TABLE company_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access company_tags"
  ON company_tags FOR ALL USING (auth.role() = 'authenticated');

-- message_templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access templates"
  ON message_templates FOR ALL USING (auth.role() = 'authenticated');

-- send_history
ALTER TABLE send_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access history"
  ON send_history FOR ALL USING (auth.role() = 'authenticated');

-- inquiries read
CREATE POLICY "Admin read inquiries"
  ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update inquiries"
  ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
```

---

## 3. API 설계

### 3.1 내부 API (Next.js Route Handlers)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| GET | `/api/companies` | 기업 목록 (필터·검색·페이지네이션) | Admin |
| GET | `/api/companies/[id]` | 기업 상세 | Admin |
| PATCH | `/api/companies/[id]` | 기업 수정 (메모, 이메일 등) | Admin |
| POST | `/api/companies/import` | 공공데이터 API → Supabase import | Admin |
| POST | `/api/companies/tags` | 기업 태그 일괄 부여/제거 | Admin |
| GET | `/api/tags` | 태그 목록 | Admin |
| POST | `/api/tags` | 태그 생성 | Admin |
| DELETE | `/api/tags/[id]` | 태그 삭제 | Admin |
| GET | `/api/templates` | 템플릿 목록 | Admin |
| POST | `/api/templates` | 템플릿 생성 | Admin |
| PATCH | `/api/templates/[id]` | 템플릿 수정 | Admin |
| DELETE | `/api/templates/[id]` | 템플릿 삭제 | Admin |
| POST | `/api/send` | 알림톡 발송 (선택 기업 + 템플릿) | Admin |
| GET | `/api/history` | 발송 이력 | Admin |
| POST | `/api/inquiries` | 문의 접수 | Public |
| GET | `/api/inquiries` | 문의 목록 | Admin |

### 3.2 기업 목록 API 상세

```
GET /api/companies?sido=서울&sigungu=강서구&search=로봇&tag=자동차부품&page=1&limit=50

Response:
{
  "data": [Company],
  "total": 76,
  "page": 1,
  "limit": 50,
  "filters": { "sido": "서울", "sigungu": "강서구" }
}
```

### 3.3 발송 API 상세

```
POST /api/send
{
  "company_ids": ["uuid1", "uuid2", ...],
  "template_id": "uuid",
  "override_content": null  // 개별 수정 시 사용
}

Response:
{
  "total": 50,
  "sent": 48,
  "failed": 2,
  "results": [{ "company_id": "uuid", "status": "sent" | "failed", "error": "..." }]
}
```

### 3.4 외부 API 연동

#### 공공데이터포털
```typescript
// lib/api/open-data.ts
const BASE_URL = 'https://api.odcloud.kr/api/15042132/v1';
const ENDPOINT = 'uddi:c091651b-a82a-426d-8975-9361d78c41a8'; // 최신(20250910)
const API_KEY = process.env.OPEN_DATA_API_KEY;

async function fetchSuppliers(page: number, perPage: number = 500) {
  const url = `${BASE_URL}/${ENDPOINT}?page=${page}&perPage=${perPage}&serviceKey=${API_KEY}`;
  // ... fetch + parse
}
```

#### 카카오 비즈메시지
```typescript
// lib/api/kakao-biz.ts
// 카카오 알림톡 발송 API (Phase 3에서 구현)
// - 비즈 채널 개설 후 API Key 발급 필요
// - 템플릿 사전 등록 + 검수 승인 필요
// - 발송 속도 제한: 초당 50건

interface SendAlimtalkParams {
  phone: string;
  templateCode: string;
  variables: Record<string, string>; // {기업명}, {담당자명} 등
}
```

---

## 4. 컴포넌트 설계

### 4.1 Public 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|---------|------|------|
| `HeroSection` | 랜딩 페이지 상단 | Factory Core 비전, CTA 버튼 |
| `StatsSection` | 랜딩 페이지 | 시장 데이터 시각화 (163,273개사, 0.1% AI 등) |
| `SolutionOverview` | 랜딩 + /solution | 멀티모달 AI 설명 (시각/청각/촉각) |
| `ContactForm` | /contact, /poc | 문의·PoC 신청 폼 → Supabase inquiries |
| `Footer` | 전체 | 회사 정보 (조이텍), 링크 |

### 4.2 Admin 컴포넌트

| 컴포넌트 | 역할 | 주요 props/state |
|---------|------|-----------------|
| `Sidebar` | Admin 네비게이션 | 현재 경로 하이라이트 |
| `CompanyTable` | 기업 목록 테이블 | companies[], selectedIds, onSelect |
| `CompanyFilters` | 시도/시군구/태그/검색 필터 | filters, onFilterChange |
| `TagManager` | 태그 CRUD + 기업에 부여 | tags[], onTagCreate/Delete/Assign |
| `TemplateEditor` | 템플릿 작성/수정 | template, variables, onSave |
| `SendPreview` | 발송 전 미리보기 | selectedCompanies[], template, renderedMessages[] |
| `SendDashboard` | 발송 현황 통계 | stats {total, sent, failed, delivered} |
| `HistoryTable` | 발송 이력 목록 | history[], filters |

### 4.3 템플릿 엔진 설계

```typescript
// lib/utils/template-engine.ts

// 사용 가능한 변수
type TemplateVariable = 
  | '{기업명}'      // company.name
  | '{대표자}'      // company.ceo
  | '{담당자}'      // company.contact_person
  | '{지역}'        // company.sido + company.sigungu
  | '{업종}'        // company의 industry 태그
  | '{규모}'        // company의 size 태그

function renderTemplate(
  template: string,
  company: Company,
  tags: Tag[]
): string {
  return template
    .replace(/{기업명}/g, company.name)
    .replace(/{대표자}/g, company.ceo || '')
    .replace(/{담당자}/g, company.contact_person || company.ceo || '')
    .replace(/{지역}/g, `${company.sido} ${company.sigungu}`)
    .replace(/{업종}/g, getIndustryTag(tags) || '제조업')
    .replace(/{규모}/g, getSizeTag(tags) || '');
}

// 매칭 규칙 엔진
function matchTemplate(
  templates: Template[],
  company: Company,
  companyTags: Tag[]
): Template | null {
  // 1. 가장 구체적인 매칭 우선 (업종+규모+지역 모두 매칭)
  // 2. 부분 매칭 (업종만, 지역만 등)
  // 3. 기본 템플릿 (match_rules = {})
  // → 점수 기반 정렬 후 최상위 반환
}
```

---

## 5. 인증 설계

```
Admin 전용 (운영자 1인):
- Supabase Auth (이메일+비밀번호)
- /admin/login 에서 로그인
- /admin/layout.tsx 에서 세션 체크 → 미인증 시 /admin/login 리다이렉트
- 환경변수로 허용 이메일 제한: ADMIN_EMAIL=admin@joy.it.kr

Public:
- 인증 없음
- inquiries INSERT만 Supabase anon key로 가능 (RLS)
```

---

## 6. 환경변수

```env
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 공공데이터포털
OPEN_DATA_API_KEY=c77d3b139646ce8034ab378fe9f002eeadd86594d818d22d7c01cb2ad45ab5c5

# 카카오 비즈메시지 (Phase 3)
KAKAO_BIZ_APP_KEY=
KAKAO_BIZ_SENDER_KEY=

# Admin
ADMIN_EMAIL=admin@joy.it.kr
```

---

## 7. UI/UX 설계

### 7.1 디자인 테마

```
브랜드: Factory Core
컨셉: 매트릭스 + 산업 AI
색상:
  Primary: #00d4ff (네온 블루)
  Secondary: #00ff88 (매트릭스 그린)
  Accent: #ffaa00 (경고 오렌지)
  Danger: #ff4444
  Background: #0a0a0a (딥 블랙)
  Surface: #111111
  Border: #1a1a2e
  Text: #e0e0e0

폰트: Pretendard (본문), JetBrains Mono (코드/숫자)
```

### 7.2 Admin 레이아웃

```
┌─────────┬──────────────────────────────────┐
│         │  Header (Factory Core + 사용자)   │
│ Sidebar ├──────────────────────────────────┤
│         │                                    │
│ 대시보드 │  Main Content                     │
│ 기업관리 │                                    │
│ 태그     │  (CompanyTable / Templates /       │
│ 템플릿   │   SendPreview / History 등)        │
│ 발송     │                                    │
│ 이력     │                                    │
│ 문의     │                                    │
│         │                                    │
└─────────┴──────────────────────────────────┘
```

### 7.3 발송 플로우 (핵심 UX)

```
Step 1: 기업 선택
┌────────────────────────────────────┐
│ [시도 ▼] [시군구 ▼] [태그 ▼] 🔍   │
│ ☑ 전체선택  검색결과: 76개         │
│ ☑ (주)동우텍     대전 유성구       │
│ ☑ 비스캣         서울 성동구       │
│ ☐ 제이에스테크   광주 광산구       │
│ ...                                │
│         [다음: 템플릿 선택 →]      │
└────────────────────────────────────┘

Step 2: 템플릿 매칭
┌────────────────────────────────────┐
│ 선택 기업: 48개                    │
│ 매칭 결과:                         │
│  자동차부품 템플릿 → 12개 매칭     │
│  일반 제조업 템플릿 → 36개 매칭    │
│                                    │
│ [미리보기 →]                       │
└────────────────────────────────────┘

Step 3: 미리보기 + 발송
┌────────────────────────────────────┐
│ 📱 미리보기                        │
│ ┌──────────────────────┐           │
│ │ (주)동우텍 님,        │           │
│ │ 스마트공장 AI 솔루션  │           │
│ │ Factory Guardian...   │           │
│ └──────────────────────┘           │
│ ← 이전 기업 | 다음 기업 →          │
│                                    │
│ [📤 48건 발송하기]                 │
└────────────────────────────────────┘
```

---

## 8. 구현 순서 (Phase 1 상세)

```
Day 1 (4/8):
  □ GitHub repo 생성
  □ Next.js 16 + TypeScript + Tailwind CSS 4 프로젝트 생성
  □ 기본 폴더 구조 세팅
  □ .env.example 작성
  □ Supabase 프로젝트 생성

Day 2 (4/9):
  □ Supabase 마이그레이션 파일 작성 + 실행
  □ Supabase 클라이언트 설정 (client.ts, server.ts)
  □ 타입 생성 (supabase gen types)

Day 3 (4/10):
  □ Public layout + 공통 UI 컴포넌트
  □ Footer (조이텍 회사 정보)
  □ 랜딩 페이지 HeroSection
  □ StatsSection (시장 데이터)

Day 4 (4/11):
  □ SolutionOverview 컴포넌트
  □ ContactForm + /api/inquiries
  □ /privacy 페이지

Day 5 (4/14):
  □ Vercel 배포
  □ joy.it.kr DNS 설정
  □ 최종 테스트
  □ → 카카오 비즈니스 채널 신청 (사용자)
```

---

## 9. 패키지 의존성

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "zustand": "^5.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "supabase": "^2.0.0"
  }
}
```
