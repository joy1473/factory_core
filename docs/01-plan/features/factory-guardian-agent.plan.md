# Factory Guardian Agent — 솔루션 아키텍처 Plan

> **Summary**: 중소 제조기업을 위한 Agentic AI 설비 관리 솔루션 전체 아키텍처
>
> **Project**: Factory Core
> **Date**: 2026-04-09
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 중소 제조기업 163,273개사 중 AI 도입률 0.1%. 전문인력 부족(43.8%), 초기 비용 부담(44.2%), 기존 MES 투자 7.5억원. 설비 고장 시 대응 늦어 생산 중단 |
| **Solution** | $1 IoT 스티커 + 웨어러블(글래스/워치) + Edge AI + 클라우드 4개 AI Agent(Eye/Ear/Touch/Core)가 실시간 감시·분석·보고 |
| **Function/UX Effect** | 스티커 붙이고 30분 내 시작. 작업자가 현장 걸으면 Eye가 보고, Ear가 듣고, Touch가 감지. Core가 통합 분석 → 대화형 키오스크/모바일 보고 |
| **Core Value** | MES 없이, 전문가 없이, 월 10만원으로 AI 공장장 도입. 생산성 28.5% 향상, 불량률 감소, 설비 다운타임 최소화 |

---

## 1. 시스템 전체 아키텍처 (AWS Cloud SaaS)

```
┌──────────────────────────────────────────────────────────────────┐
│                     AWS CLOUD (SaaS)                              │
│                                                                  │
│  ┌─────────────┐                                                 │
│  │ AWS IoT Core│ ← MQTT ← Edge Gateway (RPi + Greengrass)       │
│  │ (Greengrass) │                                                │
│  └──────┬──────┘                                                 │
│         │                                                        │
│  ┌──────┴──────────────────────────────────────────────────┐     │
│  │              AI Layer (모두 클라우드)                     │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐     │     │
│  │  │ Touch  │ │  Eye   │ │  Ear   │ │    Core      │     │     │
│  │  │SageMkr │ │SageMkr │ │SageMkr │ │ Claude API   │     │     │
│  │  │(시계열)│ │(비전)  │ │(오디오)│ │ (LLM+RAG)    │     │     │
│  │  └────────┘ └────────┘ └────────┘ └──────────────┘     │     │
│  └─────────────────────────┬───────────────────────────────┘     │
│                            │                                     │
│  ┌─────────────────────────┴───────────────────────────────┐     │
│  │           Data Layer (Supabase + S3)                    │     │
│  │  시계열 DB · 이미지 · 오디오 · 벡터 · 보고서            │     │
│  └─────────────────────────┬───────────────────────────────┘     │
│                            │                                     │
│  ┌─────────────────────────┴───────────────────────────────┐     │
│  │           SaaS 웹 (Next.js on Vercel)                   │     │
│  │  Admin 대시보드 · 키오스크 · 모바일 · 알림(SES/FCM)     │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS / MQTT
┌──────────────────────────────┴───────────────────────────────────┐
│                      EDGE (공장 현장)                             │
│                                                                  │
│  ┌───────────────────┐  ┌────────────┐  ┌───────────────────┐   │
│  │ Edge Gateway      │  │ 웨어러블   │  │ 키오스크 단말     │   │
│  │ RPi + BLE dongle  │  │ 글래스/워치│  │ (태블릿 PWA)      │   │
│  │ + AWS Greengrass  │  └────────────┘  └───────────────────┘   │
│  │                   │                                           │
│  │ 역할:             │                                           │
│  │ · BLE 스캔/수집   │                                           │
│  │ · 신호 필터링     │                                           │
│  │ · 로컬 buffering  │                                           │
│  │ · 기본 threshold  │                                           │
│  └─────────┬─────────┘                                           │
│            │ BLE 5.0                                             │
│  ┌─────────┴──────────────────────────────────────────────┐     │
│  │              IoT Sensor Network                         │     │
│  │  [$1 스티커] [$1 스티커] [$1 스티커] [마이크] [카메라]   │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘

확장 대비: Wi-Fi/Cellular active 센서 → Edge 없이 AWS IoT Core 직접 연결
```

---

## 2. 4개 AI Agent 상세

