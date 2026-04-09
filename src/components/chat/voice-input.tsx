"use client";

import { useRef, useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setConnecting(true);
      setTranscript("");

      // 1. 리턴제로 토큰 가져오기
      const tokenRes = await fetch("/api/stt/token");
      const { access_token } = await tokenRes.json();
      if (!access_token) throw new Error("No token");

      // 2. 마이크 권한
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // 3. WebSocket 연결
      const wsUrl = `wss://openapi.vito.ai/v1/transcribe:streaming?sample_rate=16000&encoding=LINEAR16&use_itn=true&use_punctuation=true`;
      const ws = new WebSocket(wsUrl, ["bearer", access_token]);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnecting(false);
        setRecording(true);

        // 4. AudioContext로 PCM 데이터 추출
        const audioContext = new AudioContext({ sampleRate: 16000 });
        contextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32 = e.inputBuffer.getChannelData(0);
          // Float32 → Int16 PCM
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
          }
          ws.send(int16.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.alternatives && data.alternatives.length > 0) {
            const text = data.alternatives[0].text;
            if (data.final) {
              setTranscript((prev) => {
                const updated = prev + (prev ? " " : "") + text;
                return updated;
              });
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        setConnecting(false);
        setRecording(false);
      };

      ws.onclose = () => {
        setRecording(false);
      };
    } catch (err) {
      console.error("Voice input error:", err);
      setConnecting(false);
      setRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    // 오디오 정리
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close();
      contextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // WebSocket EOS 전송 후 닫기
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("EOS");
      // 잠시 후 닫기 (마지막 결과 수신 대기)
      setTimeout(() => {
        wsRef.current?.close();
        wsRef.current = null;
      }, 1000);
    }

    setRecording(false);

    // transcript 전달
    setTimeout(() => {
      setTranscript((prev) => {
        if (prev.trim()) onTranscript(prev.trim());
        return "";
      });
    }, 1200);
  }, [onTranscript]);

  return (
    <div className="flex items-center gap-2">
      {/* 인식 중 텍스트 표시 */}
      {(recording || transcript) && (
        <div className="flex-1 rounded-lg border border-[var(--corebot-core)]/30 bg-[var(--corebot-core)]/5 px-3 py-2 text-xs text-[var(--foreground)]">
          {transcript || (
            <span className="text-[var(--muted)] animate-pulse">듣고 있습니다...</span>
          )}
        </div>
      )}

      {/* 마이크 버튼 */}
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled || connecting}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
          recording
            ? "bg-[var(--danger)] text-[var(--foreground)] animate-pulse"
            : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--corebot-core)] hover:text-[var(--corebot-core)]"
        } disabled:opacity-50`}
        title={recording ? "녹음 중지" : "음성 입력"}
      >
        {connecting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : recording ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
      </button>
    </div>
  );
}
