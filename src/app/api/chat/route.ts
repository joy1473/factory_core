import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { buildContext, SYSTEM_PROMPT } from "@/lib/core-agent";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { message, conversation_id } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: "메시지가 필요합니다" }), { status: 400 });
  }

  // 대화 생성/조회
  let convId = conversation_id;
  if (!convId) {
    const { data } = await supabase
      .from("chat_conversations")
      .insert({ title: message.substring(0, 50) })
      .select("id")
      .single();
    convId = data?.id;
  }

  // 이전 대화 이력 (최근 10개)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(10);

  // 센서 데이터 컨텍스트
  const context = await buildContext();

  // 메시지 조립
  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...(history || []).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  // 유저 메시지 저장
  await supabase.from("chat_messages").insert({
    conversation_id: convId,
    role: "user",
    content: message,
  });

  // Claude API 스트리밍
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: `${SYSTEM_PROMPT}\n\n---\n\n${context}`,
    messages,
  });

  // SSE 스트리밍 응답
  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        stream.on("text", (text) => {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`)
          );
        });

        const finalMessage = await stream.finalMessage();

        // AI 응답 저장
        await supabase.from("chat_messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: fullResponse,
          tokens_used: {
            input: finalMessage.usage.input_tokens,
            output: finalMessage.usage.output_tokens,
          },
        });

        // 대화 제목 업데이트
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              conversation_id: convId,
              usage: {
                input_tokens: finalMessage.usage.input_tokens,
                output_tokens: finalMessage.usage.output_tokens,
              },
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "AI 응답 생성 중 오류가 발생했습니다" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
