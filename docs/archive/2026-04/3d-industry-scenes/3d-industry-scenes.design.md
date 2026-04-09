# 3D 업종별 환경 — Design Document (v2: CoreBot Family 파스텔)

> **Plan 참조**: `docs/01-plan/features/3d-industry-scenes.plan.md`
> **Date**: 2026-04-03
> **Status**: Draft — Day 1 파스텔 톤 리디자인

---

## 0. CoreBot Family 파스텔 컬러 시스템

### 0.1 캐릭터별 컬러

| 캐릭터 | 역할 | 파스텔 Primary | Accent | CSS Variable |
|--------|------|---------------|--------|-------------|
| Core 🤖 | AI Agent 본체 | #A8E6CF (민트) | #7FCDBB | `--corebot-core` |
| Eye 👁 | 시각 AI | #DDA0DD (라벤더) | #C89BD9 | `--corebot-eye` |
| Ear 👂 | 청각 AI | #FFD3B6 (피치) | #FFB89A | `--corebot-ear` |
| Touch 🖐 | IoT 촉각 | #FDFD96 (웜옐로우) | #F0E68C | `--corebot-touch` |

### 0.2 씬별 컬러 매핑

| 씬 ID | 업종 | primary | accent | alert | grid | particles |
|--------|------|---------|--------|-------|------|-----------|
| `general` | 기본 공장 | #A8E6CF | #7FCDBB | #FF9A9A | #A8E6CF | #A8E6CF |
| `electronics` | 전자/반도체 | #DDA0DD | #C89BD9 | #FF9A9A | #DDA0DD | #DDA0DD |
| `metal` | 금형/CNC | #FFD3B6 | #FFB89A | #FF9A9A | #FFD3B6 | #FFD3B6 |
| `office` | 사무실/IT | #FDFD96 | #F0E68C | #FF9A9A | #FDFD96 | #FDFD96 |

### 0.3 CSS Variables (globals.css 추가)

```css
:root {
  --pastel-mint: #A8E6CF;
  --pastel-lavender: #DDA0DD;
  --pastel-peach: #FFD3B6;
  --pastel-yellow: #FDFD96;
  --pastel-alert: #FF9A9A;
  --corebot-core: var(--pastel-mint);
  --corebot-eye: var(--pastel-lavender);
  --corebot-ear: var(--pastel-peach);
  --corebot-touch: var(--pastel-yellow);
}
```

---

## 1. 데이터 구조 (ScenePreset 확장)

```typescript
// src/lib/constants/scene-presets.ts

export interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  equipment: EquipmentConfig[];
  stickers: [number, number, number][];
  alertIndex: number;
  waypoints: [number, number, number][];
  kioskPos: [number, number, number];
  cameraKeyframes: CameraKeyframe[];
  chatMessages: ChatMessage[];
  overlayTexts: { title: string; subtitle: string }[];

  // NEW: 파스텔 컬러
  colors: {
    primary: string;    // 씬 주 색상
    accent: string;     // 보조
    alert: string;      // 이상 알림
    grid: string;       // 바닥 그리드
    particles: string;  // 데이터 파티클
    sticker: string;    // IoT 스티커
  };
}
```

---

## 2. SmartFactoryDiagram 파스텔 리디자인

### 레이어별 색상 변경

| 레이어 | 기존 border | 파스텔 border | 기존 text | 파스텔 text | bg |
|--------|-----------|-------------|----------|-----------|-----|
| 응용시스템 S/W | #3366aa | #DDA0DD/40 | #6699dd | #DDA0DD | #1a0d1a |
| 제어 자동화 | #336644 | #FFD3B6/40 | #44aa66 | #FFD3B6 | #1a140d |
| 현장 자동화 | #665522 | #FDFD96/40 | #aa8844 | #FDFD96 | #1a1a0d |
| AI Agent | #ff4444 | #A8E6CF/30 | #ff6666 | #A8E6CF | #0d1a14 |

### Box 컴포넌트 색상

| 레이어 | 기존 Box color | 파스텔 |
|--------|-------------|--------|
| 응용시스템 | #4488ff / #6699dd | #C89BD9 / #DDA0DD |
| 제어 자동화 | #00cc66 | #FFB89A |
| 현장 자동화 | #ddaa44 | #F0E68C |

### 아이콘 영역

| 레이어 | 기존 icon bg | 파스텔 |
|--------|------------|--------|
| CLOUD ☁ | #4488ff/10 | #DDA0DD/15 |
| PPS 📡 | #00cc66/10 | #FFD3B6/15 |
| 설비 ⚙ | #ddaa44/10 | #FDFD96/15 |
| AI Agent 🤖 | #ff4444/10 | #A8E6CF/15 |

### DataFlow 라인

- 기존: `bg-[#333]`
- 변경: `bg-[#444]` (파스텔과 대비)

---

## 3. 3D 씬 파스텔 적용

### 3.1 factory-floor.tsx

```
변경:
  gridHelper color → preset.colors.grid + opacity 0.15
  기존 #00ff41 하드코딩 제거
```

