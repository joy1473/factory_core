"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--primary)] px-4 py-3 text-sm text-black">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--corebot-core)]/15">
        <video
          src="/video/Core.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-8 w-8 rounded-full object-cover"
        />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]">
        <div className="whitespace-pre-wrap leading-relaxed">
          {content.split("\n").map((line, i) => {
            // 볼드
            const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // 이모지 알림 강조
            if (line.includes("⚠️") || line.includes("🔴")) {
              return (
                <p key={i} className="my-1 rounded bg-[var(--danger)]/5 px-2 py-1 text-[var(--danger)]" dangerouslySetInnerHTML={{ __html: boldLine }} />
              );
            }
            // 헤더 (#, ##)
            if (line.startsWith("## ")) {
              return <p key={i} className="mt-3 mb-1 font-bold text-[var(--foreground)]">{line.replace("## ", "")}</p>;
            }
            if (line.startsWith("# ")) {
              return <p key={i} className="mt-3 mb-1 text-base font-bold text-[var(--foreground)]">{line.replace("# ", "")}</p>;
            }
            // 리스트
            if (line.startsWith("- ") || line.startsWith("■ ")) {
              return <p key={i} className="ml-2" dangerouslySetInnerHTML={{ __html: boldLine }} />;
            }
            // 빈 줄
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />;
          })}
        </div>
        {isStreaming && (
          <span className="inline-block h-4 w-1 animate-pulse bg-[var(--corebot-core)]" />
        )}
      </div>
    </div>
  );
}
