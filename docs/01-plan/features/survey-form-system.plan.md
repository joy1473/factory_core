# Survey Form System — Plan Document

> **Summary**: 템플릿 기반 이메일 발송 + 웹 설문 + 열람/클릭/응답 추적 시스템
>
> **Project**: Factory Core
> **Date**: 2026-04-09
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 템플릿은 텍스트 이메일만 가능. 설문/인터뷰를 보내도 응답 수집 불가. 이메일을 읽었는지, 링크를 클릭했는지 추적 불가 |
| **Solution** | 템플릿에 JSON 폼 스키마 추가 → 이메일에 설문 링크 삽입 → 공개 웹 설문 페이지 → 추적 픽셀/URL로 열람·클릭·응답 전 과정 추적 |
| **Function/UX Effect** | Admin에서 템플릿 작성(이메일+설문) → 발송 → 수신자 열람/클릭/응답 시점 실시간 확인 → 실패 건 재발송 |
| **Core Value** | 현장 인터뷰 데이터를 디지털로 수집·분석. "커피 들고 가기" 대신 데이터 기반 타겟 영업 가능 |

---

## 1. 배경

- 현장 인터뷰 질문지(10문항) 준비 완료 → 디지털 설문으로 확장
- 현재 /admin/templates는 텍스트 이메일만 지원
- 이메일 발송 후 읽음/클릭/응답 여부 확인 불가
- 문의 3유형(PoC/지원사업/일반)별 후속 설문 필요

---

## 2. 범위

### 2.1 In Scope

- [ ] DB: `survey_responses` 테이블 + `message_templates.form_schema` JSONB 컬럼
- [ ] DB: `email_tracking` 테이블 (열람/클릭 이벤트)
- [ ] API: 추적 픽셀 (`/api/track/open`)
- [ ] API: 추적 리다이렉트 (`/api/track/click`)
- [ ] API: 설문 제출 (`/api/survey/submit`)
- [ ] Public: `/survey/[id]` 설문 페이지 (로그인 불필요, 토큰 인증)
- [ ] Admin: 템플릿에 폼 스키마 에디터 추가
- [ ] Admin: 발송 이력에 열람/클릭/응답 상태 표시
- [ ] Admin: 설문 응답 통계 페이지
- [ ] 템플릿 3유형: 현장 인터뷰 / 문의 유형별 / 일반 마케팅
- [ ] 이메일 발송 시 추적 픽셀 + 설문 링크 자동 삽입

### 2.2 Out of Scope

- 설문 조건분기 (v2에서)
- 설문 결과 PDF 내보내기
- 설문 응답 알림 (카카오/슬랙)

---

## 3. 데이터 모델

### 3.1 message_templates 확장

```sql
ALTER TABLE message_templates
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'general'
  CHECK (template_type IN ('interview', 'inquiry', 'general')),
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '{"questions":[]}'::jsonb;
```

### 3.2 form_schema JSON 구조

```json
{
  "questions": [
    { "id": "q1", "type": "radio", "label": "설비 점검 방법은?",
      "options": ["수기", "엑셀", "전용SW", "없음"], "required": true },
    { "id": "q2", "type": "scale", "label": "스마트공장 관심도 (1~5)",
      "min": 1, "max": 5, "required": true },
    { "id": "q3", "type": "checkbox", "label": "관심 분야 (복수선택)",
      "options": ["설비 모니터링", "품질 관리", "에너지 관리", "안전 관리"] },
    { "id": "q4", "type": "text", "label": "가장 큰 고충은?", "required": false },
    { "id": "q5", "type": "textarea", "label": "추가 의견" }
  ]
}
```

지원 타입: `radio`, `checkbox`, `text`, `textarea`, `scale`, `select`

### 3.3 신규 테이블: email_tracking

```sql
CREATE TABLE email_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  history_id UUID REFERENCES send_history(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  event_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);
```

### 3.4 신규 테이블: survey_responses

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
```

---

## 4. 추적 시스템

### 4.1 이메일 열람 추적 (Tracking Pixel)

```
이메일 HTML 하단에 삽입:
<img src="https://joy.it.kr/api/track/open?hid={history_id}&t={token}" width="1" height="1" />

GET /api/track/open?hid=xxx&t=xxx
  → email_tracking INSERT (event_type='open')
  → 1x1 투명 GIF 반환
```

### 4.2 설문 링크 클릭 추적

```
이메일 본문의 설문 링크:
https://joy.it.kr/api/track/click?hid={history_id}&t={token}&to=/survey/{template_id}?token={token}

GET /api/track/click?hid=xxx&t=xxx&to=xxx
  → email_tracking INSERT (event_type='click')
  → 302 Redirect → /survey/{template_id}?token={token}