### 3.2 iot-sticker.tsx

```
변경:
  정상: #00ff41 → preset.colors.sticker (씬별 파스텔)
  알림: #ff2222 → preset.colors.alert (#FF9A9A)
  PointLight color도 동일 매핑
```

### 3.3 data-particles.tsx

```
변경:
  정상: #00d4ff → preset.colors.particles
  알림: #ff4444 → preset.colors.alert
```

### 3.4 factory-scene.tsx

```
변경:
  preset.colors를 하위 컴포넌트에 props 전달
  조명: ambientLight 0.08 → 0.12 (파스텔 가시성)
  hemisphereLight: #1a1a3e → #2a1a2e (약간 따뜻한 톤)
```

### 3.5 kiosk-screen.tsx 채팅 UI

```
헤더: bg-gradient-to-r from-[#0a2a0a] → from-[#0a1a14]
      text #00ff41 → preset.colors.primary (민트)

AI 말풍선:
  기존: bg-white/10 text-white
  변경: bg-[preset.colors.primary]/10 border-l-2 border-[preset.colors.primary]/30

Alert 말풍선:
  기존: bg-red-500/10 border-red-500/30
  변경: bg-[#FF9A9A]/10 border-[#FF9A9A]/30

액션 버튼:
  기존: bg-[#00ff41]/10 text-[#00ff41]
  변경: bg-[preset.colors.primary]/15 text-[preset.colors.primary]
```

---

## 4. Solution 페이지 파스텔

### 4.1 Level Guide 카드

| Level | 기존 top-border | 파스텔 |
|-------|----------------|--------|
| ICT 미적용 | #555 | #B0B0B0 |
| 기초 | #00d4ff | #A8E6CF |
| 중간1 | #00ff88 | #DDA0DD |
| 중간2 | #ffaa00 | #FFD3B6 |
| 고도 | #ff6644 | #FFB347 |

### 4.2 SceneSelector 탭

```
Active: bg-{씬파스텔}/15, text-{씬파스텔}, border-bottom-2 {씬파스텔}
Inactive: text-gray-500, hover:text-{씬파스텔}/70
```

### 4.3 로딩 스피너

```
기존: border-[#00ff41]
변경: border-[#A8E6CF]
```

---

## 5. 파일 변경 목록 (Day 1)

| File | Action | Changes |
|------|--------|---------|
| `src/lib/constants/scene-presets.ts` | Modify | `colors` 필드 추가 (4프리셋) |
| `src/app/globals.css` | Modify | 파스텔 CSS Variables |
| `src/components/solution/scene/factory-floor.tsx` | Modify | grid → preset.colors.grid |
| `src/components/solution/scene/iot-sticker.tsx` | Modify | 색상 → preset.colors.sticker/alert |
| `src/components/solution/scene/data-particles.tsx` | Modify | 색상 → preset.colors.particles/alert |
| `src/components/solution/scene/factory-scene.tsx` | Modify | colors props 전달, 조명 조정 |
| `src/components/solution/scene/kiosk-screen.tsx` | Modify | 채팅 UI 파스텔 |
| `src/components/solution/smart-factory-diagram.tsx` | Modify | 4레이어 파스텔 |
| `src/components/solution/scene-selector.tsx` | Modify | 탭 파스텔 |
| `src/app/solution/page.tsx` | Modify | Level Guide + 스피너 파스텔 |

---

## 6. Day 1 구현 순서

```
Phase A: 컬러 시스템 기초
━━━━━━━━━━━━━━━━━━━━━━━
1. [ ] scene-presets.ts — colors 필드 추가 (4개 프리셋)
2. [ ] globals.css — 파스텔 CSS Variables

Phase B: 3D 씬 파스텔 적용
━━━━━━━━━━━━━━━━━━━━━━━━
3. [ ] factory-floor.tsx — 그리드 색상 preset.colors
4. [ ] iot-sticker.tsx — 스티커 색상 preset.colors
5. [ ] data-particles.tsx — 파티클 색상 preset.colors
6. [ ] factory-scene.tsx — colors props 전달 + 조명

Phase C: UI 파스텔 적용
━━━━━━━━━━━━━━━━━━━━━━
7. [ ] smart-factory-diagram.tsx — 4레이어 파스텔
8. [ ] solution/page.tsx — Level Guide + 스피너
9. [ ] scene-selector.tsx — 탭 파스텔

Phase D: 키오스크 채팅
━━━━━━━━━━━━━━━━━━━━━
10. [ ] kiosk-screen.tsx — 채팅 UI 파스텔

Phase E: 검증
━━━━━━━━━━━━
11. [ ] pnpm build
12. [ ] 4개 씬 전환 확인
```

---

## 7. Day 2-3 예정 (참고)

```
Day 2:
  - CoreBotWorker 캐릭터 (worker.tsx 교체)
  - DB scene_presets colors 컬럼 마이그레이션
  - 캐릭터 아바타 키오스크 적용

Day 3:
  - 라이트/다크 모드 토글
  - DB 기반 프리셋 로드 우선화
  - 모바일 최적화
```
