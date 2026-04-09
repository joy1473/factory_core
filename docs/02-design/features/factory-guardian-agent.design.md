# Factory Guardian Agent — Design Document

> **Plan 참조**: `docs/01-plan/features/factory-guardian-agent.plan.md`
> **Date**: 2026-04-09
> **Status**: Draft v2 — AWS Cloud SaaS 아키텍처 반영
> **Scope**: 센서 시뮬레이터 + 시계열 DB + 실시간 대시보드 + 임계치 알림

---

## 0. 아키텍처 방향 (v2 수정)

```
Gen3 IoT 스티커 → BLE → Edge Gateway (RPi + BLE dongle)
                              ↓
                   AWS IoT Core (Greengrass)
                              ↓
              ┌───────────────┼───────────────┐
              ↓               ↓               ↓
         Supabase DB    SageMaker (AI)   SES (알림)
              ↓
     Factory Core 웹 (Next.js on Vercel)
```

| 레이어 | 역할 | 기술 |
|--------|------|------|
| **센서** | 온도/진동/습도 측정 | Gen3 IoT Pixel ($1 BLE passive) |
| **Edge** | BLE 스캔/수집, 신호 필터링, buffering, 기본 threshold | RPi 5 + BLE dongle, AWS IoT Greengrass |
| **Cloud AI** | 추세 분석, 이상 감지, 예측 유지보수, 보고서 생성 | AWS SageMaker, Claude API |
| **SaaS 웹** | 대시보드, 키오스크, 관리자 화면 | Next.js (Vercel) + Supabase |
| **알림** | 이메일, 푸시, 카카오 | AWS SES (기존), FCM |

**확장 대비**: Wi-Fi/Cellular 직접 연결 active 센서 버전 추가 시 Edge Gateway 없이 AWS IoT Core 직접 연결 가능하도록 API 계층 분리

---

## 1. Phase 1 목표 (MVP)

실제 센서/Edge 없이 **시뮬레이터로 전체 파이프라인 검증**. 나중에 시뮬레이터를 실제 Edge Gateway로 교체만 하면 됨.

```
[Phase 1: 시뮬레이터]          [Phase 5: 실제 배포]
시뮬레이터 → API → DB          Edge Gateway → AWS IoT → API → DB
                ↓                                          ↓
          대시보드 + 알림                            대시보드 + 알림
```

---

## 1.5 센서 기술 선정: Wiliot Gen3 IoT Pixel

### 비교 분석

| 항목 | Wiliot Gen3 | BeFC | Evigence Sensors |
|------|-------------|------|-----------------|
| **전원** | Battery-free (RF harvesting, dual-band) | Battery-free (효소/생체) | Battery-free/초저전력 |
| **통신** | Passive BLE encrypted continuous | BLE | RFID/BLE |
| **센싱** | 온도, 습도, 모션, 빛, 위치 | 온도/신선도 | 식품 TTI 중심 |
| **범위** | 150ft+ (Gen3 dual-band) | 중간 | 짧음 |
| **단가** | ~$0.10 (대량) | 중~높음 | 중간 |
| **성숙도** | 높음 (mass production) | 중간 (연구 단계) | 중간 (niche) |
| **적합성** | 스마트팩토리 최적 | 식품 보조 | 식품 전용 |

### 선정 이유: Wiliot Gen3

1. **다기능 센싱** — 온도+진동+습도를 하나의 $0.10 스티커로 해결
2. **설치 극도 단순화** — 붙이기만 하면 됨, 배터리 교체 없음
3. **Gen3 개선점** — dual-band로 범위/안정성 대폭 향상, 단가 하락
4. **생태계** — Ambient IoT Alliance (Qualcomm/Intel) → BLE/5G 표준 호환
5. **Hybrid SaaS 적합** — Passive BLE이라 Thin Edge Gateway 필수 → 우리 아키텍처와 일치
6. **미래 확장** — Alliance 표준화 → Edge 더 가볍게, Pure SaaS 경험 강화

### 시뮬레이터에서 모사할 Gen3 특성

```typescript
// Phase 1 시뮬레이터에서 Gen3 특성 반영
const WILIOT_GEN3_PROFILE = {
  sensors: ["temperature", "humidity", "vibration", "motion", "light"],
  broadcast_interval_ms: 5000,  // continuous broadcast
  temperature_accuracy: 0.5,     // ±0.5°C
  range_meters: 45,              // ~150ft
  battery: "none",               // energy harvesting
};
```

---

## 2. DB 설계

