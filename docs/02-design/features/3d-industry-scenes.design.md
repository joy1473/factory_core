# 3D 업종별 환경 — Design Document

> Plan 참조: `docs/01-plan/features/3d-industry-scenes.plan.md`

## 1. 핵심 설계: 씬 프리셋 데이터 구조

```typescript
// src/lib/constants/scene-presets.ts

export interface EquipmentConfig {
  pos: [number, number, number];
  type: string;      // equipment.tsx에서 렌더링할 타입
  alert?: boolean;
  label?: string;
}

export interface ChatMessage {
  from: "user" | "ai";
  text: string;
  at: number;        // 0~1 (채팅 진행률 기준)
  alert?: boolean;
  actions?: boolean;
}

export interface OverlayText {
  title: string;
  subtitle: string;
  align: "left" | "right" | "center";
}

export interface CameraKeyframe {
  pos: [number, number, number];
  target: [number, number, number];
}

export interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  equipment: EquipmentConfig[];
  stickers: [number, number, number][];
  alertIndex: number;           // 이상 감지할 설비 인덱스
  waypoints: [number, number, number][];
  kioskPos: [number, number, number];
  cameraKeyframes: CameraKeyframe[];
  chatMessages: ChatMessage[];
  overlayTexts: OverlayText[];  // 5단계 스크롤 텍스트
}
```

## 2. 씬 선택 UI

```
/solution 페이지 상단 (Canvas 위 z-40):

┌──────────────────────────────────────────────┐
│  🏭 기본 공장  │  ⚡ 전자/반도체  │  ⚙ 금형  │  🖥 사무실  │
└──────────────────────────────────────────────┘

- 탭 클릭 → URL ?scene=xxx 변경
- 3D 씬 fade-out → 데이터 교체 → fade-in
- 선택된 탭 하이라이트
```

## 3. 설비 컴포넌트 확장

```
equipment.tsx에 type 추가:
  기존: "cnc" | "press" | "injection"
  추가: "smt" | "reflow" | "aoi" | "wirecut" | "grinder" | "server" | "desk" | "meeting"

각 타입: BoxGeometry + CylinderGeometry 조합 (low-poly)
```

## 4. 파일 변경 목록

```
신규:
  src/lib/constants/scene-presets.ts    — 4개 씬 프리셋 데이터
  src/components/solution/scene-selector.tsx — 업종 탭 UI

수정:
  src/components/solution/scene/factory-scene.tsx — preset 기반으로 리팩토링
  src/components/solution/scene/equipment.tsx     — 신규 설비 타입 추가
  src/components/solution/scene/kiosk-screen.tsx  — chatMessages를 props로
  src/app/solution/page.tsx                       — 씬 선택기 추가
```

## 5. Day 1 구현 순서

```
1. scene-presets.ts 작성 (4개 프리셋)
2. equipment.tsx에 신규 설비 추가
3. factory-scene.tsx 리팩토링 (preset 기반)
4. kiosk-screen.tsx 리팩토링 (chatMessages props)
5. scene-selector.tsx 탭 UI
6. solution/page.tsx에 선택기 통합
7. 빌드 + 테스트
```