### 2.1 Eye Agent (시각 AI)

```
입력: 카메라 영상 / 스마트글래스 스트림
처리: Edge AI (YOLO/MobileNet) → 실시간 객체 감지
기능:
  - 설비 외관 이상 감지 (균열, 누유, 변색, 부식)
  - 안전장비 착용 여부 확인
  - 게이지/미터 자동 판독 (OCR)
  - 이상 감지 시 자동 캡처 + 저장 + 알림
기술:
  - YOLOv8/YOLOv11 (실시간 객체 감지)
  - OpenCV (이미지 전처리)
  - ONNX Runtime (Edge 추론, <200ms)
  - Supabase Storage (이미지 저장)
하드웨어:
  - 스마트 글래스 (Vuzix, RealWear) 또는 USB 카메라
  - Edge: Jetson Nano / RPi 5
```

### 2.2 Ear Agent (청각 AI)

```
입력: 마이크 오디오 스트림 / 웨어러블 마이크
처리: Edge AI → 주파수 분석 + 이상음 감지
기능:
  - 정상 소리 학습 → 이상음 감지 (비지도 학습)
  - 주파수 분석: BPFO/BPFI/FTF (베어링 결함 주파수)
  - 배경 잡음 필터링 (노이즈 게이트 + 밴드패스)
  - 이상 감지 시 녹음 + 시간 태그 + 알림
기술:
  - Librosa / torchaudio (오디오 전처리)
  - Mel-Spectrogram → CNN (이상음 분류)
  - Isolation Forest (비지도 이상 감지)
  - WebRTC / MQTT (실시간 스트리밍)
하드웨어:
  - MEMS 마이크 (ICS-43434) 또는 스마트워치 내장 마이크
  - Edge: RPi + USB 마이크 배열
```

### 2.3 Touch Agent (IoT 촉각)

```
입력: $1 IoT 스티커 센서 데이터
처리: Edge Gateway → 수집/변환 → 클라우드 전송
기능:
  - 온도 모니터링 (임계치 초과 경고)
  - 진동 분석 (ISO 10816 기준 Zone A~D 판정)
  - 습도/가스 감지 (선택)
  - 추세 분석 → 예측 유지보수 (RUL 추정)
센서 선정: Wiliot Gen3 IoT Pixel (강력 추천)
  - Battery-free (RF energy harvesting, dual-band 2.4GHz + sub-1GHz)
  - 온도/습도/모션/빛/위치 다기능 센싱
  - Passive BLE encrypted continuous broadcast
  - 범위: 최대 150ft+, Gen3에서 대폭 향상
  - 단가: ~$0.10 목표 (대량), postage stamp 크기
  - Ambient IoT Alliance 멤버 (Qualcomm/Intel/PepsiCo)
  - 파트너: Avery Dennison, Tageos (대량 생산)
기술:
  - Wiliot Gen3 BLE passive (센서 통신)
  - MQTT → Edge Gateway → Supabase
  - 시계열 DB (TimescaleDB 또는 Supabase + pg_partman)
  - Prophet / LSTM (시계열 예측)
하드웨어:
  - Gen3 IoT Pixel ($1 스티커, 배터리리스 NFC/BLE)
  - Edge Gateway: RPi + BLE 동글
  - 설비당 1~3개 스티커 부착
```

### 2.4 Core Agent (AI 공장장)

```
입력: Eye + Ear + Touch 통합 데이터 + 대화 입력
처리: Cloud LLM (Claude/GPT) + RAG
기능:
  - 멀티모달 데이터 통합 분석
  - 자연어 대화 (키오스크/모바일)
    "오늘 생산 현황 알려줘" → 실시간 답변
  - 자동 보고서 생성 (일일/주간/월간)
  - 이상 감지 종합 판단 + 조치 권고
  - 정비 이력 기반 예측 유지보수 일정
기술:
  - Claude API (Anthropic) 또는 GPT-4o
  - RAG: 설비 매뉴얼 + 정비 이력 + 산업 표준
  - LangChain / LlamaIndex (Agent 오케스트레이션)
  - Supabase pgvector (벡터 DB for RAG)
출력:
  - 키오스크 터치스크린 (대화형)
  - 모바일 앱/웹 (알림 + 보고서)
  - 이메일/카카오 알림
```

