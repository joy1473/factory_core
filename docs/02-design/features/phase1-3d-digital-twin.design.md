# Phase 1: 3D 디지털 트윈 + 통합 모니터링 — Design Document

> **Plan 참조**: `docs/01-plan/features/factory-guardian-v2.plan.md`
> **Date**: 2026-04-10
> **Status**: Draft
> **기간**: 4주

---

## 1. 개요

현장 스마트폰 촬영 → Luma AI(무료) → Gaussian Splat 3D → 웹 브라우저에서 실사 3D 공장 위에 Touch/Ear/Eye 센서 데이터 오버레이. 설비 클릭 → 상세 팝업. 실시간/기간별 전환.

---

## 2. 기술 스택

| 역할 | 도구 | 비용 |
|------|------|:----:|
| 사진→3D 변환 | **Luma AI** (클라우드, Gaussian Splatting) | 무료 |
| 3D 편집/최적화 | **SuperSplat** (MIT 오픈소스) | 무료 |
| 웹 3D 뷰어 | **@mkkellogg/gaussian-splats-3d** + React Three Fiber | 무료 |
| 센서 오버레이 | Three.js HTML Label (project→CSS좌표) | 무료 |
| 실시간 데이터 | Supabase Realtime | 무료 |
| 차트 | Recharts (기존) | 무료 |

---

## 3. 파이프라인

```
[촬영]                    [처리]                    [웹 표시]
스마트폰                  Luma AI                   Factory Guardian
영상/사진     ──업로드──▶  Gaussian Splatting  ──.splat 다운──▶  GaussianSplats3D
(현장 답사)               (클라우드, 무료)          + R3F 웹 뷰어
                                                    ↓
                          SuperSplat               설비 위치 등록
                          (편집/최적화)             + 센서 데이터 오버레이
                                                    + 클릭 → 상세 팝업
```

---

## 4. DB 설계

### 4.1 factory_scenes (3D 씬 관리)

```sql
CREATE TABLE factory_scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID,                         -- 다중 공장 시 참조
  name TEXT NOT NULL,                       -- "A동 1라인", "B동 메인홀"
  description TEXT,
  splat_url TEXT NOT NULL,                  -- Supabase Storage: .splat 파일 URL
  thumbnail_url TEXT,                       -- 미리보기 이미지
  camera_position JSONB DEFAULT '{"x":0,"y":5,"z":10}'::jsonb,
  camera_target JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 device_positions (설비 3D 위치)

```sql
-- 기존 devices 테이블에 3D 좌표 추가
ALTER TABLE devices ADD COLUMN IF NOT EXISTS
  scene_id UUID REFERENCES factory_scenes(id),
  position_3d JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
  rotation_3d JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
  label_offset JSONB DEFAULT '{"x":0,"y":2,"z":0}'::jsonb;
```

---

## 5. 컴포넌트 설계

### 5.1 전체 구조

```
/admin/monitoring (통합 대시보드 — 리디자인)
├── SceneViewer (Gaussian Splat 3D 뷰어)
│   ├── GaussianSplats3D (.splat 로드)
│   ├── DeviceMarker[] (설비 위치 마커 — 3D 공간)
│   │   ├── 마커 Mesh (구/아이콘)
│   │   ├── 상태 색상 (정상:민트 / 주의:노랑 / 위험:빨강)
│   │   └── HTML Label (설비명 + 최신 센서값)
│   ├── OrbitControls (마우스/터치 회전·줌)
│   └── 클릭 → DeviceDetailPanel
│
├── DeviceDetailPanel (설비 상세 팝업)
│   ├── Touch: 온도/진동/습도 게이지 + 차트
│   ├── Ear: 오디오 스펙트럼 + 이상음 상태
│   ├── Eye: 최근 캡처 이미지 + 분석 결과
│   └── 정비 이력 타임라인
│
├── TimeRangeSelector (기간 전환)
│   └── 실시간 | 1시간 | 24시간 | 7일 | 30일
│
├── AlertOverlay (알림 배너 — 3D 위 z-index)
│
├── SimulatorControls (접이식)
│
├── SettingsPanel (CoreBot Family 에이전트 토글)
│
└── CoreChatBubble (플로팅 채팅)
```

### 5.2 SceneViewer 컴포넌트

```typescript
// src/components/monitoring/scene-viewer.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";

