# Survey Form System — Design Document

> **Plan 참조**: `docs/01-plan/features/survey-form-system.plan.md`
> **Date**: 2026-04-09
> **Status**: Draft

---

## 1. DB Migrations

### 1.1 message_templates 확장

```sql
ALTER TABLE message_templates
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'general'
  CHECK (template_type IN ('interview', 'inquiry', 'general')),
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '{"questions":[]}'::jsonb,
ADD COLUMN IF NOT EXISTS email_subject TEXT;
```

### 1.2 email_tracking 테이블

```sql
CREATE TABLE email_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  history_id UUID NOT NULL REFERENCES send_history(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  event_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX idx_email_tracking_history ON email_tracking(history_id);

ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert tracking" ON email_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read tracking" ON email_tracking FOR SELECT USING (auth.role() = 'authenticated');
```

### 1.3 survey_responses 테이블

```sql
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES message_templates(id),
  history_id UUID REFERENCES send_history(id),
  token TEXT UNIQUE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  respondent_info JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_survey_responses_template ON survey_responses(template_id);
CREATE INDEX idx_survey_responses_token ON survey_responses(token);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert survey" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select own survey" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Admin read surveys" ON survey_responses FOR SELECT USING (auth.role() = 'authenticated');
```

### 1.4 send_history 확장

```sql
ALTER TABLE send_history
ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS open_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
```

---

## 2. API 설계

### 2.1 추적 API (Public, No Auth)

#### GET /api/track/open

```
Query: ?hid={history_id}&t={token}
Action:
  1. email_tracking INSERT (event_type='open', history_id, ip, ua)
  2. send_history UPDATE open_at = now() WHERE id=hid AND open_at IS NULL
  3. Response: 1x1 투명 GIF (image/gif)
```

#### GET /api/track/click

```
Query: ?hid={history_id}&t={token}&to={redirect_path}
Action:
  1. email_tracking INSERT (event_type='click', history_id, ip, ua)
  2. send_history UPDATE click_at = now() WHERE id=hid AND click_at IS NULL
  3. Response: 302 Redirect → {to}
```

### 2.2 설문 API (Public, Token Auth)

#### GET /api/survey/[templateId]

```
Query: ?token={tracking_token}
Action:
  1. send_history에서 token 검증
  2. message_templates에서 form_schema 조회
  3. 이미 응답했는지 survey_responses 확인
Response: { template, formSchema, alreadyResponded }
```

#### POST /api/survey/submit

```
Body: { template_id, token, answers }
Action:
  1. token → send_history 매칭
  2. survey_responses INSERT
  3. send_history UPDATE responded_at = now()
Response: { success: true }
```

### 2.3 Admin API 확장

#### GET /api/admin/history (확장)

```
기존 + join email_tracking, survey_responses
→ 각 이력에 open_at, click_at, responded_at 포함
```

#### GET /api/admin/surveys

```
Query: ?template_id={id} (선택)
Action: survey_responses 목록 + template 정보
Response: [{ id, answers, respondent_info, completed_at, template_name, company_name }]
```

#### POST /api/admin/templates (확장)

```
기존 body + template_type, form_schema, email_subject
```

### 2.4 발송 API 확장 (send/route.ts)

```
기존 발송 흐름에 추가:
  1. tracking_token 생성 (crypto.randomUUID)
  2. send_history에 tracking_token 저장
  3. 이메일 HTML 변환:
     - 본문 끝에 추적 픽셀 <img> 삽입
     - form_schema가 있으면 설문 링크 버튼 삽입
     - 설문 링크: /api/track/click?hid=...&t=...&to=/survey/{templateId}?token=...
```

---

## 3. 이메일 HTML 템플릿

