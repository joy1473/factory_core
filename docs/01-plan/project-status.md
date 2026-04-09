# Factory Core 프로젝트 현황 (2026-04-09)

> 전체 개발 현황 + PDCA 문서화 상태 정리

---

## 1. Phase별 완료 현황

| Phase | 내용 | 상태 | Plan 문서 |
|-------|------|:----:|:---------:|
| **Phase 1** | 프로젝트 세팅 + Public 홈페이지 | ✅ | ✅ factory-core.plan.md |
| **Phase 2** | Admin 기업 DB + 태그 + 필터 | ✅ | ✅ factory-core.plan.md |
| **Phase 3** | AWS SES 이메일 발송 | ✅ | ✅ factory-core.plan.md |
| **Phase 4** | Public 홈페이지 고도화 | ✅ 대부분 | ✅ solution-page.plan.md |

---

## 2. 페이지별 현황

### Public 페이지 (11개)

| 경로 | 기능 | Plan | PDCA |
|------|------|:----:|:----:|
| `/` | 랜딩 (히어로 + CoreBot Family 4캐릭터) | ✅ | - |
| `/solution` | 3D 데모 (스크롤 5단계 + 업종 4프리셋) | ✅ | ✅ archived |
| `/why` | 왜 Factory Guardian인가 | ✅ | - |
| `/cases` | 도입 효과 (정부 통계 + 업종별 사례) | ❌ plan 없이 개발 | - |
| `/pricing` | 가격 및 도입 안내 | ✅ | - |
| `/bids` | 정부 지원사업 목록 + 문의 | ❌ plan 없이 개발 | - |
| `/bids/track` | 문의 추적 (트래킹 코드) | ❌ plan 없이 개발 | - |
| `/about` | 회사 소개 | ✅ | - |
| `/contact` | 문의 폼 (자동완성 + 기업 매칭) | ✅ | - |
| `/poc` | PoC 신청 | ✅ | - |
| `/privacy` | 개인정보처리방침 | ✅ | - |
| `/survey/[id]` | 설문 폼 (토큰 인증, 6가지 질문 타입) | ✅ | ✅ survey-form-system |

### Admin 페이지 (10개)

| 경로 | 기능 | Plan | PDCA |
|------|------|:----:|:----:|
| `/admin` | 대시보드 (통계 카드) | ✅ | - |
| `/admin/companies` | 기업 목록 (필터/검색/체크) | ✅ | - |
| `/admin/companies/[id]` | 기업 상세 (편집/태그/이력/AI추출) | ❌ plan 없이 개발 | - |
| `/admin/tags` | 태그 CRUD | ✅ | - |
| `/admin/templates` | 이메일 템플릿 (유형 선택 + 폼 에디터) | ✅ | ✅ survey-form-system |
| `/admin/send` | 발송 (선택→매칭→발송) | ✅ | - |
| `/admin/history` | 발송 이력 (통계 + 추적 아이콘 + 재발송) | ❌ plan 없이 확장 | - |
| `/admin/inquiries` | 문의 관리 (통합 + 상태 변경 + 슬라이드 패널) | ❌ plan 없이 개발 | - |
| `/admin/surveys` | 설문 응답 통계 | ✅ | ✅ survey-form-system |
| `/admin/content` | 콘텐츠 관리 (회사 정보 + 씬 프리셋) | ❌ plan 없이 개발 | - |

---

## 3. API 현황 (25개 엔드포인트)

### Plan에 포함된 API
| 엔드포인트 | 기능 |
|-----------|------|
| `/api/companies` | 기업 CRUD + 필터 |
| `/api/companies/[id]` | 기업 상세 |
| `/api/companies/search` | 자동완성 검색 |
| `/api/companies/regions` | 지역 목록 |
| `/api/companies/tags` | 기업-태그 연결 |
| `/api/tags`, `/api/tags/[id]` | 태그 CRUD |
| `/api/admin/templates`, `/api/admin/templates/[id]` | 템플릿 CRUD |
| `/api/admin/send` | 이메일 발송 (SES) |
| `/api/admin/history` | 발송 이력 |
| `/api/inquiries` | 문의 접수/조회 |
| `/api/survey/[templateId]` | 설문 스키마 조회 |
| `/api/survey/submit` | 설문 응답 저장 |
| `/api/track/open` | 이메일 열람 추적 |
| `/api/track/click` | 클릭 추적 + 리다이렉트 |
| `/api/admin/surveys` | 설문 응답 관리 |
| `/api/admin/resend` | 실패 건 재발송 |

