# Factory Guardian v2 — 전체 솔루션 Plan

> **Summary**: 중소 제조기업을 위한 Agentic AI 스마트공장 통합 플랫폼 (MES+ERP+AI)
>
> **Project**: Factory Core
> **Date**: 2026-04-10
> **Status**: Draft
> **Level**: Level 0~4 전 단계 커버

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 중소 제조기업 163,273개사 중 AI 도입률 0.1%. 기존 MES/ERP는 7.5억 초기비용 + 전문인력 필수. 현장과 시스템이 분리되어 실시간 대응 불가 |
| **Solution** | 3D 디지털 트윈 + CoreBot Family(Eye/Ear/Touch/Core) AI Agent + MES/ERP 핵심 기능을 $1 스티커와 웨어러블로 통합한 클라우드 SaaS |
| **Function/UX Effect** | 현장 촬영 → 3D 공간 자동 생성 → 스티커 붙이면 설비 등록 → AI가 24시간 감시·분석·보고 → 대화 한 마디로 공장 제어 |
| **Core Value** | MES 없이, ERP 없이, 월 10만원부터 시작. Level 0(수기)에서 Level 4(AI CPS)까지 점진적 확장. "AI 공장장이 다 해줍니다" |

---

## 1. 전체 기능 목록 (17가지)

### Tier 1: 핵심 인프라 (Phase 1~2)

| # | 기능 | 세부 내용 |
|---|------|----------|
| **1** | **3D 디지털 트윈 + 통합 모니터링** | • 현장 사진/영상 → 3D 공간 자동 생성 (Gaussian Splatting / NeRF / Photogrammetry)<br>• 3D 공간 위에 Touch/Ear/Eye 데이터 오버레이<br>• 설비 클릭 → 상세 데이터 팝업 (온도/진동/오디오/이미지)<br>• 실시간 / 시간별 / 일별 / 주별 / 월별 기간 전환<br>• 산업별 3D 환경 프리셋 (공장/전자/금형/사무실)<br>• 이상 설비 빨간색 하이라이트 + 알림 표시<br>• 다중 카메라 앵글 전환 |
| **2** | **설비 등록** | • IoT 스티커(Wiliot Gen3) 부착 → BLE 스캔 → 설비 자동 인식<br>• 3D 맵에 위치 드래그 배치<br>• 설비 정보 입력 (이름, 제조사, 모델, 연식, 사양)<br>• 센서별 임계치 설정 (온도 max, 진동 max 등)<br>• QR코드/바코드 라벨 자동 생성<br>• 설비 사진 촬영 + 매뉴얼 첨부 |
| **7** | **다중 공장/라인 관리** | • 공장 여러 개 등록 (A공장, B공장, 협력사 공장)<br>• 공장 내 라인 구분 (1라인, 2라인, 조립라인)<br>• 공장/라인 전환 UI (드롭다운 + 3D 전환)<br>• 공장별 3D 디지털 트윈 독립 관리<br>• 전체 공장 통합 대시보드 (경영진 뷰) |
| **8** | **사용자 권한** | • **관리자**: 전체 접근 + 설정 + 사용자 관리<br>• **공장장**: 담당 공장 모니터링 + 보고서 + 정비 승인<br>• **작업자**: 현장 키오스크/모바일 + 알림 수신 + 정비 요청<br>• **뷰어**: 읽기 전용 (경영진/투자자)<br>• 역할별 메뉴/데이터 접근 제한<br>• 초대 링크 기반 가입 |

### Tier 2: AI Agent (Phase 3~4)

