import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import StatsBar from '@/components/landing/StatsBar';
import HowItWorks from '@/components/landing/HowItWorks';
import ThreatCoverage from '@/components/landing/ThreatCoverage';
import CodeIntegration from '@/components/landing/CodeIntegration';
import PricingSection from '@/components/landing/PricingSection';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <ThreatCoverage />
        <CodeIntegration />
        <PricingSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