### Plan 없이 개발된 API
| 엔드포인트 | 기능 |
|-----------|------|
| `/api/companies/[id]/enrich` | Serper 웹 검색 → 이메일 자동 추출 |
| `/api/companies/[id]/extract-tags` | AI 태그 자동 추출 |
| `/api/bids` | 지원사업 목록 |
| `/api/bids/inquire` | 지원사업 문의 |
| `/api/content/company-info` | 회사 정보 조회 |
| `/api/content/scene-presets` | 3D 씬 프리셋 조회 |
| `/api/admin/content` | 콘텐츠 관리 |
| `/api/admin/inquiry-update` | 문의 상태 변경 |
| `/api/admin/stats` | 대시보드 통계 |

---

## 4. DB 테이블 현황 (15개)

| 테이블 | 용도 | 레코드 수 |
|--------|------|:---------:|
| companies | 스마트공장 공급기업 | ~2,277 |
| tags | 업종/규모/커스텀 태그 | ~20 |
| company_tags | 기업-태그 연결 | - |
| message_templates | 이메일 템플릿 + 폼 스키마 | 2 (시드) |
| send_history | 발송 이력 + 추적 | - |
| email_tracking | 열람/클릭 이벤트 로그 | - |
| survey_responses | 설문 응답 | - |
| inquiries | 문의 (PoC/일반/설문) | - |
| bid_inquiries | 지원사업 문의 | - |
| bids | 지원사업 목록 | 5 (시드) |
| company_info | 회사 정보 (CMS) | 1 |
| tag_keywords | AI 태그 추출 키워드 사전 | ~16 |
| marketing_content | 마케팅 콘텐츠 | - |
| scene_presets | 3D 씬 설정 | 4 |
| organizations | 멀티테넌시 (미래) | 1 |

---

## 5. 디자인/테마 현황

| 항목 | 상태 |
|------|------|
| CoreBot Family 파스텔 컬러 | ✅ 민트/라벤더/피치/웜옐로우 |
| 캐릭터 MP4 영상 4개 | ✅ Core/Eye/Ear/Touch |
| 라이트/다크 모드 | ✅ 전구색 라이트 + 다크 |
| 모바일 최적화 | ✅ Bloom 꺼짐, DPR 1 |
| CSS Variables 시스템 | ✅ 전체 페이지 적용 |

---

## 6. 외부 연동 현황

| 서비스 | 상태 | 용도 |
|--------|:----:|------|
| Supabase (PostgreSQL) | ✅ | DB + Auth + RLS |
| AWS SES (서울) | ✅ | 이메일 발송 (프로덕션, 일일 50,000건) |
| Vercel | ✅ | 배포 (joy.it.kr) |
| Cloudflare DNS | ✅ | DNS + SPF + DKIM + DMARC |
| Serper.dev | ✅ | 기업 웹 검색 + 이메일 추출 |
| 공공데이터포털 API | ✅ | 기업 데이터 초기 import (완료) |
| 카카오 비즈메시지 | ⏸️ | SES로 대체, 추후 필요 시 |

---

## 7. PDCA 문서화 현황

| Feature | Plan | Design | Do | Check | Report | Archive |
|---------|:----:|:------:|:--:|:-----:|:------:|:-------:|
| 3d-industry-scenes | ✅ | ✅ | ✅ | ✅ 100% | ✅ | ✅ |
| survey-form-system | ✅ | ✅ | ✅ | - | - | - |
| factory-core (전체) | ✅ | ✅ | ✅ | - | - | - |
| solution-page | ✅ | - | ✅ | - | - | - |

---

## 8. Plan 없이 개발된 항목 (사후 기록)