---

## 3. 데이터 흐름

```
센서 → Edge Gateway → MQTT Broker → Cloud API → DB
  ↓                                      ↓
[실시간]                           [배치 분석]
  ↓                                      ↓
Edge AI 추론                    Cloud AI (LLM + ML)
  ↓                                      ↓
즉시 알림 (긴급)              보고서 + 추세 분석
  ↓                                      ↓
키오스크/워치 알림            Admin 대시보드 + 이메일
```

### 3.1 실시간 경로 (<1초)

```
센서 데이터 → Edge Gateway → 임계치 판정 → 즉시 알림
  - 온도 80°C 초과 → 경고
  - 진동 Zone C 진입 → 경고
  - 이상음 감지 → 녹음 + 알림
  - 균열 감지 → 캡처 + 알림
```

### 3.2 분석 경로 (1분~1시간)

```
축적 데이터 → Cloud ML → 추세 분석 → 예측
  - 진동 추세 → RUL(잔여수명) 추정
  - 온도 패턴 → 이상 예측
  - 불량률 추이 → 품질 경고
```

### 3.3 보고 경로 (일/주/월)

```
전체 데이터 → Core Agent (LLM) → 자동 보고서
  - 일일 설비 점검 보고서
  - 주간 생산 현황 리포트
  - 월간 예측 유지보수 계획
  - 대화형 Q&A ("지난주 불량률은?")
```

---

## 4. 기술 스택

### 4.1 Edge (공장 현장)

| 영역 | 기술 | 사유 |
|------|------|------|
| Edge 하드웨어 | Raspberry Pi 5 / Jetson Nano | 가성비, Python 생태계 |
| AI 추론 | ONNX Runtime / TensorFlow Lite | Edge 경량 추론 |
| 비전 | YOLOv8 + OpenCV | 실시간 객체 감지 |
| 오디오 | Librosa + PyTorch | 스펙트로그램 분석 |
| 통신 | MQTT (Mosquitto) | IoT 표준, 경량 |
| 센서 | BLE 5.0 | $1 스티커 통신 |

### 4.2 Cloud

| 영역 | 기술 | 사유 |
|------|------|------|
| 웹 프레임워크 | Next.js 16 (기존) | Factory Core 통합 |
| DB | Supabase PostgreSQL | 기존 인프라 활용 |
| 시계열 | Supabase + pg_partman | 센서 데이터 파티셔닝 |
| 벡터 DB | pgvector (Supabase) | RAG용 임베딩 검색 |
| 파일 저장 | Supabase Storage / S3 | 이미지, 오디오, 보고서 |
| LLM | Claude API (Anthropic) | 대화형 + 보고서 생성 |
| Agent | LangChain / LangGraph | 멀티에이전트 오케스트레이션 |
| 실시간 | WebSocket / Supabase Realtime | 실시간 대시보드 |
| 알림 | AWS SES (기존) + FCM | 이메일 + 푸시 |

### 4.3 클라이언트

| 영역 | 기술 | 사유 |
|------|------|------|
| 키오스크 | Next.js PWA | 터치스크린 웹앱 |
| 모바일 | React Native 또는 PWA | 알림 + 보고서 확인 |
| 스마트 글래스 | Android SDK (WebView) | Vuzix/RealWear 연동 |
| 스마트 워치 | WearOS / watchOS | 진동 알림 |

---

## 5. MVP 개발 순서

### Phase 1: Touch MVP (2주)
```
가장 빠르게 가치를 보여줄 수 있는 센서 모니터링부터

1. [ ] 시뮬레이터: 가상 센서 데이터 생성 API
       - 온도, 진동, 습도 랜덤 + 패턴 생성
       - 실제 센서 없이 개발/데모 가능
2. [ ] DB: sensor_readings 시계열 테이블
3. [ ] API: 센서 데이터 수신 + 임계치 판정
4. [ ] 실시간 대시보드: 설비별 온도/진동 차트
5. [ ] 알림: 임계치 초과 시 이메일 + 화면 경고
6. [ ] 키오스크 UI: 대시보드 + 알림 표시
```

