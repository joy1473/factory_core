import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";

export const metadata = {
  title: "개인정보처리방침 | Factory Core",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="mb-8 text-2xl font-bold text-white">
          개인정보처리방침
        </h1>
        <div className="space-y-6 text-sm leading-relaxed text-gray-400">
          <section>
            <h2 className="mb-2 text-base font-semibold text-white">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              조이텍(이하 &quot;회사&quot;)은 Factory Core 서비스 운영을 위해
              다음과 같은 목적으로 개인정보를 수집·이용합니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>서비스 문의 및 PoC 신청 접수·처리</li>
              <li>설문조사 발송 및 응답 관리</li>
              <li>서비스 안내 및 마케팅 정보 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">
              2. 수집하는 개인정보 항목
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>필수: 담당자명, 문의 내용</li>
              <li>선택: 회사명, 연락처, 이메일</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              수집된 개인정보는 수집·이용 목적이 달성된 후 지체 없이
              파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간
              동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">
              5. 개인정보 보호책임자
            </h2>
            <p>회사: 조이텍 (JOYTEC)</p>
            <p>대표: 조은아</p>
            <p>사업자등록번호: 110-11-23776</p>
            <p>주소: 서울특별시 강서구 양천로49길 39-59, 203호</p>
            <p>이메일: joytec@naver.com</p>
            <p>전화: 010-2648-6726</p>
          </section>

          <p className="text-xs text-gray-600">
            본 개인정보처리방침은 2026년 4월 8일부터 적용됩니다.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