### 8.1 기업 자동 보강 시스템
- **Serper 웹 검색** → 홈페이지 URL 발견 → HTML에서 이메일 추출 → DB 저장
- **AI 태그 자동 추출** → 기업명+메모+웹사이트 분석 → 업종/규모 태그 제안
- 파일: `/api/companies/[id]/enrich`, `/api/companies/[id]/extract-tags`

### 8.2 문의 통합 관리 시스템
- inquiries + bid_inquiries 두 테이블 통합 조회
- 상태별 필터 (전체/신규/진행중/완료)
- 상태 변경 시 기본 메시지 자동 삽입 (상태×유형 매트릭스)
- 기업 슬라이드 패널 (클릭 시 기업 상세)
- 파일: `/admin/inquiries/page.tsx`, `/api/admin/inquiry-update`

### 8.3 지원사업 관리
- 정부 스마트공장 지원사업 목록 (5개 시드)
- 지원사업별 문의 폼 (서비스 유형 선택: 제안서/발표/컨설팅/전체대행)
- 트래킹 코드 자동 생성 → 공개 조회
- 파일: `/bids/page.tsx`, `/bids/track/page.tsx`, `/api/bids/*`

### 8.4 콘텐츠 관리 (CMS)
- 회사 정보 편집 (하드코딩 → DB)
- 3D 씬 프리셋 관리 (DB + 하드코딩 fallback)
- 파일: `/admin/content/page.tsx`, `/api/content/*`

### 8.5 기업 상세 페이지 확장
- 모든 필드 편집 가능 (대표자, 주소, 이메일, 웹사이트, 메모)
- 지역 선택 콤보박스 (시도→시군구 연동)
- 발송 이력 표시
- AI 태그 추출 버튼
- Serper 자동 보강 버튼
- 파일: `/admin/companies/[id]/page.tsx`

### 8.6 발송 대시보드 확장
- 통계 카드 4개 (총 발송/성공/실패/대기)
- 성공률 프로그래스 바
- 실패 건 전체 재발송 버튼
- 개별 재발송 버튼
- 열람/클릭/응답 추적 아이콘
- 파일: `/admin/history/page.tsx`, `/api/admin/resend`

### 8.7 CoreBot Family 파스텔 리디자인
- 4캐릭터 MP4 영상 배치 (히어로, 솔루션, 구조도, 키오스크)
- 파스텔 컬러 시스템 (CSS Variables + ScenePreset colors)
- CoreBotWorker 3D 캐릭터 (구데타마 비율)
- 라이트/다크 모드 (전구색 라이트)
- 전체 사이트 text-white → var(--foreground) 전환
- PDCA 완료 후 archived

### 8.8 도입 효과 페이지 (/cases)
- 정부 통계 (실태조사 5,000개사 데이터)
- 도입 효과 6가지 수치
- 업종별 Before/After 사례 4개
- Pain Points → Factory Core 해결
- 모든 출처 링크 연결
- 파일: `/cases/page.tsx`

---

## 9. 백로그 (미개발)

| 항목 | 우선순위 | 선행 조건 |
|------|:--------:|----------|
| CoreBot Family 아코디언 상세 + 4컷 만화 | 중 | 솔루션 MVP 개발 후 |
| 사운드 효과 4종 + 토글 | 낮 | 솔루션 MVP 개발 후 |
| Eye/Ear 웨어러블 시연 데모 | 중 | 프로토타입 영상 |
| 블로그/뉴스 섹션 | 낮 | 콘텐츠 준비 |
| 다국어 지원 (한/영) | 낮 | - |
| 설문 조건분기 (v2) | 낮 | 설문 운영 경험 후 |
| 설문 결과 PDF 내보내기 | 낮 | - |
| 카카오 알림톡 연동 | ⏸️ | 필요 시 |
| 저사양/WebGL 미지원 fallback | 낮 | - |

---

## 10. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | 5 |
| UI | Tailwind CSS | 4 |
| 3D | React Three Fiber + drei + postprocessing | 9.5 / 10.7 / 3.0 |
| DB | Supabase (PostgreSQL) | - |
| State | Zustand | 5.0 |
| Email | AWS SES (@aws-sdk/client-ses) | 3.x |
| Icons | Lucide React | 1.7 |
| Hosting | Vercel | - |
| Domain | joy.it.kr (Cloudflare DNS) | - |