| # | 기능 | 세부 내용 |
|---|------|----------|
| **3** | **실시간 데이터 수집** | • **Touch**: Wiliot Gen3 $1 스티커 → BLE → Edge Gateway(RPi+Greengrass) → AWS IoT Core → 클라우드<br>• **Ear**: MEMS 마이크 / 웨어러블 워치 마이크 → FFT 주파수 분석 → 이상음 감지 (베어링/모터/벨트/충격)<br>• **Eye**: USB 카메라 / 스마트글래스(Vuzix/RealWear) / 모바일 후면카메라 → Claude Vision 분석 (균열/누유/변색/마모/안전)<br>• 모든 데이터 시계열 DB 저장 (Supabase → TimescaleDB 확장 대비)<br>• 실시간 스트리밍 + 배치 분석 이중 경로<br>• Edge: BLE 스캔/필터링/버퍼링/기본 임계치 — Cloud: AI 분석 전부 |
| **4** | **Core AI 통제** | • Claude API 대화형 (텍스트 + 리턴제로 STT 음성 입력)<br>• Touch+Ear+Eye 멀티모달 데이터 통합 RAG 컨텍스트<br>• 이상 감지 종합 판단 + 원인 추정 + 조치 권고<br>• 예측 유지보수 (LSTM/Prophet → RUL 잔여수명 추정)<br>• 자동 보고서 생성 (일일/주간/월간 — 마크다운+PDF)<br>• 키오스크(PWA) / 모바일 / 웨어러블(워치/글래스) 멀티 디바이스<br>• 음성 응답(TTS) 추후 추가 (네이버 클로바 Voice) |
| **5** | **에이전트 토글** | • Core/Eye/Ear/Touch 개별 활성화/비활성화<br>• CoreBot Family 캐릭터 영상 카드 UI<br>• Core만 사용 가능 (DB 데이터 직접 입력 시 — Level 0 고객)<br>• 과금 모델 연동 (Basic: Touch+Core / Standard: +Ear / Premium: +Eye)<br>• 비활성 Agent는 UI에서 완전히 숨김 + 리소스 해제 |

### Tier 3: MES 기능 — ERPNext API 연동 (Phase 5)

> ★ 직접 개발하지 않음 — ERPNext 오픈소스(MIT, 무료) REST API로 연동
> ★ ERPNext가 MES/ERP 기능 담당, Factory Guardian은 AI+3D+연동 레이어

| # | 기능 | ERPNext 모듈 | Factory Guardian 역할 |
|---|------|-------------|---------------------|
| **11** | **생산 스케줄링** | Production Plan + Work Order API | 3D 대시보드에 일정 표시 + Core가 설비 상태 기반 일정 조정 제안 |
| **12** | **작업 지시** | Work Order + Job Card API | 키오스크/모바일 전달 UI + Core 자연어 작업 보고 |
| **13** | **생산/제품 추적** | Stock Entry + Serial No + Batch API | 3D 맵 위 LOT 위치 표시 + Core 역추적 대화 |
| **14** | **품질 관리** | Quality Inspection + QC Template API | Eye Agent 자동 검사 결과 → ERPNext 품질 검사 자동 등록 + Core SPC 분석 |

### Tier 4: ERP/운영 기능 — ERPNext API 연동 (Phase 5)

| # | 기능 | ERPNext 모듈 | Factory Guardian 역할 |
|---|------|-------------|---------------------|
| **6** | **설비 교체/발주** | Purchase Order + Supplier API | Core → ERPNext 자동 발주 제안 + 3D 대시보드 발주 현황 |
| **9** | **정비 이력 관리** | Asset Maintenance + Maintenance Visit API | AI 예측 정비 주기 + Touch/Ear/Eye → 자동 정비 요청 |
| **15** | **문서 관리** | File Manager + BOM API | Core RAG(pgvector) — 매뉴얼 기반 AI 답변 + 키오스크 현장 조회 |
| **16** | **자재/재고 관리** | Stock Ledger + BOM + Purchase Order API | 3D 맵 재고 오버레이 + Core 안전재고 알림 + 자동 발주 제안 |

### Tier 5: 보고/분석 (Phase 11)

| # | 기능 | 세부 내용 |
|---|------|----------|
| **10** | **보고서 자동 발송** | • 일일 설비 점검 보고서 (Core 자동 생성)<br>• 주간 생산 현황 리포트<br>• 월간 예측 유지보수 계획<br>• 이메일(AWS SES) + 카카오 알림톡(추후) 발송<br>• 스케줄 설정 (매일 오전 8시 등 — cron)<br>• PDF 다운로드 + 인쇄<br>• 커스텀 보고서 (Core에게 "지난달 불량률 보고서 만들어줘") |
| **17** | **성과 분석 (KPI)** | • OEE (설비종합효율) 자동 산출: 가동률 × 성능률 × 양품률<br>• 가동률/비가동 시간 분석 (정지 원인별)<br>• 에너지 사용량 모니터링 (전력/가스/수도)<br>• 생산성 추이 (일/주/월 — 라인 차트)<br>• Core가 KPI 기반 개선 포인트 제안<br>• 경영진용 대시보드 (다중 공장 통합 뷰) |

