import Navbar from '@/components/landing/Navbar';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