### 2.1 devices (설비/센서 장치)

```sql
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- "CNC-1", "프레스", "사출기"
  device_type TEXT NOT NULL,             -- "cnc", "press", "injection", "server"
  location TEXT,                         -- "A동 1라인"
  status TEXT DEFAULT 'active',          -- active, maintenance, offline
  thresholds JSONB DEFAULT '{}'::jsonb,  -- {"temperature_max":70,"vibration_max":4.5}
  metadata JSONB DEFAULT '{}'::jsonb,    -- 추가 정보
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 sensor_readings (시계열 데이터)

```sql
CREATE TABLE sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id),
  sensor_type TEXT NOT NULL,             -- "temperature", "vibration", "humidity"
  value NUMERIC NOT NULL,                -- 측정값
  unit TEXT NOT NULL,                    -- "°C", "mm/s", "%"
  is_alert BOOLEAN DEFAULT false,        -- 임계치 초과 여부
  recorded_at TIMESTAMPTZ DEFAULT now(), -- 측정 시간
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 시계열 인덱스
CREATE INDEX idx_readings_device_time ON sensor_readings(device_id, recorded_at DESC);
CREATE INDEX idx_readings_alert ON sensor_readings(is_alert) WHERE is_alert = true;

-- 파티셔닝 (추후 데이터 증가 시)
-- CREATE INDEX idx_readings_time ON sensor_readings(recorded_at DESC);
```

### 2.3 alerts (알림 이력)

```sql
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id),
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL,                -- "warning", "critical"
  message TEXT NOT NULL,                 -- "CNC-1 온도 78°C (기준 70°C 초과)"
  status TEXT DEFAULT 'active',          -- "active", "acknowledged", "resolved"
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 RLS 정책

```sql
-- sensor_readings: 시뮬레이터(public)에서 INSERT, admin에서 SELECT
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert readings" ON sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read readings" ON sensor_readings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read readings" ON sensor_readings FOR SELECT USING (true);

-- devices: admin CRUD, public read
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Admin full devices" ON devices FOR ALL USING (auth.role() = 'authenticated');

-- alerts: 동일
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Admin full alerts" ON alerts FOR ALL USING (auth.role() = 'authenticated');
```

---

## 3. API 설계

### 3.1 센서 시뮬레이터 API

#### POST /api/simulator/start

```
Body: { device_id?, interval_ms?: 5000 }
Action:
  1. 지정 device 또는 전체 device에 대해 시뮬레이션 시작
  2. 서버 cron 또는 클라이언트 setInterval로 데이터 생성
  3. 각 device별 정상 범위 내 랜덤 + 가끔 이상치 삽입
Response: { status: "started", devices: [...] }
```

#### POST /api/simulator/generate

```
Body: { device_id, readings: [{ sensor_type, value, unit }] }
Action:
  1. sensor_readings INSERT
  2. 임계치 확인 → 초과 시 alerts INSERT + is_alert=true
Response: { inserted: 3, alerts: 1 }
```

#### POST /api/simulator/stop

```
Action: 시뮬레이션 중지
```

### 3.2 센서 데이터 조회 API

#### GET /api/devices

```
Response: 전체 device 목록 + 최신 reading 1건씩
```

#### GET /api/devices/[id]/readings

```
Query: ?sensor_type=temperature&from=2026-04-09&to=2026-04-10&limit=100
Response: [{ value, unit, recorded_at, is_alert }]
```

#### GET /api/alerts

```
Query: ?status=active&device_id=xxx
Response: [{ device_name, sensor_type, value, threshold, severity, message, created_at }]
```

#### POST /api/alerts/[id]/acknowledge

```
Action: status → acknowledged, acknowledged_at = now()
```

#### POST /api/alerts/[id]/resolve

```
Action: status → resolved, resolved_at = now()
```

---

## 4. 센서 시뮬레이터 설계

### 4.1 설비별 정상 범위

```typescript
const DEVICE_PROFILES = {
  cnc: {
    temperature: { base: 45, range: 10, unit: "°C", max: 70 },
    vibration:   { base: 2.0, range: 1.0, unit: "mm/s", max: 4.5 },
    humidity:    { base: 55, range: 10, unit: "%", max: 80 },
  },
  press: {
    temperature: { base: 50, range: 15, unit: "°C", max: 75 },
    vibration:   { base: 3.0, range: 1.5, unit: "mm/s", max: 5.0 },
  },
  injection: {
    temperature: { base: 180, range: 20, unit: "°C", max: 220 },
    vibration:   { base: 2.5, range: 1.0, unit: "mm/s", max: 4.5 },
  },
  server: {
    temperature: { base: 24, range: 3, unit: "°C", max: 32 },
    humidity:    { base: 45, range: 5, unit: "%", max: 60 },
  },
};
```