---

## 2. 스마트공장 레벨 매핑

| Level | 기능 범위 | Plan |
|-------|----------|------|
| **Level 0** (ICT 미적용) | Core만 — 수기 데이터 입력 → AI 분석 + 보고서 | Basic |
| **Level 1** (기초) | + Touch(바코드/QR/센서) + 실적 자동 집계 | Basic |
| **Level 2** (중간1) | + Ear + 설비 모니터링 + 자동 리포트 | Standard |
| **Level 3** (중간2) | + Eye + MES(생산/품질/작업) + 실시간 제어 | Premium |
| **Level 4** (고도) | + 3D 디지털 트윈 + 예측 유지보수 + 자율 최적화 | Enterprise |

---

## 3. 기술 스택

### Cloud (AWS SaaS)

| 영역 | 기술 | 사유 |
|------|------|------|
| 웹 프레임워크 | Next.js 16 (App Router) | 기존 Factory Core 확장 |
| DB (관계형) | Supabase PostgreSQL | 기존 인프라 |
| DB (시계열) | TimescaleDB (Supabase Extension) → Phase 5에서 AWS Timestream 검토 | 센서 대량 데이터 |
| DB (벡터) | pgvector (Supabase) | RAG 임베딩 (매뉴얼, 정비 이력) |
| 파일 저장 | Supabase Storage / S3 | 이미지, 오디오, 문서, 3D 모델 |
| IoT | AWS IoT Core + Greengrass | Edge Gateway 연결 |
| AI (LLM) | Claude API (Anthropic) | Core Agent 대화 + 보고서 |
| AI (Vision) | Claude Vision API | Eye Agent 이미지 분석 |
| AI (ML) | AWS SageMaker | 예측 유지보수, 이상 감지 모델 |
| STT | 리턴제로 RTZR | 한국어 음성 인식 1위 |
| TTS | 네이버 클로바 Voice (추후) | 한국어 음성 합성 |
| 이메일 | AWS SES (기존) | 알림 + 보고서 발송 |
| 3D | React Three Fiber + Gaussian Splatting | 디지털 트윈 |
| 실시간 | Supabase Realtime → AWS AppSync(확장 시) | WebSocket 실시간 업데이트 |
| **MES/ERP** | **ERPNext (오픈소스, MIT)** | **생산/품질/자재/문서/구매 — API 연동, 직접 개발 X** |
| MES/ERP 호스팅 | Docker 셀프호스팅 (AWS EC2 또는 Frappe Cloud) | $10~25/월 |
| MES/ERP 연동 | ERPNext REST API (JSON) + src/lib/erpnext-client.ts | 양방향 CRUD |
| 배포 | Vercel (웹) + AWS (IoT/ML) + Docker (ERPNext) | 하이브리드 |

### Edge (공장 현장)

| 장비 | 기술 | 역할 |
|------|------|------|
| Edge Gateway | RPi 5 + BLE dongle + AWS Greengrass | 센서 수집/필터/버퍼/기본 임계치 |
| IoT 센서 | Wiliot Gen3 ($1 스티커) | 온도/진동/습도/모션 |
| 카메라 | USB 카메라 / IP 카메라 | Eye 시각 입력 |
| 마이크 | MEMS 마이크 / 스마트워치 | Ear 청각 입력 |
| 키오스크 | 태블릿 (PWA) | 현장 터치 UI + Core 대화 |
| 웨어러블 | 스마트 글래스, 워치 | Eye/Ear 입력 + 알림 수신 |

---

## 4. 개발 로드맵

### Phase 1: 3D 디지털 트윈 + 설비 등록 (4주)

