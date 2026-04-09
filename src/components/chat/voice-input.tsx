"use client";

import { useRef, useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Int16Array[]>([]);

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];

      // 마이크 권한
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // AudioContext로 PCM 16kHz 추출
      const audioContext = new AudioContext({ sampleRate: 16000 });
      contextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
        }
        chunksRef.current.push(int16);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setRecording(false);

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

    // PCM 데이터 합치기
    const chunks = chunksRef.current;
    if (chunks.length === 0) return;

    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    chunksRef.current = [];

    // 서버 프록시로 전송
    setProcessing(true);
    try {
      const res = await fetch("/api/stt/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: merged.buffer,
      });
      const data = await res.json();
      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      }
    } catch (err) {
      console.error("STT proxy error:", err);
    } finally {
      setProcessing(false);
    }
  }, [onTranscript]);

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || processing}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
        recording
          ? "bg-[var(--danger)] text-[var(--foreground)] animate-pulse"
          : processing
          ? "border border-[var(--corebot-core)] text-[var(--corebot-core)]"
          : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--corebot-core)] hover:text-[var(--corebot-core)]"
      } disabled:opacity-50`}
      title={recording ? "녹음 중지 → 인식" : processing ? "인식 중..." : "음성 입력"}
    >
      {processing ? (
        <Loader2 size={18} className="animate-spin" />
      ) : recording ? (
        <MicOff size={18} />
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}