### 4.2 데이터 생성 패턴

```
정상: base + random(-range, +range) + sin(time) * drift
이상: 5% 확률로 max 근처 값 또는 급격한 스파이크
점진 악화: 시뮬 시작 후 시간 경과에 따라 base 서서히 증가 (고장 예측 시나리오)
```

### 4.3 시뮬레이터 클라이언트 (Admin 페이지)

```
/admin/simulator
  ┌─────────────────────────────────────────┐
  │ 시뮬레이터 제어                          │
  │                                         │
  │ [▶ 시작]  [■ 정지]  간격: [5초 ▼]      │
  │                                         │
  │ CNC-1    ● 온도 52°C  진동 2.3mm/s     │
  │ CNC-2    ● 온도 48°C  진동 1.8mm/s     │
  │ 프레스    ● 온도 55°C  진동 3.1mm/s     │
  │ 사출기    ⚠ 온도 215°C 진동 4.2mm/s    │ ← 이상
  │                                         │
  │ [이상 시나리오 주입] [초기화]            │
  └─────────────────────────────────────────┘
```

---

## 5. 실시간 대시보드 UI

### 5.1 모니터링 대시보드 (/admin/monitoring)

```
┌──────────────────────────────────────────────────────┐
│ 실시간 설비 모니터링                    [시뮬레이터 ▶]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  4   │ │  3   │ │  1   │ │  0   │               │
│  │ 설비 │ │ 정상 │ │ 경고 │ │ 위험 │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  설비별 상태 카드                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ CNC-1                          ● 정상   │        │
│  │ 온도 ████████████░░ 52°C / 70°C        │        │
│  │ 진동 ██████░░░░░░░░ 2.3 / 4.5 mm/s    │        │
│  │ ───────────── 최근 1시간 차트 ─────────│        │
│  │ 📈 [작은 라인 차트]                     │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  ┌─────────────────────────────────────────┐        │
│  │ 사출기                          ⚠ 경고  │        │
│  │ 온도 █████████████████ 215°C / 220°C   │ ← 빨강 │
│  │ 진동 ███████████████░ 4.2 / 4.5 mm/s  │ ← 노랑 │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  알림 목록 (최근)                                    │
│  ⚠ 사출기 온도 215°C 초과 (기준 220°C) — 2분 전    │
│  ⚠ 사출기 진동 4.2mm/s (기준 4.5mm/s 근접) — 5분전 │
│                                                      │
│  전체 차트 (시간대별)                                │
│  [온도 라인 차트 — 4대 설비 오버레이]                │
│  [진동 라인 차트 — 4대 설비 오버레이]                │
└──────────────────────────────────────────────────────┘
```

### 5.2 차트 라이브러리

```
옵션:
  1. Recharts — React 네이티브, 가벼움, SSR 호환
  2. Chart.js + react-chartjs-2 — 유연, 실시간 업데이트 쉬움
  3. Lightweight Charts (TradingView) — 시계열 특화

선택: Recharts
  - Next.js 호환 우수
  - 실시간 라인 차트 + 게이지 표시
  - 번들 크기 작음
```

### 5.3 실시간 업데이트 방식

```
옵션:
  1. Supabase Realtime (PostgreSQL LISTEN/NOTIFY)
  2. Polling (5초 간격 fetch)
  3. WebSocket 자체 구축

선택: Polling (5초) → 추후 Supabase Realtime 전환
  - MVP에서는 polling이 가장 단순
  - 시뮬레이터 interval과 동기화
  - Supabase Realtime은 Phase 2에서 전환
```

---

## 6. 알림 시스템

### 6.1 임계치 판정

```typescript
// severity 판정
function checkThreshold(value: number, max: number): "normal" | "warning" | "critical" {
  const ratio = value / max;
  if (ratio >= 1.0) return "critical";   // 100% 이상
  if (ratio >= 0.85) return "warning";   // 85% 이상
  return "normal";
}
```

### 6.2 알림 채널

| 심각도 | 화면 | 이메일 | 즉시 |
|--------|:----:|:------:|:----:|
| normal | - | - | - |
| warning | ⚠ 노랑 배너 | - | - |
| critical | 🔴 빨강 배너 + 사운드 | ✅ SES 발송 | ✅ 즉시 |

