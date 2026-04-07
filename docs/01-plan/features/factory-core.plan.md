# Factory Core (팩토리코어) — Plan Document

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | Factory Core — 스마트공장 공급기업 관리 + 설문/제안 발송 플랫폼 |
| **시작일** | 2026-04-08 |
| **목표일** | Phase 1~2: 2026-04-25 / Phase 3: 2026-05-05 / Phase 4: 2026-05 이후 |

### Value Delivered

| 관점 | 내용 |
|------|------|
| **Problem** | 스마트공장 공급기업 2,277개사에 설문/제안을 보내려면 수작업으로 연락처 찾고 개별 연락해야 함. 업종·규모별 맞춤 메시지 불가. Factory Guardian Agent 솔루션 홍보 채널 없음. |
| **Solution** | 공공데이터 API 연동 기업 DB + 업종/규모 태그 관리 + 카카오 비즈메시지(알림톡) 자동 발송 + 솔루션 홈페이지를 하나의 플랫폼으로 통합 |
| **Function UX Effect** | Admin에서 지역·업종 필터 → 기업 선택 → 템플릿 자동 매칭 → 카카오 알림톡 일괄 발송. 외부 방문자는 joy.it.kr에서 Factory Guardian Agent 솔루션 확인 + PoC 문의 |
| **Core Value** | 중소제조기업 대상 설문·제안·영업 파이프라인의 디지털 자동화. 데이터 기반 타겟 마케팅으로 현장 인터뷰/설문 효율 극대화 |

---

## 1. 배경 및 목적

### 1.1 배경

- 중소제조기업 163,273개사 중 AI 도입률 0.1%, 스마트공장 도입률 19.5%
- 공급기업 2,277개사 중 AI 키워드 기업 단 3개 → 블루오션
- Factory Guardian Agent 솔루션 검증을 위해 타겟 기업 대상 설문/제안 발송 필요
- 카카오 비즈메시지 신청을 위해 사업자등록증 기반 홈페이지 선행 필요

### 1.2 목적

1. **Admin 플랫폼**: 공급기업 DB 관리 + 업종/규모 태그 + 카카오 알림톡 발송
2. **Public 홈페이지**: Factory Guardian Agent 솔루션 소개 + PoC 문의 (joy.it.kr)
3. **데이터 기반 영업**: 지역·업종별 필터링 → 맞춤 메시지 → 응답 추적

---

## 2. 범위

### 2.1 In Scope

| Phase | 내용 | 목표일 |
|-------|------|--------|
| **Phase 1** | 프로젝트 세팅 + Public 홈페이지 (카카오 비즈 신청용) | 4/14 (1주) |
| **Phase 2** | Admin 기본 (기업 DB + 태그 + 필터 + CSV) | 4/21 (1주) |
| **Phase 3** | 카카오 비즈메시지 연동 + 템플릿 + 발송 | 5/05 (2주) |
| **Phase 4** | Public 홈페이지 고도화 (솔루션 소개 완성) | 5월~ (계속) |

### 2.2 Out of Scope (추후)

- Factory Guardian Agent 솔루션 자체 개발 (AI 이상감지, 센서 연동 등)
- 업종 태그 자동 분류 (현재는 수동)
- 결제/구독 시스템
- 다국어 지원

---

## 3. 기술 스택

| 영역 | 기술 | 사유 |
|------|------|------|
| **Framework** | Next.js 16 (App Router) | 기존 saas-dashboard 경험 활용, SSR+SSG |
| **Language** | TypeScript | 타입 안전성 |
| **Styling** | Tailwind CSS 4 | 기존 프로젝트 동일 |
| **DB** | Supabase (PostgreSQL) | Free → Pro($25/월) 전환 용이 |
| **Auth** | Supabase Auth (Admin만) | 운영자 1인 전용 |
| **API** | 공공데이터포털 REST API | 스마트공장 공급기업 데이터 |
| **Messaging** | 카카오 비즈메시지 API (알림톡) | 건당 8~15원, 수신동의 불필요 |
| **Hosting** | Vercel | joy.it.kr 커스텀 도메인 |
| **VCS** | GitHub | 형상관리 |

