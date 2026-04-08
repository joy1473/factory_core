"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PainPointSection } from "@/components/solution/sections/pain-point-section";
import { BeforeAfterSection } from "@/components/solution/sections/before-after-section";
import { ComparisonSection } from "@/components/solution/sections/comparison-section";
import { PricingSection } from "@/components/solution/sections/pricing-section";
import { FaqSection } from "@/components/solution/sections/faq-section";
import { CtaSection } from "@/components/public/cta-section";

const FactoryScene = dynamic(
  () =>
    import("@/components/solution/scene/factory-scene").then(
      (m) => m.FactoryScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00ff41] border-t-transparent" />
          <p className="text-sm text-gray-500">3D 씬 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function SolutionPage() {
  return (
    <>
      {/* Header — fixed above everything */}
      <div className="fixed left-0 right-0 top-0 z-50">
        <Header />
      </div>

      {/* 3D Interactive Scene (scroll-driven) */}
      <FactoryScene />

      {/* Fade transition from 3D to DOM */}
      <div className="relative z-20">
        <div className="h-32 bg-gradient-to-b from-transparent to-[#050508]" />
        <PainPointSection />
        <BeforeAfterSection />
        <ComparisonSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}
