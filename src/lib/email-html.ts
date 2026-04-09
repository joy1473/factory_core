const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://joy.it.kr";

interface EmailHtmlOptions {
  subject: string;
  body: string;
  historyId: string;
  trackingToken: string;
  templateId?: string;
  hasSurvey?: boolean;
}

export function buildEmailHtml(options: EmailHtmlOptions): string {
  const { body, historyId, trackingToken, templateId, hasSurvey } = options;

  const trackPixelUrl = `${BASE_URL}/api/track/open?hid=${historyId}&t=${trackingToken}`;

  let surveyButton = "";
  if (hasSurvey && templateId) {
    const surveyUrl = `${BASE_URL}/api/track/click?hid=${historyId}&t=${trackingToken}&to=/survey/${templateId}?token=${trackingToken}`;
    surveyButton = `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${surveyUrl}" style="display: inline-block; background: #5aaa8a; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
          설문 참여하기
        </a>
        <p style="color: #8a7d6f; font-size: 11px; margin-top: 8px;">클릭하시면 설문 페이지로 이동합니다</p>
      </div>
    `;
  }

  const bodyHtml = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF6EC; font-family: -apple-system, 'Pretendard', 'Malgun Gothic', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="text-align: center; padding: 24px 0 16px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #A8E6CF, #5aaa8a); width: 40px; height: 40px; border-radius: 10px; line-height: 40px; color: #fff; font-weight: 900; font-size: 14px;">FC</div>
      <p style="margin: 8px 0 0; color: #5aaa8a; font-weight: bold; font-size: 16px;">Factory Core</p>
    </div>

    <!-- Content Card -->
    <div style="background: #FFF8F0; border-radius: 12px; padding: 32px; border: 1px solid #e8ddd0;">
      <div style="color: #3a3226; font-size: 14px; line-height: 1.8;">
        ${bodyHtml}
      </div>

      ${surveyButton}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 0; color: #8a7d6f; font-size: 11px; line-height: 1.6;">
      <p style="margin: 0;">조이텍 (JOYTEC) | 서울특별시 강서구 양천로49길 39-59, 203호</p>
      <p style="margin: 4px 0 0;">
        <a href="https://joy.it.kr" style="color: #5aaa8a; text-decoration: none;">joy.it.kr</a>
        &nbsp;·&nbsp;
        <a href="mailto:joytec@naver.com" style="color: #5aaa8a; text-decoration: none;">joytec@naver.com</a>
      </p>
    </div>
  </div>

  <!-- Tracking Pixel -->
  <img src="${trackPixelUrl}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>
  `.trim();
}
