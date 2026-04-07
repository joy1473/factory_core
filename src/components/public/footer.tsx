import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[10px] font-black text-black">
                FC
              </div>
              <span className="text-base font-bold text-[var(--primary)]">
                Factory Core
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              중소 제조기업을 위한
              <br />
              Agentic AI 설비관리 솔루션
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-3 font-semibold text-gray-300">솔루션</p>
              <div className="flex flex-col gap-2 text-gray-500">
                <Link href="/solution" className="hover:text-[var(--primary)]">
                  Factory Guardian Agent
                </Link>
                <Link href="/poc" className="hover:text-[var(--primary)]">
                  PoC 신청
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gray-300">지원</p>
              <div className="flex flex-col gap-2 text-gray-500">
                <Link href="/contact" className="hover:text-[var(--primary)]">
                  문의하기
                </Link>
                <Link href="/privacy" className="hover:text-[var(--primary)]">
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-sm text-gray-500">
            <p className="mb-3 font-semibold text-gray-300">회사 정보</p>
            <p>조이텍 (JOYTEC)</p>
            <p>사업자등록번호: 110-11-23776</p>
            <p className="mt-2">서울특별시 강서구</p>
            <p>이메일: joytec@naver.com</p>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Factory Core by JOYTEC. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
