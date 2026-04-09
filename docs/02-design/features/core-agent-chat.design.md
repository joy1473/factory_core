# Core Agent Chat — Design Document

> **Plan 참조**: `docs/01-plan/features/factory-guardian-agent.plan.md` (Phase 2)
> **Date**: 2026-04-09
> **Status**: Draft
> **Scope**: Claude API 연동 + 센서 데이터 RAG + 대화형 키오스크 UI + 자동 보고서

---

## 1. 목표

센서 데이터를 컨텍스트로 Claude API에 전달하여 **자연어 대화로 공장 현황을 파악**하고, **자동 보고서를 생성**하는 Core Agent 구현.

```
사용자: "오늘 생산 현황 알려줘"
  ↓
Core Agent: 센서 DB 조회 → Claude API (system prompt + 데이터 컨텍스트)
  ↓
응답: "CNC-1,2 정상 가동 중. 사출기 온도 215°C로 주의 필요. 상세 보고서를 생성할까요?"
```

---

## 2. 아키텍처

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 키오스크/웹  │────▶│ /api/chat        │────▶│ Claude API      │
│ 채팅 UI      │◀────│ (Next.js Route)  │◀────│ (Streaming)     │
└─────────────┘     └────────┬─────────┘     └─────────────────┘
                             │
                    ┌────────┴─────────┐
                    │ Context Builder   │
                    │ (센서 데이터 수집) │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        sensor_readings   alerts       devices
        (최근 데이터)    (활성 알림)   (설비 정보)
```

---

## 3. API 설계

### 3.1 POST /api/chat

```typescript
// Request
{
  message: string;         // 사용자 입력
  conversation_id?: string; // 대화 이어가기 (선택)
}

// Response: Server-Sent Events (SSE) 스트리밍
data: {"type":"text","content":"CNC-1 정상 가동 중입니다."}
data: {"type":"text","content":" 사출기는 온도가..."}
data: {"type":"done","usage":{"input_tokens":1200,"output_tokens":350}}
```

### 3.2 Context Builder (센서 → LLM 컨텍스트)

```typescript
async function buildContext(): Promise<string> {
  // 1. 전체 설비 상태
  const devices = await getDevicesWithLatestReadings();
  
  // 2. 최근 알림 (활성)
  const alerts = await getActiveAlerts();
  
  // 3. 최근 1시간 센서 추이 요약
  const trends = await getSensorTrends(60); // 60분
  
  return `
## 현재 공장 현황 (${new Date().toLocaleString("ko-KR")})

### 설비 상태
${devices.map(d => `- ${d.name} (${d.type}): ${d.sensors.map(s => `${s.type} ${s.value}${s.unit}`).join(", ")} [${d.status}]`).join("\n")}

### 활성 알림 (${alerts.length}건)
${alerts.map(a => `- [${a.severity}] ${a.message}`).join("\n") || "없음"}

### 최근 1시간 추이
${trends}
  `.trim();
}
```

### 3.3 System Prompt

```
당신은 Factory Guardian — 중소 제조기업의 AI 공장장입니다.

역할:
- 센서 데이터를 분석하여 설비 상태를 한국어로 보고
- 이상 감지 시 원인 추정 + 조치 권고
- 일일/주간 보고서 생성
- ISO 10816 (진동), ASHRAE (서버 온도) 등 산업 표준 기반 판단

규칙:
- 항상 한국어로 답변
- 수치는 정확하게, 단위 포함
- 심각한 이상은 즉시 강조 (⚠️ 또는 🔴)
- 보고서 요청 시 구조화된 마크다운 형식
- 모르는 것은 모른다고 솔직히 답변
```

---

## 4. DB 설계

### 4.1 chat_conversations (대화 이력)

```sql
CREATE TABLE chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 chat_messages (메시지 이력)

```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_messages_conv ON chat_messages(conversation_id, created_at);
```

### 4.3 reports (자동 보고서)

