import { Header } from "@/components/public/header";
import { HeroSection } from "@/components/public/hero-section";
import { StatsSection } from "@/components/public/stats-section";
import { SolutionOverview } from "@/components/public/solution-overview";
import { CtaSection } from "@/components/public/cta-section";
import { Footer } from "@/components/public/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <SolutionOverview />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