```
목표: 3D 공간에 설비를 배치하고 실시간 데이터를 오버레이하는 통합 모니터링 완성

1-1. 3D 엔진 선정 + PoC
     - Gaussian Splatting vs Photogrammetry vs 수동 모델링 비교
     - 산업 현장용 3D 예제 2종 구축 (공장/사무실)
     - R3F 기반 인터랙티브 뷰어

1-2. 설비 등록 시스템
     - 설비 CRUD + 3D 위치 좌표 저장
     - 드래그로 3D 맵에 배치
     - QR/바코드 생성

1-3. 통합 모니터링 UI
     - 3D 뷰 위에 센서 데이터 오버레이
     - 설비 클릭 → 상세 팝업
     - 기간 전환 (실시간/시간/일/주/월)
     - 이상 설비 하이라이트
```

### Phase 2: 인프라 (2주)

```
2-1. 다중 공장/라인 관리
2-2. 사용자 권한 (RBAC)
2-3. 에이전트 토글 (과금 모델)
```

### Phase 3: AI Agent 고도화 (4주)

```
3-1. Touch — 실제 센서 연동 (Wiliot Gen3 + Edge Gateway)
3-2. Ear — 현장 마이크 실시간 분석 + ML 이상음 모델
3-3. Eye — 카메라 실시간 스트리밍 + Claude Vision
3-4. Core — 멀티모달 RAG + 예측 유지보수 모델 (SageMaker)
```

### Phase 4: 정비/발주 + 보고서 (3주)

```
4-1. 정비 이력 관리 (워크플로우)
     - 이상 감지 → 정비 요청 자동 생성
     - 요청 → 배정 → 작업 → 완료 상태 관리
     - ERPNext Asset Maintenance API 연동
4-2. 설비 교체/발주 (협력업체 관리)
     - Core → ERPNext Purchase Order API 자동 발주 제안
     - 견적 → 비교 → 발주 → 입고 워크플로우
4-3. 보고서 자동 발송 (스케줄 cron)
```

### Phase 5: ERPNext 연동 — MES/ERP 통합 (3주)

```
★ 직접 개발 X → ERPNext 오픈소스(무료) API 연동으로 대체
★ 개발 시간: 기존 10주 → 3주로 단축

5-1. ERPNext 셀프호스팅 세팅 (Docker, $10~25/월)
     - Manufacturing, Stock, Quality, Buying 모듈 활성화
     - 한국어 설정 + 기본 데이터 세팅

5-2. ERPNext REST API 연동 레이어
     - Factory Guardian → ERPNext 양방향 API 통신
     - 인증: API Key 기반
     - src/lib/erpnext-client.ts (CRUD 래퍼)

5-3. 생산관리 연동 (ERPNext Manufacturing)
     - 생산 스케줄링: ERPNext Production Plan API ↔ 3D 대시보드 표시
     - 작업 지시: ERPNext Work Order API → 키오스크/모바일 전달
     - 생산 추적: ERPNext Stock Entry + Serial No API → LOT 이력
     - Core가 ERPNext 데이터 읽어서 자연어 보고

5-4. 품질관리 연동 (ERPNext Quality)
     - 품질 검사: ERPNext Quality Inspection API ↔ Eye Agent 자동 검사 결과
     - SPC/불량 분석: ERPNext 데이터 → 3D 대시보드 시각화
     - Core가 품질 추세 분석 + 개선 제안

5-5. 자재/재고 연동 (ERPNext Stock + Buying)
     - 재고 현황: ERPNext Stock Ledger API → 3D 맵 오버레이
     - BOM 관리: ERPNext BOM API → 제품별 자재 트리
     - 발주 연동: Core → ERPNext Purchase Order API
     - 안전재고 미달 → Core 자동 알림 + 발주 제안

5-6. 문서 관리 연동 (ERPNext File + BOM)
     - 작업표준서(SOP): ERPNext File Manager → Core RAG(pgvector)
     - 설비 매뉴얼: ERPNext → 키오스크 현장 조회
     - 도면: ERPNext File 첨부 → 뷰어
```

### Phase 6: 분석/보고 + 경영진 뷰 (2주)

