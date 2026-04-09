import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || "",
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@joy.it.kr";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "joytec@naver.com";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://joy.it.kr";

interface AlertEmailParams {
  deviceName: string;
  sensorType: string;
  value: number;
  threshold: number;
  unit: string;
  severity: "warning" | "critical";
  message: string;
}

const SENSOR_LABELS: Record<string, string> = {
  temperature: "온도",
  vibration: "진동",
  humidity: "습도",
};

export async function sendAlertEmail(params: AlertEmailParams): Promise<boolean> {
  if (!process.env.AWS_SES_ACCESS_KEY) {
    console.log(`[ALERT EMAIL SKIP] No SES key — ${params.message}`);
    return false;
  }

  const { deviceName, sensorType, value, threshold, unit, severity, message } = params;
  const sensorLabel = SENSOR_LABELS[sensorType] || sensorType;
  const isCritical = severity === "critical";
  const severityLabel = isCritical ? "위험 (Critical)" : "주의 (Warning)";
  const severityColor = isCritical ? "#c45c5c" : "#d4944a";
  const time = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  const subject = `[Factory Core] ${isCritical ? "🔴" : "⚠️"} ${deviceName} ${sensorLabel} 이상 감지 (${value}${unit})`;

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDF6EC;font-family:-apple-system,'Pretendard',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="text-align:center;padding:20px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg,#A8E6CF,#5aaa8a);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:900;font-size:14px;">FC</div>
      <p style="margin:8px 0 0;color:#5aaa8a;font-weight:bold;">Factory Core Alert</p>
    </div>

    <div style="background:#FFF8F0;border-radius:12px;padding:28px;border:2px solid ${severityColor}40;">
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:32px;">${isCritical ? "🔴" : "⚠️"}</span>
        <h2 style="margin:8px 0;color:${severityColor};font-size:18px;">${severityLabel}</h2>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3a3226;">
        <tr><td style="padding:8px 0;color:#8a7d6f;">설비</td><td style="padding:8px 0;font-weight:bold;">${deviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#8a7d6f;">센서</td><td style="padding:8px 0;font-weight:bold;">${sensorLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#8a7d6f;">현재값</td><td style="padding:8px 0;font-weight:bold;color:${severityColor};">${value}${unit}</td></tr>
        <tr><td style="padding:8px 0;color:#8a7d6f;">기준값</td><td style="padding:8px 0;">${threshold}${unit}</td></tr>
        <tr><td style="padding:8px 0;color:#8a7d6f;">시간</td><td style="padding:8px 0;">${time}</td></tr>
      </table>

      <div style="margin-top:16px;padding:12px;background:${severityColor}10;border-radius:8px;font-size:13px;color:#3a3226;">
        ${message}
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="${BASE_URL}/admin/monitoring" style="display:inline-block;background:#5aaa8a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
          모니터링 대시보드 확인
        </a>
      </div>
    </div>

    <div style="text-align:center;padding:16px 0;color:#8a7d6f;font-size:11px;">
      <p>Factory Core · joy.it.kr · 자동 발송된 알림입니다</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: `${severityLabel}\n\n${message}\n\n설비: ${deviceName}\n${sensorLabel}: ${value}${unit} (기준: ${threshold}${unit})\n시간: ${time}\n\n대시보드: ${BASE_URL}/admin/monitoring`, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    }));
    return true;
  } catch (err) {
    console.error("[ALERT EMAIL ERROR]", err);
    return false;
  }
}