---

## 4. Phase별 상세

### Phase 1: 프로젝트 세팅 + Public 홈페이지 (4/8~4/14)

**목적**: 카카오 비즈니스 채널 신청을 위한 사업자 홈페이지 구축

```
1-1. GitHub repo 생성 + Next.js 프로젝트 초기화
1-2. Supabase 프로젝트 생성 + 테이블 설계
1-3. Public 홈페이지 (랜딩 페이지)
     - Factory Core 브랜드 소개
     - Factory Guardian Agent 솔루션 개요
     - 문의 폼 (Supabase에 저장)
     - 회사 정보 (조이텍, 사업자번호)
1-4. Vercel 배포 + joy.it.kr 도메인 연결
1-5. 카카오 비즈니스 채널 신청
```

**산출물**: joy.it.kr 라이브 + 카카오 비즈 신청 완료

### Phase 2: Admin 기본 (4/15~4/21)

**목적**: 기업 DB 관리 + 업종/규모 태그 + 필터링

```
2-1. Admin 라우트 (/admin) + 인증 (운영자만)
2-2. Supabase에 기업 데이터 import (2,277개사)
2-3. 기업 목록 화면 (기존 index.html 기능 이관)
     - 시도/시군구 연동 필터
     - 텍스트 검색
     - 체크박스 선택
     - 컬럼 정렬
2-4. 업종/규모 태그 관리
     - 태그 CRUD
     - 기업에 태그 부여 (개별 + CSV 일괄)
2-5. CSV 내보내기
2-6. 기업 상세 화면 (연락 이력, 태그, 메모)
```

**산출물**: /admin 에서 2,277개사 관리 가능

### Phase 3: 카카오 비즈메시지 연동 (4/22~5/05)

**목적**: 업종별/규모별 템플릿 매칭 → 알림톡 자동 발송

```
3-1. 카카오 비즈메시지 API 연동
     - 알림톡 발송 API
     - 발송 결과 콜백 수신
3-2. 메시지 템플릿 관리
     - 템플릿 CRUD
     - 업종별/규모별 조건 매칭 규칙
     - 변수 치환: {기업명}, {담당자명}, {지역}, {업종} 등
     - 카카오 템플릿 검수 승인 관리
3-3. 발송 기능
     - 선택 기업 → 조건별 템플릿 자동 매칭 → 미리보기
     - 일괄 발송 (속도 제한 적용)
     - 발송 이력 저장 (Supabase)
3-4. 발송 대시보드
     - 발송 건수, 성공/실패, 응답률
     - 기업별 발송 이력
```

**산출물**: Admin에서 선택 → 템플릿 매칭 → 알림톡 발송 → 이력 추적

### Phase 4: Public 홈페이지 고도화 (5월~)

**목적**: Factory Guardian Agent 솔루션이 빛나는 홈페이지

```
4-1. 솔루션 상세 페이지
     - 멀티모달 AI (시각/청각/촉각) 설명
     - 키오스크 데모 영상/스크린샷
     - 기대 효과 (실측 데이터 기반, 파일럿 후)
4-2. PoC 신청 페이지
4-3. 고객 사례 (파일럿 결과)
4-4. 블로그/뉴스
```

**산출물**: joy.it.kr 완성형 홈페이지 → 전시회/영업 활용

---

## 5. 데이터 모델 (Supabase)

```
companies (기업)
├── id (uuid, PK)
├── name (기업명)
├── ceo (대표자명)
├── contact_person (담당자)
├── phone (연락처)
├── address (주소)
├── sido (시도)
├── sigungu (시군구)
├── source_id (부여번호)
├── industry_tag (업종 태그, nullable)
├── size_tag (규모 태그, nullable)
├── memo (메모)
├── email (이메일, nullable)
├── website (홈페이지, nullable)
├── created_at
└── updated_at

tags (태그 마스터)
├── id (uuid, PK)
├── type (industry | size | custom)
├── name (태그명)
└── color (표시 색상)

company_tags (기업-태그 연결)
├── company_id (FK)
├── tag_id (FK)
└── created_at

message_templates (메시지 템플릿)
├── id (uuid, PK)
├── name (템플릿명)
├── type (alimtalk | friendtalk)
├── kakao_template_code (카카오 승인 코드)
├── content (본문, 변수 포함)
├── target_industry (대상 업종, nullable)
├── target_size (대상 규모, nullable)
├── status (draft | pending | approved | rejected)
└── created_at

send_history (발송 이력)
├── id (uuid, PK)
├── company_id (FK)
├── template_id (FK)
├── sent_at
├── status (sent | delivered | failed | read)
├── result_code
└── result_message

inquiries (문의, Public)
├── id (uuid, PK)
├── company_name
├── contact_name
├── phone
├── email
├── message
├── type (poc | general | survey)
└── created_at
```