### Phase 2: Core 대화형 (2주)
```
LLM 연동으로 "대화하는 공장장" 구현

7. [ ] Claude API 연동 (Anthropic SDK)
8. [ ] RAG: 설비 매뉴얼 + 센서 데이터 → 컨텍스트
9. [ ] 대화 UI: 키오스크 채팅 (실제 LLM 응답)
10. [ ] 자동 보고서: 일일 설비 점검 리포트 생성
11. [ ] 이상 감지 종합 판단 로직
```

### Phase 3: Ear MVP (2주)
```
오디오 분석으로 청각 AI 추가

12. [ ] 마이크 입력 → 스펙트로그램 변환
13. [ ] 정상 소리 학습 (Baseline 수집)
14. [ ] 이상음 감지 모델 (Isolation Forest)
15. [ ] 이상 감지 → 녹음 저장 + 알림
16. [ ] Core 통합: 청각 데이터 → 보고서 반영
```

### Phase 4: Eye MVP (2주)
```
비전 AI로 시각 감지 추가

17. [ ] 카메라 입력 → 프레임 추출
18. [ ] YOLOv8 커스텀 학습 (설비 이상 데이터셋)
19. [ ] 이상 감지 → 캡처 + 바운딩박스 + 저장
20. [ ] Core 통합: 시각 데이터 → 보고서 반영
21. [ ] 게이지 OCR (선택)
```

### Phase 5: 통합 + PoC (2주)
```
4개 Agent 통합 + 실제 현장 PoC

22. [ ] Edge Gateway 통합 (RPi)
23. [ ] 실제 센서 연동 ($1 스티커)
24. [ ] 현장 설치 + 데이터 수집
25. [ ] PoC 결과 리포트
26. [ ] 고객 피드백 → 개선
```

---

## 6. 비용 추정

### MVP 구축 (고객당)

| 항목 | 비용 |
|------|------|
| IoT 스티커 x 10 | $10 |
| Edge Gateway (RPi 5) | $80 |
| USB 카메라 | $30 |
| USB 마이크 | $20 |
| 키오스크 태블릿 | $200 |
| **하드웨어 합계** | **~$340 (약 45만원)** |

### 운영 비용 (월)

| 항목 | 비용 |
|------|------|
| Supabase Pro | $25 |
| Claude API | ~$30 (일 100건 분석 기준) |
| AWS SES | ~$1 |
| Vercel | $0 (Hobby) |
| **월 합계** | **~$56 (약 7.5만원)** |

### 고객 가격 (제안)

| 플랜 | 월 요금 | 포함 |
|------|---------|------|
| PoC (8주) | 무료 | 센서 5개 + Touch + Core |
| Basic | 10만원/월 | Touch + Core |
| Standard | 20만원/월 | Touch + Ear + Core |
| Premium | 30만원/월 | Touch + Ear + Eye + Core |

---

## 7. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 실제 센서 확보 지연 | MVP 불가 | 시뮬레이터로 먼저 개발 → 나중에 교체 |
| Edge 하드웨어 성능 | 추론 지연 | ONNX 최적화 + 모델 경량화 |
| LLM 비용 과다 | 운영비 초과 | 캐싱 + 로컬 LLM (Llama) 검토 |
| 현장 WiFi 불안정 | 데이터 유실 | Edge 로컬 버퍼 + 재전송 |
| 이상 감지 오탐 | 신뢰도 하락 | Baseline 충분히 수집 + 임계치 조정 기간 |
| 고객 IT 인프라 부재 | 설치 어려움 | 올인원 패키지 (RPi + LTE 모뎀) |

---

## 8. 성공 기준

| 지표 | MVP 목표 |
|------|---------|
| Touch 센서 데이터 수집 | 실시간 수신 + 차트 표시 |
| 임계치 알림 | 초과 시 30초 내 알림 |
| Core 대화 | "오늘 현황" 질문에 정확한 답변 |
| 자동 보고서 | 일일 리포트 자동 생성 |
| Ear 이상음 감지 | 정밀도 80% 이상 |
| Eye 이상 감지 | 정밀도 70% 이상 |
| PoC 만족도 | 5점 중 4점 이상 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-09 | Initial architecture draft | JOYTEC |
