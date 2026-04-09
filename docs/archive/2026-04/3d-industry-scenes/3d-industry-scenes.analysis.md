# 3D Industry Scenes — Gap Analysis Report

> **Date**: 2026-04-09
> **Match Rate**: 24%
> **Status**: Gap detected — iteration needed

---

## Overall Match Rate: 24%

| Category | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| CSS Variables (Sec 0) | 6 | 0 | 0% |
| ScenePreset colors (Sec 1) | 5 | 0 | 0% |
| SmartFactoryDiagram (Sec 2) | 13 | 4 | 31% |
| 3D Scene (Sec 3) | 13 | 5 | 38% |
| Solution Page (Sec 4) | 4 | 1 | 25% |
| **Total** | **41** | **10** | **24%** |

## What IS Done (10/41)

- ✅ AI Agent 섹션 파스텔 민트 + 캐릭터 영상 4개
- ✅ 키오스크 헤더 Core 아바타 + 민트 테마
- ✅ 키오스크 AI 말풍선 파스텔 + Core 아바타
- ✅ 키오스크 액션 버튼 파스텔 3색
- ✅ 키오스크 전송 버튼 민트
- ✅ CoreBot Family 카드 (솔루션 페이지)
- ✅ 히어로 섹션 4캐릭터 (홈페이지)

## What's NOT Done (31/41)

### Foundation (blocks everything)
- ❌ globals.css 파스텔 CSS Variables 미추가
- ❌ ScenePreset interface에 colors 필드 미추가
- ❌ 4개 프리셋에 colors 값 미설정

### 3D Scene (6 items)
- ❌ factory-floor: #00ff41 하드코딩 (→ preset.colors.grid)
- ❌ iot-sticker: #00ff41/#ff2222 하드코딩 (→ preset.colors)
- ❌ data-particles: caller가 옛 색상 전달
- ❌ factory-scene: colors props 미전달, 조명 미조정
- ❌ ambientLight 0.08 → 0.12 미적용
- ❌ hemisphereLight 톤 미변경

### UI (7 items)
- ❌ 시스템 구조도 Layer 1~3 여전히 옛 색상
- ❌ Box 컴포넌트 색상 미변경
- ❌ DataFlow 라인 #333 → #444 미변경
- ❌ Level Guide 카드 top-border 옛 색상
- ❌ SceneSelector 탭 파스텔 미적용
- ❌ 로딩 스피너 #00ff41 → #A8E6CF 미변경

## Root Cause

Foundation (CSS Variables + ScenePreset colors) 미구현 → 하위 컴포넌트가 참조할 색상 데이터 없음.
캐릭터 영상 배치만 완료, 색상 시스템 전환은 미착수.

## Recommended Fix Order

1. globals.css + scene-presets.ts (foundation)
2. factory-scene.tsx (colors 전달 허브)
3. factory-floor / iot-sticker / data-particles (3D 소비자)
4. smart-factory-diagram.tsx (Layer 1~3)
5. solution/page.tsx + scene-selector.tsx (UI)
