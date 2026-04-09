import { NextRequest, NextResponse } from "next/server";
import { WebSocket } from "ws";

// RTZR 토큰 캐시
let cachedToken: { token: string; expireAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() / 1000 < cachedToken.expireAt - 300) {
    return cachedToken.token;
  }

  const res = await fetch("https://openapi.vito.ai/v1/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: `client_id=${process.env.RTZR_CLIENT_ID}&client_secret=${process.env.RTZR_CLIENT_SECRET}`,
  });

  const data = await res.json();
  cachedToken = { token: data.access_token, expireAt: data.expire_at };
  return data.access_token;
}

/**
 * 녹음된 오디오 청크를 받아 RTZR WebSocket으로 전송하고 결과 반환
 * 브라우저 → POST (audio blob) → 서버 WebSocket → RTZR → 텍스트
 */
export async function POST(request: NextRequest) {
  const token = await getToken();

  // 오디오 데이터 수신
  const audioBuffer = await request.arrayBuffer();

  if (audioBuffer.byteLength === 0) {
    return NextResponse.json({ error: "No audio data" }, { status: 400 });
  }

  // RTZR WebSocket 연결 + 전송 + 결과 수신
  return new Promise<Response>((resolve) => {
    const wsUrl = "wss://openapi.vito.ai/v1/transcribe:streaming?sample_rate=16000&encoding=LINEAR16&use_itn=true&use_punctuation=true";

    const ws = new WebSocket(wsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let fullText = "";
    const timeout = setTimeout(() => {
      ws.close();
      resolve(NextResponse.json({ text: fullText || "" }));
    }, 15000);

    ws.on("open", () => {
      // 오디오 데이터 전송 (4096바이트 청크)
      const data = Buffer.from(audioBuffer);
      const chunkSize = 4096;
      for (let i = 0; i < data.length; i += chunkSize) {
        ws.send(data.subarray(i, i + chunkSize));
      }
      // EOS 전송
      ws.send("EOS");
    });

    ws.on("message", (msg: Buffer) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.alternatives && data.alternatives.length > 0 && data.final) {
          fullText += (fullText ? " " : "") + data.alternatives[0].text;
        }
      } catch {}
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      resolve(NextResponse.json({ text: fullText }));
    });

    ws.on("error", () => {
      clearTimeout(timeout);
      resolve(NextResponse.json({ text: fullText || "", error: "STT connection failed" }));
    });
  });
}
