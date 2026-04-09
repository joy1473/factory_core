# 3D 업종별 환경 구현 — Plan Document

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | 태그(업종)별 다른 3D 공장/사무실 환경을 /solution에서 선택·전환 |
| **시작일** | 2026-04-09 |
| **목표일** | 2026-04-12 (3일) |

### Value Delivered

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 /solution은 범용 공장 하나뿐. 전자부품 공장, 금형 공장, 사무실은 설비·환경이 전혀 다른데 같은 씬을 보여줌. 방문객이 "우리 공장에는 안 맞겠네" 느낌 |
| **Solution** | 업종 태그별 3D 씬 프리셋 (설비 배치, IoT 위치, 이상 시나리오, 키오스크 대화)를 다르게 구성. URL 파라미터 또는 UI 선택으로 전환 |
| **Function UX Effect** | /solution 상단에 업종 탭 → 클릭하면 3D 씬이 해당 업종으로 전환. 전시회에서 "사장님 업종이 뭐예요?" → 탭 클릭 → 맞춤 데모 |
| **Core Value** | "우리 공장에 맞는 솔루션이네" 공감 → 전환율 향상. 전시회 부스에서 즉석 맞춤 데모 가능 |

---

## 1. 업종별 씬 정의

### 1.1 씬 목록 (MVP: 4개)

| 씬 ID | 업종 | 핵심 설비 | 이상 시나리오 | 키오스크 대화 |
|--------|------|----------|-------------|-------------|
| `general` | 기본 공장 (현재) | CNC 2, 프레스, 사출기 | 사출기 베어링 마모 82% | "생산 현황 → 사출기 이상 → 보고서" |
| `electronics` | 전자/반도체 | SMT라인, 리플로우, AOI검사기, 클린룸 | AOI 검사 불량률 급증 | "불량률 현황 → AOI 이상 → 품질 보고서" |
| `metal` | 금형/CNC | CNC 5대, 와이어컷, 연마기, 측정기 | CNC 스핀들 진동 이상 | "가공 정밀도 → 진동 이상 → 정비 보고서" |
| `office` | 사무실/IT | 서버랙, 모니터 다수, 회의실, 복합기 | 서버 온도 급상승 | "서버 상태 → 온도 이상 → 냉각 조치" |

### 1.2 씬별 차이점

```
각 씬마다 다른 것:
  ├── 설비 종류 + 배치 (EQUIPMENT_CONFIG)
  ├── IoT 스티커 위치 (STICKER_POSITIONS)
  ├── 작업자 경로 (WAYPOINTS)
  ├── 이상 감지 설비 + 색상
  ├── 키오스크 대화 내용 (CHAT_MESSAGES)
  ├── 바닥 색상/스타일
  └── 카메라 키프레임 (씬 크기에 따라)

같은 것:
  ├── 3D 렌더링 엔진 (R3F)
  ├── 스크롤 인터랙션 로직
  ├── Bloom + Vignette
  ├── DOM 텍스트 오버레이 구조
  └── 키오스크 채팅 UI 컴포넌트
```

## 2. 기술 설계

### 2.1 씬 설정을 데이터로 분리

```typescript
// src/lib/constants/scene-presets.ts

interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  floor: { color: string; gridColor: string };
  equipment: { pos: [number,number,number]; type: string; alert?: boolean }[];
  stickers: [number,number,number][];
  waypoints: [number,number,number][];
  kioskPos: [number,number,number];
  cameraKeyframes: { pos: [number,number,number]; target: [number,number,number] }[];
  chatMessages: { from: "user"|"ai"; text: string; at: number; alert?: boolean; actions?: boolean }[];
  overlayTexts: { title: string; subtitle: string }[];
}
```

### 2.2 설비 컴포넌트 확장

```
현재: CNC, Press, Injection (3종)
추가 필요:
  - SMTLine (전자): 긴 컨베이어 + 부품 배치기
  - ReflowOven (전자): 큰 박스형 오븐
  - AOIInspector (전자): 카메라 + 모니터
  - WireCut (금형): 와이어 가공기
  - Grinder (금형): 원형 연마기
  - ServerRack (사무실): 서버랙 (LED 깜빡임)
  - DeskCluster (사무실): 책상 + 모니터 그룹
  - MeetingRoom (사무실): 유리벽 + 테이블
```

### 2.3 URL 파라미터 방식

```
/solution              → 기본 공장 (general)
/solution?scene=electronics  → 전자부품 공장
/solution?scene=metal        → 금형/CNC
/solution?scene=office       → 사무실/IT
```

### 2.4 UI 선택기

```
/solution 상단에 업종 탭:
┌──────────────────────────────────────────────┐
│  🏭 기본 공장  │  ⚡ 전자/반도체  │  ⚙ 금형  │  🖥 사무실  │
└──────────────────────────────────────────────┘
탭 클릭 → 씬 전환 (URL 변경 + 3D 씬 교체)
전환 시 fade-out → fade-in 트랜지션
```

## 3. 개발 순서 (3일)

### Day 1: 데이터 구조 + 기본 공장 리팩토링
```
□ scene-presets.ts: 4개 씬 설정 데이터
□ factory-scene.tsx: 하드코딩 → preset 기반으로 리팩토링
□ equipment.tsx: type을 preset에서 읽도록
□ 씬 선택 탭 UI
□ URL 파라미터 연동
□ general(기본) 씬이 기존과 동일하게 동작 확인
```

### Day 2: 신규 설비 + 전자/금형 씬
```
□ 전자 설비: SMTLine, ReflowOven, AOIInspector
□ 금형 설비: WireCut, Grinder
□ electronics 씬 완성 (설비 배치 + 스티커 + 대화)
□ metal 씬 완성
□ 각 씬 카메라 키프레임 조정
```

### Day 3: 사무실 씬 + 전환 효과 + 배포
```
□ 사무실 설비: ServerRack, DeskCluster, MeetingRoom
□ office 씬 완성
□ 씬 전환 트랜지션 (fade)
□ 모바일 반응형 (탭 스크롤)
□ 배포 + 테스트
```

## 4. 성능 고려

```
□ 씬 교체 시 이전 씬 geometry dispose
□ 사용하지 않는 설비 컴포넌트는 dynamic import
□ 모바일: 설비 수 줄이기 (4대 → 2대)
□ 씬 전환: Canvas 재생성 아닌 children 교체
```

## 5. 패키지 의존성

추가 패키지 없음. 기존 R3F + drei + postprocessing 유지.