```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data_snapshot JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. 대화 UI 설계

### 5.1 Admin 채팅 페이지 (/admin/chat)

```
┌──────────────────────────────────────────┐
│ 🤖 Factory Guardian                      │
│ Core Agent — AI 공장장                    │
├──────────────────────────────────────────┤
│                                          │
│  👤 오늘 생산 현황 알려줘                │
│                                          │
│  🤖 현재 설비 상태를 보고드립니다.       │
│                                          │
│  ■ CNC-1: 온도 52°C, 진동 2.3mm/s ✅   │
│  ■ CNC-2: 온도 48°C, 진동 1.8mm/s ✅   │
│  ■ PRESS-1: 온도 55°C, 진동 3.1mm/s ✅ │
│  ■ INJ-1: 온도 215°C ⚠️, 진동 4.2mm/s │
│                                          │
│  사출기(INJ-1)의 온도가 기준치(220°C)의  │
│  97%에 도달했습니다. 주의가 필요합니다.   │
│                                          │
│  👤 보고서 만들어줘                      │
│                                          │
│  🤖 일일 설비 점검 보고서를 생성합니다...│
│  ████████████░░░░░ (생성 중)             │
│                                          │
├──────────────────────────────────────────┤
│ [빠른 질문: 현황 | 알림 | 보고서 | 추세]│
├──────────────────────────────────────────┤
│ 💬 메시지를 입력하세요...          [전송]│
└──────────────────────────────────────────┘
```

### 5.2 빠른 질문 프리셋

```typescript
const QUICK_PROMPTS = [
  { label: "현황", prompt: "현재 전체 설비 상태를 요약해줘" },
  { label: "알림", prompt: "활성화된 알림을 모두 보여줘" },
  { label: "보고서", prompt: "일일 설비 점검 보고서를 생성해줘" },
  { label: "추세", prompt: "최근 1시간 센서 데이터 추세를 분석해줘" },
  { label: "예측", prompt: "현재 데이터 기반으로 향후 이상 가능성을 예측해줘" },
];
```

---

## 6. 파일 구조

### 신규 파일

| File | Purpose |
|------|---------|
| `supabase/migrations/20260410000002_core_agent.sql` | chat_conversations, chat_messages, reports |
| `src/app/api/chat/route.ts` | Claude API 스트리밍 채팅 |
| `src/lib/core-agent.ts` | context builder + system prompt |
| `src/app/admin/chat/page.tsx` | 대화형 채팅 UI |
| `src/components/chat/chat-message.tsx` | 메시지 버블 컴포넌트 |
| `src/components/chat/quick-prompts.tsx` | 빠른 질문 버튼 |

### 수정 파일

| File | Changes |
|------|---------|
| `src/components/admin/sidebar.tsx` | "AI 공장장" 메뉴 추가 |
| `package.json` | @anthropic-ai/sdk 추가 |
| `.env.local` | ANTHROPIC_API_KEY 추가 |

---

## 7. 구현 순서

```
Step 1: DB + SDK 설치 (20분)
━━━━━━━━━━━━━━━━━━━━━━━━━
1. [ ] migration (chat_conversations, chat_messages, reports)
2. [ ] npm install @anthropic-ai/sdk
3. [ ] .env.local에 ANTHROPIC_API_KEY 추가

Step 2: Core Agent 로직 (40분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. [ ] lib/core-agent.ts — buildContext() + SYSTEM_PROMPT
5. [ ] /api/chat/route.ts — Claude API 스트리밍 + 컨텍스트 주입

Step 3: 채팅 UI (1시간)
━━━━━━━━━━━━━━━━━━━━━━
6. [ ] chat-message.tsx — 유저/AI 메시지 버블 (마크다운 렌더링)
7. [ ] quick-prompts.tsx — 빠른 질문 버튼
8. [ ] /admin/chat/page.tsx — 채팅 페이지 (스트리밍 표시)

Step 4: 마무리 (20분)
━━━━━━━━━━━━━━━━━━━━
9. [ ] sidebar 메뉴 추가
10. [ ] 대화 이력 저장 (conversation_id)
11. [ ] 빌드 + 테스트
```

---

## 8. 비용 추정

| 항목 | 단가 | 일일 사용량 | 월 비용 |
|------|------|:----------:|:-------:|
| Claude Sonnet Input | $3/MTok | ~50K tok | ~$4.5 |
| Claude Sonnet Output | $15/MTok | ~20K tok | ~$9 |
| **합계** | | | **~$13.5/월** |

(일일 100회 대화 기준, 실제 PoC는 훨씬 적음)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-09 | Initial design | JOYTEC |