```html
<!-- 본문 (기존 텍스트 → HTML 변환) -->
<div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #FDF6EC; padding: 30px; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://joy.it.kr/favicon.png" width="40" height="40" />
      <h2 style="color: #3a3226;">Factory Core</h2>
    </div>
    
    <div style="color: #3a3226; line-height: 1.8;">
      {본문 내용}
    </div>
    
    <!-- 설문 링크 (form_schema 있을 때만) -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{survey_link}" style="background: #5aaa8a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        설문 참여하기
      </a>
    </div>
    
    <div style="color: #8a7d6f; font-size: 12px; margin-top: 30px; border-top: 1px solid #e8ddd0; padding-top: 15px;">
      조이텍 | joy.it.kr | joytec@naver.com
    </div>
  </div>
</div>

<!-- 추적 픽셀 (항상) -->
<img src="https://joy.it.kr/api/track/open?hid={hid}&t={token}" width="1" height="1" style="display:none" />
```

---

## 4. 설문 페이지 UI (/survey/[id])

### 4.1 레이아웃

```
┌──────────────────────────────────────┐
│  FC Logo    Factory Core             │
├──────────────────────────────────────┤
│                                      │
│  📋 {템플릿 이름}                    │
│  {설문 설명}                         │
│                                      │
│  Q1. 설비 점검 방법은? *             │
│  ○ 수기  ○ 엑셀  ○ 전용SW  ○ 없음  │
│                                      │
│  Q2. 스마트공장 관심도 *             │
│  ① ② ③ ④ ⑤                        │
│                                      │
│  Q3. 가장 큰 고충은?                 │
│  ┌─────────────────────────────┐     │
│  │                             │     │
│  └─────────────────────────────┘     │
│                                      │
│  [제출하기]                          │
│                                      │
├──────────────────────────────────────┤
│  © Factory Core · joy.it.kr          │
└──────────────────────────────────────┘
```

### 4.2 폼 컴포넌트 (SurveyField)

```typescript
// 질문 타입별 렌더링
type QuestionType = 'radio' | 'checkbox' | 'text' | 'textarea' | 'scale' | 'select';

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[];    // radio, checkbox, select
  min?: number;          // scale
  max?: number;          // scale
  placeholder?: string;  // text, textarea
}
```

### 4.3 상태별 화면

| 상태 | 화면 |
|------|------|
| 토큰 유효 | 설문 폼 표시 |
| 토큰 없음/무효 | "잘못된 링크입니다" |
| 이미 응답 완료 | "이미 응답하셨습니다. 감사합니다." |
| 제출 완료 | "응답이 저장되었습니다. 감사합니다!" |

---

## 5. Admin UI 확장

### 5.1 /admin/templates 확장

```
기존 템플릿 작성 폼에 추가:
  [템플릿 유형] ○ 현장 인터뷰  ○ 문의 후속  ○ 일반
  
  [이메일 본문] (기존)
  
  [설문 폼 편집기] (신규)
  ┌─────────────────────────────────────┐
  │ + 질문 추가                         │
  │                                     │
  │ Q1. ________ [radio ▼] [필수 ☑]    │
  │    선택지: ○ ___ ○ ___ [+ 추가]    │
  │    [↑] [↓] [삭제]                   │
  │                                     │
  │ Q2. ________ [text ▼]  [필수 ☐]    │
  │    [↑] [↓] [삭제]                   │
  └─────────────────────────────────────┘
```

### 5.2 /admin/history 확장

```
기존 이력 항목에 추가 아이콘:
  📨 발송 → 👁 열람(14:30) → 🔗 클릭(14:32) → ✅ 응답(14:35)
  
  각 아이콘은 시간이 있으면 활성, 없으면 회색
```

### 5.3 /admin/surveys (신규 페이지)

```
┌──────────────────────────────────────┐
│ 설문 응답 관리                        │
│                                      │
│ [템플릿 필터 ▼] [날짜 범위]          │
│                                      │
│ 통계 요약                            │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 12  │ │ 8   │ │ 66% │ │ 4.2 │    │
│ │발송 │ │응답 │ │응답률│ │평균 │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
│                                      │
│ Q1. 설비 점검 방법?                  │
│ ████████ 수기 45%                    │
│ ████ 엑셀 25%                        │
│ ██ 전용SW 15%                        │
│ ██ 없음 15%                          │
│                                      │
│ 개별 응답 목록                       │
│ ┌──────┬──────┬──────┬──────┐       │
│ │ 기업 │ 응답 │ 시간 │ 보기 │       │
│ ├──────┼──────┼──────┼──────┤       │
│ │ A사  │ 완료 │ 14:35│  →   │       │
│ │ B사  │ 완료 │ 15:12│  →   │       │
│ └──────┴──────┴──────┴──────┘       │
└──────────────────────────────────────┘
```