---

## 6. 페이지 구조

```
/ (Public)
├── / ─────────────── 랜딩 페이지 (솔루션 소개)
├── /solution ──────── Factory Guardian Agent 상세
├── /poc ───────────── PoC 신청
├── /contact ───────── 문의
├── /privacy ───────── 개인정보처리방침
│
/admin (Admin, 인증 필요)
├── /admin ─────────── 대시보드 (발송 현황, 기업 통계)
├── /admin/companies ─ 기업 목록 + 필터 + 선택
├── /admin/companies/[id] ─ 기업 상세 (태그, 이력, 메모)
├── /admin/tags ────── 태그 관리
├── /admin/templates ─ 메시지 템플릿 관리
├── /admin/send ────── 발송 (선택→매칭→미리보기→발송)
├── /admin/history ─── 발송 이력
└── /admin/inquiries ─ 문의 접수 목록
```

---

## 7. 외부 연동

| 서비스 | 용도 | 키/설정 필요 |
|--------|------|-------------|
| **공공데이터포털 API** | 기업 데이터 동기화 | API Key (보유: c77d3b...5c5) |
| **Supabase** | DB + Auth + Storage | Project URL + Anon Key |
| **카카오 비즈메시지** | 알림톡 발송 | 비즈 채널 + API Key (Phase 1 후 신청) |
| **Vercel** | 배포 | GitHub 연동 |
| **joy.it.kr** | 커스텀 도메인 | DNS 설정 |

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 카카오 비즈 채널 승인 지연 | Phase 3 지연 | Phase 1에서 홈페이지 먼저 완성하여 승인 조건 충족 |
| 알림톡 템플릿 검수 반려 | 발송 불가 | 정보성 메시지로 작성, 광고성 배제, 사전 검수 가이드 준수 |
| Supabase Free 플랜 7일 일시중지 | 서비스 중단 | 주기적 접근 or Pro 전환 ($25/월) |
| 설문 응답률 저조 | 데이터 부족 | 응답 혜택 (무료 컨설팅 제공) + 전화 병행 |
| 업종 태그 수동 작업 부담 | 2,277개 전체 불가 | 서울+경기 우선 태그 (약 1,149개), 나머지 추후 |

---

## 9. 마일스톤 요약

```
4/08 ─── 프로젝트 시작, GitHub repo 생성
4/10 ─── Next.js + Supabase 초기 세팅 완료
4/14 ─── Public 랜딩 페이지 배포 (joy.it.kr)
         카카오 비즈니스 채널 신청
4/17 ─── AI TECH 컨퍼런스 조기등록 마감
4/21 ─── Admin 기업 DB + 태그 + 필터 완성
4/24 ─── STK 부스 출품 여부 최종 결정
5/05 ─── 카카오 알림톡 발송 기능 완성
         AI EXPO 참관 등록 마감
5/06~08 ─ AI EXPO KOREA 참관 (경쟁사 정찰)
5월~ ─── Public 홈페이지 고도화 + 첫 발송
```

---

## 10. 성공 기준

| 지표 | 목표 |
|------|------|
| Phase 1 완료 | joy.it.kr 라이브 + 카카오 비즈 신청 |
| Phase 2 완료 | Admin에서 2,277개사 필터·검색·태그 가능 |
| Phase 3 완료 | 알림톡 테스트 발송 성공 |
| 첫 설문 발송 | 100개사 이상 대상 알림톡 발송 |
| 설문 응답률 | 5% 이상 (5건+) |
