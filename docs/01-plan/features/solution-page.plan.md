# Solution Page 고도화 — Plan Document (v3: R3F + Grok 보강)

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | /solution 전면 리디자인 — R3F 3D 인터랙티브 공장 + 스크롤 스토리텔링 |
| **시작일** | 2026-04-08 |
| **목표일** | 2026-04-11 (3일) |

### Value Delivered

| 관점 | 내용 |
|------|------|
| **Problem** | 텍스트만으로 "센서가 어디 붙고, 작업자가 뭘 하고, 키오스크에 뭐가 나오는지" 전달 불가 |
| **Solution** | R3F 3D 공장 + 스크롤 5단계 스토리텔링. Low-poly 매트릭스 스타일 |
| **Function UX Effect** | 스크롤하면 카메라 이동 → 스티커 부착 → 작업자 이동 → 이상 감지 → 키오스크 리포트 |
| **Core Value** | 전시회 부스에서 "와, 이거 뭐예요?" 반응. 경쟁사 압도적 시각 차별화 |

---

## 1. 기술 스택 (확정)

| 라이브러리 | 역할 | 버전 |
|-----------|------|------|
| `@react-three/fiber` | 3D 렌더링 | ^9.x |
| `@react-three/drei` | ScrollControls, Text, Html, Float, MeshTransmission 등 | ^10.x |
| `@react-three/postprocessing` | Bloom (UnrealBloomPass), Vignette | ^3.x |
| `three` | Three.js 코어 | ^0.170.x |
| `lenis` | 부드러운 스크롤 (DOM + Canvas 동기화) | ^1.x |
| `gsap` (선택) | 세밀한 타이밍 제어 필요 시 | ^3.x |

### 스크롤 제어 전략

```
Primary: drei ScrollControls
  → R3F Canvas 안에서 스크롤 제어
  → useScroll() → scroll.offset (0~1) → useFrame에서 카메라 보간
  → damping: 0.1, eps: 0.001 (부드러운 감속)

Fallback: GSAP ScrollTrigger
  → DOM 스크롤과 3D 동기화 필요 시 전환
  → 더 세밀한 타이밍 제어 가능
  → Lenis와 함께 사용

부드러운 스크롤: Lenis
  → DOM 스크롤 자체를 부드럽게
  → R3F ScrollControls와 충돌 가능 → 테스트 필요
  → 충돌 시 ScrollControls의 damping으로 대체
```

### DOM 오버레이 전략

```
방법: Canvas 위에 absolute positioning
  → drei Html 컴포넌트 (3D 좌표 → 2D 화면)
  → 또는 Canvas 바깥 div (z-index + pointer-events: none)
  → 텍스트는 Tailwind로 빠르게 스타일링

구조:
  <div className="relative">
    <Canvas className="absolute inset-0">
      {/* 3D 씬 */}
    </Canvas>
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* 스크롤 텍스트 오버레이 */}
    </div>
  </div>
```

## 2. 3D 씬 구성

### 2.1 공장 레이아웃

```
┌─────────────────────────────────────────┐
│              3D 공장 내부                 │
│                                          │
│  [CNC 1]  [CNC 2]  [프레스]  [사출기]   │  ← InstancedMesh (설비 4대)
│    💚        💚        💚        🔴      │  ← IoT 스티커 (emissive + Bloom)
│                                          │
│        👷 ──────→                        │  ← 작업자 (capsule + walking)
│        (워치+글래스)                      │
│                                          │
│  ┌──────────┐                            │
│  │ 키오스크  │  ← Html 컴포넌트로 실제 UI │
│  │ ████████ │                            │
│  │ ████████ │                            │
│  └──────────┘                            │
│                                          │
│ ═══════════════════════════════════════  │  ← 그리드 바닥 (매트릭스 그린)
└─────────────────────────────────────────┘
```

### 2.2 오브젝트 상세

