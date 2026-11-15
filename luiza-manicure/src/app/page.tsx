import { BookingSteps } from "@/components/BookingSteps";
import { Differentials } from "@/components/Differentials";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HomeService } from "@/components/HomeService";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Services />
        <HomeService />
        <PortfolioGallery />
        <Differentials />
        <BookingSteps />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