### 6.3 이메일 알림 내용

```
제목: [Factory Core] ⚠ CNC-1 온도 이상 감지 (78°C)

설비: CNC-1
센서: 온도
현재: 78°C
기준: 70°C
심각도: 경고 (Critical)
시간: 2026-04-09 15:30:22

조치 권고: 즉시 점검 필요. 냉각 시스템 확인.

대시보드에서 확인: https://joy.it.kr/admin/monitoring
```

---

## 7. 파일 구조

### 신규 파일

| File | Purpose |
|------|---------|
| `supabase/migrations/20260410000001_guardian_phase1.sql` | DB 마이그레이션 |
| `src/app/api/devices/route.ts` | 설비 목록 + 최신 읽기 |
| `src/app/api/devices/[id]/readings/route.ts` | 설비별 센서 데이터 조회 |
| `src/app/api/simulator/generate/route.ts` | 시뮬레이터 데이터 생성 |
| `src/app/api/alerts/route.ts` | 알림 목록 조회 |
| `src/app/api/alerts/[id]/route.ts` | 알림 확인/해결 |
| `src/app/admin/monitoring/page.tsx` | 실시간 모니터링 대시보드 |
| `src/app/admin/simulator/page.tsx` | 시뮬레이터 제어 페이지 |
| `src/components/monitoring/device-card.tsx` | 설비별 상태 카드 |
| `src/components/monitoring/sensor-chart.tsx` | 센서 라인 차트 |
| `src/components/monitoring/alert-banner.tsx` | 알림 배너 |
| `src/components/monitoring/gauge-bar.tsx` | 게이지 프로그래스 바 |
| `src/lib/simulator.ts` | 시뮬레이터 데이터 생성 로직 |
| `src/lib/threshold.ts` | 임계치 판정 + 알림 생성 |

### 수정 파일

| File | Changes |
|------|---------|
| `src/components/admin/sidebar.tsx` | "모니터링", "시뮬레이터" 메뉴 추가 |
| `package.json` | recharts 의존성 추가 |

---

## 8. 시드 데이터

### 초기 설비 4대

```sql
INSERT INTO devices (name, device_type, location, thresholds) VALUES
('CNC-1', 'cnc', 'A동 1라인', '{"temperature_max":70,"vibration_max":4.5,"humidity_max":80}'),
('CNC-2', 'cnc', 'A동 1라인', '{"temperature_max":70,"vibration_max":4.5,"humidity_max":80}'),
('프레스', 'press', 'A동 2라인', '{"temperature_max":75,"vibration_max":5.0}'),
('사출기', 'injection', 'B동 1라인', '{"temperature_max":220,"vibration_max":4.5}');
```

---

## 9. 구현 순서

```
Step 1: DB + 시드 (30분)
━━━━━━━━━━━━━━━━━━━━━━
1. [ ] migration SQL (devices, sensor_readings, alerts + RLS)
2. [ ] supabase db push
3. [ ] 설비 4대 시드

Step 2: 시뮬레이터 (1시간)
━━━━━━━━━━━━━━━━━━━━━━━━
4. [ ] lib/simulator.ts — 데이터 생성 로직
5. [ ] lib/threshold.ts — 임계치 판정
6. [ ] /api/simulator/generate — 데이터 생성 API
7. [ ] /admin/simulator/page.tsx — 제어 UI

Step 3: 데이터 조회 API (30분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. [ ] /api/devices — 설비 목록
9. [ ] /api/devices/[id]/readings — 센서 데이터
10. [ ] /api/alerts — 알림 목록 + 확인/해결

Step 4: 모니터링 대시보드 (2시간)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. [ ] recharts 설치
12. [ ] device-card.tsx — 설비 상태 카드
13. [ ] gauge-bar.tsx — 게이지 프로그래스
14. [ ] sensor-chart.tsx — 라인 차트
15. [ ] alert-banner.tsx — 알림 배너
16. [ ] /admin/monitoring/page.tsx — 대시보드 조합

Step 5: 알림 연동 (30분)
━━━━━━━━━━━━━━━━━━━━━━━
17. [ ] critical 알림 → SES 이메일 발송
18. [ ] sidebar 메뉴 추가
19. [ ] 빌드 + 테스트

Step 6: 3D 씬 연동 (선택, 1시간)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
20. [ ] /solution 3D 씬에서 실시간 센서 값 표시 (키오스크 연동)
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-09 | Phase 1 Touch MVP design | JOYTEC |