```
6-1. KPI 대시보드
     - OEE (가동률×성능률×양품률): ERPNext + 센서 데이터 결합 자동 산출
     - 에너지 모니터링: Touch 센서 데이터 기반
     - 생산성 추이: ERPNext Production Analytics + 시계열 차트

6-2. 경영진 통합 뷰
     - 다중 공장 한눈에 (ERPNext Company 매핑)
     - Core에게 "이번 달 전체 공장 실적 보고서" 요청
```

### Phase 7: PoC + 런칭 (4주)

```
7-1. 1개 공장 실제 PoC (8주 무료)
7-2. 피드백 반영 + 안정화
7-3. SaaS 과금 시스템 연동
7-4. 런칭
```

---

## 5. 마일스톤 요약 (ERPNext 연동으로 단축)

```
2026.04 ─── v1 완료 (홈페이지 + CRM + 시뮬레이터 + 기본 Agent)
2026.05 ─── Phase 1: 3D 디지털 트윈 + 통합 모니터링 ★
2026.06 ─── Phase 2~3: 인프라 + AI Agent 고도화
        ─── STK 2026 (6/10~12 코엑스) 전시회 데모
2026.07 ─── Phase 4: 정비/발주 + 보고서
2026.08 ─── Phase 5: ERPNext 연동 (MES+ERP+품질+자재+문서 한 번에) ★★
2026.09 ─── Phase 6: KPI + 경영진 대시보드
2026.10 ─── Phase 7: PoC + 런칭

기존 대비 2개월 단축 (12월 → 10월)
Phase 5~7 (10주) → Phase 5 (3주) ERPNext 연동으로 7주 절감
```

---

## 6. 과금 모델

| Plan | 월 요금 | 기능 | Level |
|------|---------|------|:-----:|
| **Basic** | 10만원 | Touch + Core + 설비등록 + 정비관리 + 보고서 | 0~1 |
| **Standard** | 20만원 | + Ear + 생산스케줄링 + 작업지시 + 품질관리 | 2 |
| **Premium** | 30만원 | + Eye + 생산추적 + 자재관리 + 문서관리 | 3 |
| **Enterprise** | 별도 | + 3D 디지털 트윈 + 다중 공장 + KPI + 커스텀 | 4 |
| **PoC** | 무료 8주 | Basic 기능 (센서 5개 제공) | - |

---

## 7. 리스크

| 리스크 | 대응 |
|--------|------|
| 3D 디지털 트윈 기술 난이도 | Gaussian Splatting은 최신 기술 — PoC로 검증 후 결정 |
| 실제 센서 하드웨어 확보 | Wiliot Gen3 샘플 주문 필요 — 시뮬레이터로 먼저 개발 |
| ERPNext 한국어/현지화 | 커뮤니티 번역 + 필요 시 직접 보강 |
| ERPNext API 속도/안정성 | 캐싱 레이어 + 비동기 큐 — 실시간 데이터는 Supabase 우선 |
| ERPNext 버전 업그레이드 | API 래퍼(erpnext-client.ts)로 격리 — ERPNext 내부 변경에 영향 최소화 |
| 고객 IT 인프라 부재 | 올인원 패키지 (RPi + LTE 모뎀 + 태블릿 + ERPNext 포함) |
| Claude API 비용 | 캐싱 + 요약 컨텍스트로 토큰 절약 — 로컬 LLM(Llama) 검토 |

---

## 8. 성공 기준

| 지표 | 목표 |
|------|------|
| 3D 디지털 트윈 PoC | 실사 → 3D 변환 + 데이터 오버레이 동작 |
| STK 전시회 데모 | 3D + AI Agent 4종 라이브 시연 |
| PoC 1개 공장 | 8주 무료 체험 → 만족도 4점/5점 |
| 유료 전환 | PoC 고객 중 30% 이상 |
| 월 매출 | 런칭 후 3개월 내 100만원 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-10 | Initial v2 plan — 17 features, 9 phases | JOYTEC |
| 0.2 | 2026-04-10 | ERPNext 연동으로 MES/ERP 대체 — 9→7 phases, 2개월 단축 | JOYTEC |
