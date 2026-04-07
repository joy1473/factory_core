import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { ContactForm } from "@/components/public/contact-form";

export const metadata = {
  title: "문의하기 | Factory Core",
  description: "Factory Core 솔루션에 대해 궁금한 점을 문의해주세요.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-20">
        <ContactForm type="general" title="문의하기" />
      </main>
      <Footer />
    </>
  );
}