---

## 6. 파일 변경 목록

### 신규 파일

| File | Purpose |
|------|---------|
| `supabase/migrations/20260409000012_survey_system.sql` | DB 마이그레이션 |
| `src/app/api/track/open/route.ts` | 추적 픽셀 API |
| `src/app/api/track/click/route.ts` | 클릭 추적 API |
| `src/app/api/survey/[templateId]/route.ts` | 설문 데이터 조회 |
| `src/app/api/survey/submit/route.ts` | 설문 제출 |
| `src/app/api/admin/surveys/route.ts` | Admin 설문 응답 목록 |
| `src/app/survey/[id]/page.tsx` | Public 설문 페이지 |
| `src/app/admin/surveys/page.tsx` | Admin 설문 통계 페이지 |
| `src/components/survey/survey-form.tsx` | 설문 폼 렌더러 |
| `src/components/survey/survey-field.tsx` | 질문 타입별 컴포넌트 |
| `src/components/admin/form-schema-editor.tsx` | 폼 스키마 에디터 |
| `src/lib/email-html.ts` | 이메일 HTML 템플릿 생성 |

### 수정 파일

| File | Changes |
|------|---------|
| `src/app/api/admin/send/route.ts` | 추적 토큰 + 픽셀 + 설문 링크 삽입 |
| `src/app/api/admin/templates/route.ts` | template_type, form_schema, email_subject 지원 |
| `src/app/api/admin/history/route.ts` | open_at, click_at, responded_at join |
| `src/app/admin/templates/page.tsx` | 유형 선택 + 폼 스키마 에디터 UI |
| `src/app/admin/history/page.tsx` | 열람/클릭/응답 상태 아이콘 |
| `src/components/admin/sidebar.tsx` | "설문 응답" 메뉴 추가 |

---

## 7. 구현 순서

```
Phase A: DB + 추적 API
━━━━━━━━━━━━━━━━━━━━━
1. [ ] migration SQL 작성 + supabase db push
2. [ ] /api/track/open — 1x1 GIF + event 저장
3. [ ] /api/track/click — event 저장 + 302 redirect

Phase B: 설문 페이지
━━━━━━━━━━━━━━━━━━━━
4. [ ] survey-field.tsx — 6가지 질문 타입 렌더러
5. [ ] survey-form.tsx — 폼 스키마 → 동적 폼
6. [ ] /survey/[id]/page.tsx — 토큰 검증 + 폼 표시
7. [ ] /api/survey/[templateId]/route.ts — 스키마 조회
8. [ ] /api/survey/submit/route.ts — 응답 저장

Phase C: 이메일 발송 연동
━━━━━━━━━━━━━━━━━━━━━━━
9. [ ] lib/email-html.ts — HTML 이메일 템플릿
10. [ ] send/route.ts — 토큰 생성 + 픽셀 + 설문 링크

Phase D: Admin UI
━━━━━━━━━━━━━━━━━
11. [ ] form-schema-editor.tsx — 질문 추가/삭제/순서
12. [ ] templates/page.tsx — 유형 선택 + 에디터 통합
13. [ ] history/page.tsx — 열람/클릭/응답 아이콘
14. [ ] /admin/surveys/page.tsx — 응답 통계
15. [ ] sidebar.tsx — 메뉴 추가

Phase E: 시드 + 테스트
━━━━━━━━━━━━━━━━━━━━━
16. [ ] 현장 인터뷰 기본 템플릿 시드
17. [ ] 빌드 + 발송 테스트
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-09 | Initial draft | JOYTEC |
