import { NextResponse } from "next/server";

// 토큰 캐시 (6시간 유효)
let cachedToken: { token: string; expireAt: number } | null = null;

export async function GET() {
  // 캐시된 토큰이 유효하면 재사용
  if (cachedToken && Date.now() / 1000 < cachedToken.expireAt - 300) {
    return NextResponse.json({ access_token: cachedToken.token });
  }

  const clientId = process.env.RTZR_CLIENT_ID;
  const clientSecret = process.env.RTZR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "RTZR credentials not configured" }, { status: 500 });
  }

  const res = await fetch("https://openapi.vito.ai/v1/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expireAt: data.expire_at };

  return NextResponse.json({ access_token: data.access_token });
}