```

### 4.3 발송 이력 상태 표시

```
📨 발송 (sent_at)
  → 👁 열람 (open_at) — 추적 픽셀 최초 로드
  → 🔗 클릭 (click_at) — 설문 링크 클릭
  → ✅ 응답 (responded_at) — 설문 제출 완료
```

---

## 5. 페이지 구조

### 5.1 Public

```
/survey/[templateId]?token=xxx
  → 토큰 검증 (send_history에서 매칭)
  → form_schema 기반 동적 폼 렌더링
  → 제출 → survey_responses 저장
  → 감사 메시지
```

### 5.2 Admin 확장

```
/admin/templates (기존 + 확장)
  ├── 템플릿 유형 선택 (인터뷰/문의/일반)
  ├── 이메일 본문 에디터 (기존)
  └── 폼 스키마 에디터 (신규)
      ├── 질문 추가/삭제/순서변경
      ├── 질문 타입 선택 (radio/checkbox/text/scale/select)
      ├── 선택지 편집
      └── 필수 여부

/admin/history (기존 + 확장)
  └── 각 이력에 열람/클릭/응답 아이콘 + 시간

/admin/surveys (신규)
  ├── 응답 목록 (템플릿별 필터)
  ├── 응답 상세 보기
  └── 통계 (질문별 차트/비율)
```

---

## 6. 템플릿 3유형

### 6.1 현장 인터뷰 (interview)

현장인터뷰_질문지.md 기반 10문항:

| Q | 타입 | 질문 |
|---|------|------|
| 1 | text | 아침 출근 후 제일 먼저 하는 일 |
| 2 | text | 요즘 공장 운영 최대 고충 |
| 3 | text | 반복 업무 중 없어졌으면 하는 것 |
| 4 | radio | 설비 점검 방법 (수기/엑셀/전용SW/없음) |
| 5 | textarea | 최근 설비 고장 경험 |
| 6 | text | 구인 어려운 직군 |
| 7 | radio | ERP/MES 사용 여부 (사용 중/미사용) |
| 8 | scale | 스마트공장 관심도 (1~5) |
| 9 | radio | 월 10만원 서비스 의향 (사용/고민/거부) |
| 10 | scale | 데모 반응 (1~5) |

### 6.2 문의 유형별 (inquiry)

PoC/지원사업/일반 각각 다른 후속 질문셋

### 6.3 일반 마케팅 (general)

솔루션 소개 + 관심도 3~5문항

---

## 7. 개발 순서

### Phase A: DB + 추적 API (1시간)
```
1. [ ] migration: email_tracking 테이블
2. [ ] migration: survey_responses 테이블
3. [ ] migration: message_templates에 template_type + form_schema 컬럼
4. [ ] API: /api/track/open (추적 픽셀)
5. [ ] API: /api/track/click (리다이렉트 추적)
```

### Phase B: 설문 페이지 (1시간)
```
6. [ ] /survey/[id]/page.tsx — 동적 폼 렌더러
7. [ ] 폼 타입별 컴포넌트 (radio/checkbox/text/textarea/scale/select)
8. [ ] API: /api/survey/submit (응답 저장)
9. [ ] 완료 감사 페이지
```

### Phase C: 이메일 발송 연동 (30분)
```
10. [ ] send/route.ts — 이메일 HTML에 추적 픽셀 삽입
11. [ ] send/route.ts — 설문 링크 자동 삽입 (form_schema 있을 때)
12. [ ] 토큰 생성 (history_id 기반 UUID)
```

### Phase D: Admin UI (1시간)
```
13. [ ] /admin/templates — 템플릿 유형 선택 UI
14. [ ] /admin/templates — 폼 스키마 에디터 (질문 추가/삭제)
15. [ ] /admin/history — 열람/클릭/응답 상태 아이콘
16. [ ] /admin/surveys — 응답 목록 + 통계
```

### Phase E: 기본 템플릿 시드 (30분)
```
17. [ ] 현장 인터뷰 템플릿 (10문항) 시드
18. [ ] 일반 마케팅 템플릿 시드
19. [ ] 빌드 + 테스트
```

---

## 8. 성공 기준

| 지표 | 목표 |
|------|------|
| 설문 페이지 동작 | /survey/[id] 에서 폼 제출 → DB 저장 |
| 열람 추적 | 추적 픽셀 → email_tracking 기록 |
| 클릭 추적 | 설문 링크 → 리다이렉트 + 기록 |
| Admin 통계 | 발송 이력에 열람/클릭/응답 표시 |
| 3유형 템플릿 | 인터뷰/문의/일반 각각 동작 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-09 | Initial draft | JOYTEC |