interface SceneViewerProps {
  splatUrl: string;              // .splat 파일 URL
  devices: DeviceWithPosition[]; // 설비 목록 + 3D 좌표
  onDeviceClick: (deviceId: string) => void;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

// GaussianSplats3D를 R3F Canvas 안에서 사용
// 방법: useEffect에서 viewer.addSplatScene(url) → Three.js scene에 추가
```

### 5.3 DeviceMarker 컴포넌트

```typescript
// 3D 공간에 설비 마커 + HTML 라벨 표시
// Three.js project() → CSS 좌표 변환 방식

interface DeviceMarkerProps {
  device: DeviceWithPosition;
  latestReadings: SensorReading[];
  status: "normal" | "warning" | "critical";
  onClick: () => void;
}

// 마커: SphereGeometry (0.3) + emissive (상태 색상)
// 라벨: HTML div (설비명 + 온도 52°C + 진동 2.3mm/s)
// 클릭: Raycaster intersect → onDeviceClick
```

### 5.4 DeviceDetailPanel

```
┌────────────────────────────────────────┐
│ CNC-1                    ● 정상    [X] │
│ CNC · A동 1라인 · 두산 PUMA 2600      │
├────────────────────────────────────────┤
│                                        │
│ ┌─ Touch ─────────────────────────┐   │
│ │ 온도 ████████░░ 52°C / 70°C    │   │
│ │ 진동 ██████░░░░ 2.3 / 4.5mm/s  │   │
│ │ [최근 1시간 라인 차트]          │   │
│ └─────────────────────────────────┘   │
│                                        │
│ ┌─ Ear ──────────────────────────┐    │
│ │ 상태: 정상 | RMS: -30dB        │    │
│ │ [주파수 스펙트럼 바 차트]      │    │
│ └────────────────────────────────┘    │
│                                        │
│ ┌─ Eye ──────────────────────────┐    │
│ │ 최근 분석: 정상 (2분 전)       │    │
│ │ [캡처 이미지 썸네일]           │    │
│ └────────────────────────────────┘    │
│                                        │
│ ┌─ 정비 이력 ────────────────────┐    │
│ │ 04/08 예방정비 완료            │    │
│ │ 03/25 베어링 교체              │    │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

---

## 6. 설비 등록 Flow

```
1. Admin → "설비 등록" 모드 진입
2. 3D 뷰에서 빈 공간 클릭 → 좌표 획득
3. 설비 정보 폼 표시 (이름, 타입, 임계치)
4. IoT 스티커 ID 스캔 (QR/BLE) — 선택
5. 저장 → devices 테이블에 position_3d 포함
6. 3D 뷰에 마커 즉시 표시
```

---

## 7. 3D 씬 관리 Flow

```
1. 현장 답사 → 스마트폰으로 영상 촬영 (1~3분)
2. Luma AI 웹사이트에 업로드 → 무료 처리 (5~15분)
3. .splat 파일 다운로드
4. (선택) SuperSplat에서 편집/최적화
5. Admin → "3D 씬 업로드" → Supabase Storage
6. factory_scenes 테이블에 등록
7. /admin/monitoring에서 3D 뷰 표시
```

---

## 8. 산업별 예제 씬 (데모용 2종)

| 씬 | 용도 | 소스 |
|---|------|------|
| **제조 공장** | CNC/프레스/사출 설비 현장 | Luma AI 샘플 또는 직접 촬영 |
| **서버실/사무실** | IT 인프라 모니터링 | Luma AI 샘플 또는 직접 촬영 |

> 초기에는 Luma AI Gallery에서 공장/산업 씬 다운로드하여 데모용으로 사용.
> 실제 PoC 시 고객 현장을 직접 촬영.

---

## 9. 파일 구조

### 신규 파일

| File | Purpose |
|------|---------|
| `supabase/migrations/20260410000005_3d_scenes.sql` | factory_scenes + devices 3D 좌표 |
| `src/components/monitoring/scene-viewer.tsx` | Gaussian Splat 3D 뷰어 (R3F) |
| `src/components/monitoring/device-marker.tsx` | 3D 설비 마커 + HTML 라벨 |
| `src/components/monitoring/device-detail-panel.tsx` | 설비 상세 팝업 (Touch+Ear+Eye) |
| `src/components/monitoring/time-range-selector.tsx` | 기간 전환 (실시간/시간/일/주/월) |
| `src/components/monitoring/scene-upload.tsx` | 3D 씬 업로드 UI |
| `src/components/monitoring/device-register.tsx` | 설비 등록 (3D 클릭 배치) |
| `src/app/api/scenes/route.ts` | 3D 씬 CRUD API |
| `src/app/api/devices/[id]/position/route.ts` | 설비 3D 위치 업데이트 |

### 수정 파일

| File | Changes |
|------|---------|
| `src/app/admin/monitoring/page.tsx` | 텍스트 대시보드 → 3D 뷰어 기반으로 전면 리디자인 |
| `package.json` | @mkkellogg/gaussian-splats-3d 추가 |

---

## 10. 구현 순서 (4주)

### Week 1: 3D 뷰어 기초

```
1. [ ] npm install @mkkellogg/gaussian-splats-3d
2. [ ] DB migration (factory_scenes + devices 3D 좌표)
3. [ ] scene-viewer.tsx — .splat 파일 로드 + OrbitControls
4. [ ] 데모 .splat 파일 준비 (Luma AI Gallery에서 다운로드)
5. [ ] /admin/monitoring → 3D 뷰어 교체 (기존 텍스트 리스트 대체)
```

### Week 2: 설비 마커 + 오버레이

```
6. [ ] device-marker.tsx — 3D 마커 + HTML 라벨 (센서값 표시)
7. [ ] 마커 상태 색상 (정상/주의/위험)
8. [ ] Raycaster 클릭 → device-detail-panel.tsx 팝업
9. [ ] 팝업 안에 Touch 게이지 + Ear 스펙트럼 + Eye 캡처
10. [ ] 5초 폴링으로 센서 데이터 실시간 갱신
```

### Week 3: 설비 등록 + 씬 관리

```
11. [ ] scene-upload.tsx — .splat 파일 업로드 → Supabase Storage
12. [ ] device-register.tsx — 3D 클릭 → 좌표 획득 → 설비 정보 폼
13. [ ] /api/scenes + /api/devices/[id]/position API
14. [ ] 다중 씬 전환 UI (드롭다운)
```

### Week 4: 기간 전환 + 통합 + 기존 기능 유지

```
15. [ ] time-range-selector.tsx — 실시간/1시간/24시간/7일/30일
16. [ ] 기간별 데이터 쿼리 (recorded_at 범위)
17. [ ] 시뮬레이터 연동 유지 (접이식 패널)
18. [ ] CoreBot 에이전트 토글 유지
19. [ ] Core 채팅 플로팅 버튼 유지
20. [ ] 알림 배너 3D 위 z-index 오버레이
21. [ ] 산업별 예제 씬 2종 준비 + 빌드 + 테스트
```

---

## 11. 성능 고려

```
.splat 파일 크기: 일반적으로 50~200MB
  → Supabase Storage (1GB free) 또는 S3
  → 로딩 시 프로그래스 바 표시

모바일: DPR 1 + 해상도 제한
  → GaussianSplats3D는 WebGL 기반, 대부분 모바일 지원

마커 수: 설비 100대 이하 → DOM 라벨로 충분
  → 100대+ 시 InstancedMesh로 전환 검토

데이터 폴링: 5초 간격
  → 추후 Supabase Realtime(WebSocket)으로 전환
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-10 | Phase 1 design — Luma AI + GaussianSplats3D | JOYTEC |
