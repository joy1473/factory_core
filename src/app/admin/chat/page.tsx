"use client";

import { useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { QuickPrompts } from "@/components/chat/quick-prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreaming(true);
    scrollToBottom();

    // AI 응답 placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          conversation_id: conversationId,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "text") {
              fullContent += event.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent };
                return updated;
              });
              scrollToBottom();
            }

            if (event.type === "done") {
              setConversationId(event.conversation_id);
            }

            if (event.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: event.message };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "네트워크 오류가 발생했습니다. 다시 시도해주세요." };
        return updated;
      });
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <video
          src="/video/Core.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h1 className="text-sm font-bold text-[var(--foreground)]">Factory Guardian</h1>
          <p className="text-[10px] text-[var(--corebot-core)]">Core Agent — AI 공장장</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <video
              src="/video/Core.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">안녕하세요, Core입니다</h2>
              <p className="mt-1 text-sm text-gray-500">공장 현황, 설비 상태, 보고서 생성 등 무엇이든 물어보세요</p>
            </div>
            <QuickPrompts onSelect={sendMessage} disabled={loading} />
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
      </div>

      {/* Quick prompts (대화 중) */}
      {messages.length > 0 && (
        <div className="border-t border-[var(--border)] px-5 py-2">
          <QuickPrompts onSelect={sendMessage} disabled={loading} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--corebot-core)] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--corebot-core)] text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