| 오브젝트 | 구현 방법 | 머티리얼 | 애니메이션 |
|---------|----------|---------|----------|
| **바닥** | PlaneGeometry + GridHelper | 검정 + 매트릭스 그린 그리드 | 없음 |
| **벽** | BoxGeometry (반투명) | wireframe + emissive edge | 없음 |
| **설비** | BoxGeometry + CylinderGeometry 조합 | MeshStandardMaterial (dark gray) + emissive edge | 가동 시 미세 진동 (useFrame) |
| **IoT 스티커** | SphereGeometry (작은 구) | emissive green (#00ff41) + Bloom | 펄스: scale oscillation (sin) |
| **작업자** | CapsuleGeometry (몸) + SphereGeometry (머리) | blue tint | waypoint 경로 이동 (lerp) |
| **워치** | TorusGeometry (손목) | emissive cyan | 데이터 전송 시 flash |
| **글래스** | BoxGeometry (얇은 바) | emissive cyan | HUD overlay 표시 |
| **키오스크** | BoxGeometry (모니터) + Html (화면 내용) | dark frame + emissive screen | 리포트 텍스트 타이핑 효과 |
| **데이터 흐름** | Points / LineSegments | 녹색 파티클 | 센서→키오스크 방향 이동 |
| **경고 링** | RingGeometry | red emissive + Bloom | 확대 + 페이드 반복 |

### 2.3 조명 설계

```
DirectionalLight: 메인 조명 (위에서 45도, 약한 intensity 0.5)
PointLight x4: 각 설비 위 (녹색 틴트, intensity 0.3)
HemisphereLight: 환경광 (sky: #001133, ground: #000000)
AmbientLight: 약한 전체 조명 (intensity 0.1)

→ 어두운 분위기 + Bloom으로 네온 효과 강조
→ 매트릭스 영화 느낌의 어둡고 신비로운 공장
```

### 2.4 포스트프로세싱

```tsx
<EffectComposer>
  <Bloom
    intensity={1.5}
    luminanceThreshold={0.2}
    luminanceSmoothing={0.9}
    mipmapBlur
  />
  <Vignette eskil={false} offset={0.1} darkness={0.8} />
</EffectComposer>
```

## 3. 스크롤 스토리 (5단계)

| 구간 | 카메라 위치 | 3D 이벤트 | DOM 텍스트 |
|------|-----------|----------|-----------|
| **0~20%** 전경 | position: [15, 12, 15], lookAt: [0, 0, 0] | 공장 전체 보임, 설비 가동 중 | "163,273개 중소 제조기업의 현실" |
| **20~40%** 스티커 | position: [3, 2, 3], lookAt: [0, 1, 0] | 스티커가 하나씩 설비에 부착되는 애니메이션 | "$1 스티커 센서. 붙이면 끝." |
| **40~60%** 작업자 | position: [5, 3, 8], lookAt: [0, 1, 2] | 작업자 이동 + 파티클 데이터 흐름 | "AI가 눈과 귀가 되어 24시간 감시" |
| **60~80%** 이상감지 | position: [2, 2, -3], lookAt: [-3, 1, -2] | 사출기 빨간색 + 경고 링 + 워치 진동 | "베어링 이상 확률 82%\n3일 내 점검 권고" |
| **80~100%** 리포트 | position: [4, 2, 4], lookAt: [4, 1.5, 0] | 키오스크 화면에 리포트 표시 | "보고서 자동 생성\n작성 시간 80% 단축" + CTA |

### 카메라 보간 코드 개념

```tsx
const CAMERA_KEYFRAMES = [
  { pos: [15, 12, 15], target: [0, 0, 0] },  // 0~20%
  { pos: [3, 2, 3],    target: [0, 1, 0] },   // 20~40%
  { pos: [5, 3, 8],    target: [0, 1, 2] },   // 40~60%
  { pos: [2, 2, -3],   target: [-3, 1, -2] }, // 60~80%
  { pos: [4, 2, 4],    target: [4, 1.5, 0] }, // 80~100%
];

// useFrame 내에서
const scroll = useScroll();
const progress = scroll.offset; // 0~1
const idx = Math.min(Math.floor(progress * 5), 4);
const t = (progress * 5) - idx; // 구간 내 0~1

// lerp between keyframes
camera.position.lerp(KEYFRAMES[idx].pos, 0.05);
```

## 4. 사운드 (보너스)

| 이벤트 | 사운드 | 라이브러리 |
|--------|--------|-----------|
| 스티커 부착 | "탁" 클릭음 | Howler.js |
| 데이터 전송 | 미세 전자음 | Howler.js |
| 이상 감지 | "삐—" 경고음 | Howler.js |
| 리포트 생성 | 타이핑 사운드 | Howler.js |

```
→ 기본은 음소거, 우측 하단 사운드 토글 버튼
→ autoplay 하지 않음 (브라우저 정책)
→ Day 3에 시간 남으면 추가 (필수 아님)
```

## 5. 모바일 + 성능 전략

```
PC (>1024px):
  - 풀 3D + Bloom + 파티클 + 5단계 스크롤
  - 60fps 목표

태블릿 (768~1024px):
  - 3D 유지, 파티클 50% 감소
  - Bloom intensity 감소

모바일 (<768px):
  - 3D 유지하되 단순화
  - 파티클 최소 (데이터 흐름만)
  - Bloom OFF (성능)
  - dpr={[1, 1.5]} (해상도 제한)

저사양 / WebGL 미지원:
  - <Canvas> 대신 정적 이미지 + CSS 애니메이션
  - {typeof window !== 'undefined' && <Canvas>}
```

### 성능 최적화 체크리스트

```
□ dynamic(() => import('./factory-scene'), { ssr: false })
□ InstancedMesh: 동일 설비 타입은 인스턴싱
□ frameloop="demand" 또는 "always" (스크롤 중만 렌더링)
□ 모바일: dpr={[1, 1.5]}, 파티클 수 감소
□ Bloom: mipmapBlur 사용 (기존 blur보다 빠름)
□ geometry 재사용: useMemo로 geometry 캐싱
□ dispose: unmount 시 geometry/material dispose
```

## 6. 컴포넌트 구조 (최종)

```
src/components/solution/
├── scene/                      — 3D 씬
│   ├── factory-scene.tsx        — Canvas + 조명 + PostProcessing
│   ├── factory-floor.tsx        — 그리드 바닥
│   ├── equipment.tsx            — 설비 4대 (InstancedMesh)
│   ├── iot-sticker.tsx          — IoT 스티커 (emissive + pulse)
│   ├── worker.tsx               — 작업자 + 웨어러블
│   ├── kiosk-screen.tsx         — 키오스크 (Html 내장)
│   ├── data-particles.tsx       — 데이터 흐름 파티클
│   ├── alert-effect.tsx         — 이상 감지 경고
│   └── camera-controller.tsx    — 스크롤 기반 카메라 제어
│
├── overlay/                    — DOM 오버레이
│   ├── scroll-text.tsx          — 스크롤 구간별 텍스트
│   └── sound-toggle.tsx         — 사운드 ON/OFF
│
├── sections/                   — 하단 DOM 섹션
│   ├── pain-point-section.tsx
│   ├── before-after-section.tsx
│   ├── senses-section.tsx       — 시각/청각/촉각 상세
│   ├── comparison-section.tsx   — 차별화 비교표
│   ├── pricing-section.tsx
│   ├── gov-support-section.tsx
│   └── faq-section.tsx
│
└── solution-page-client.tsx    — 페이지 클라이언트 래퍼
```

## 7. 개발 순서 (3일 상세)

### Day 1: 3D 기반

```
□ npm install @react-three/fiber @react-three/drei @react-three/postprocessing three
□ factory-scene.tsx: Canvas + 조명 (Directional + Point + Hemisphere)
□ PostProcessing: Bloom + Vignette
□ factory-floor.tsx: PlaneGeometry + GridHelper (매트릭스 그린)
□ equipment.tsx: 4대 설비 (Box+Cylinder, 각각 다른 형태)
□   - CNC: 직사각 박스 + 상단 실린더 (스핀들)
□   - CNC2: 동일
□   - 프레스: 넓은 박스 + 위아래 피스톤
□   - 사출기: 긴 박스 + 호퍼(삼각형)
□ iot-sticker.tsx: 각 설비에 작은 구 (emissive green + sin scale pulse)
□ 기본 OrbitControls로 확인
□ dynamic import + ssr: false 설정
```

### Day 2: 인터랙션 + 스크롤

```
□ camera-controller.tsx: ScrollControls + useScroll
□   - 5개 카메라 키프레임 정의
□   - useFrame에서 lerp 보간
□ worker.tsx: capsule body + sphere head + torus wrist(워치)
□   - waypoint 배열 따라 이동 (스크롤 40~60% 구간)
□ data-particles.tsx: Points로 센서→키오스크 파티클
□   - 스크롤 40~60% 구간에서 활성화
□ alert-effect.tsx: 사출기 이상 감지
□   - 스크롤 60~80% 구간
□   - material.color lerp (green → red)
□   - RingGeometry scale pulse
□ kiosk-screen.tsx: BoxGeometry 모니터 + Html
□   - 스크롤 80~100% 구간에서 리포트 텍스트 등장
□ scroll-text.tsx: 각 구간 텍스트 오버레이
```

### Day 3: DOM 섹션 + 통합

```
□ pain-point-section.tsx (실태조사 데이터)
□ before-after-section.tsx (비교표)
□ senses-section.tsx (시각/청각/촉각 상세)
□ comparison-section.tsx (기존 MES vs Factory Guardian)
□ pricing-section.tsx (PoC + SaaS)
□ gov-support-section.tsx (정부 지원)
□ faq-section.tsx (7개 질문)
□ 모바일 반응형 + 저사양 fallback
□ 빌드 최적화 + 배포
□ (보너스) 사운드 효과
```

## 8. 추후 솔루션 개발 후 진행 (Backlog)

### 8.1 사운드 효과
```
□ 스티커 부착 시 "탁" 클릭음
□ 데이터 전송 시 전자음
□ 이상 감지 시 "삐—" 경고음
□ 리포트 생성 시 타이핑 사운드
□ 기본 음소거, 우측 하단 사운드 토글 버튼
```

### 8.2 CoreBot Family 상세 데모 (아코디언 펼침)

솔루션 페이지 CoreBot Family 카드 클릭 시 아래로 펼쳐지는 상세 설명:

```
각 캐릭터별 구성:
  ├── 캐릭터 MP4 영상 (좌측)
  ├── 4컷 만화 시나리오 (우측, Grok 생성 또는 CSS/HTML)
  └── CSS 애니메이션 (스캔 라인, 파형 등)

Eye (시각 AI):
  1컷: 작업자 스마트글래스 착용
  2컷: 설비 스캔 → 균열/누유/변색 하이라이트
  3컷: "균열 발견!" 자동 캡처
  4컷: 저장 완료 → 보고서 자동 반영
  → 핵심: 사람이 지나치는 오류를 Eye가 녹화·자동저장·분석

Ear (청각 AI):
  1컷: 작업자 워치/폰 들고 현장 통과
  2컷: 주변 잡음 필터링 (소리 파형 시각화)
  3컷: "이상 신호 감지!" 베어링 마모음
  4컷: 알림 전송 → "3일 내 교체 권고"
  → 핵심: 잡음 제외한 이상 신호를 Ear가 기록·알림·분석

Touch (IoT 촉각):
  1컷: $1 스티커 설비에 붙이기
  2컷: 온도·습도·진동 실시간 감지
  3컷: "경고! 78°C" 임계치 초과
  4컷: 즉시 알림 → 자동 보고

Core (AI 공장장):
  1컷: Eye+Ear+Touch 데이터 수집
  2컷: AI 통합 분석
  3컷: 보고서 자동 생성 (0.3초)
  4컷: "사장님, 오늘 보고서 확인하세요"
```

### 8.3 선행 조건
```
- 실제 웨어러블(글래스/워치) 프로토타입 또는 시뮬레이션 영상
- Grok으로 4컷 만화 이미지 생성 (CoreBot 캐릭터 스타일)
- 솔루션 MVP 개발 후 실제 동작 화면 캡처
```

---

## 9. CTA 연출

```
마지막 스크롤 구간 (80~100%):
  키오스크 3D 모니터에 리포트가 표시됨
  → 리포트 위에 "데모 신청하기" 버튼이 3D 공간에서 떠오름
  → drei Html 컴포넌트로 실제 클릭 가능한 Link
  → 클릭 시 /poc 페이지로 이동
  → 매트릭스 그린 glow 효과로 시선 집중
```
