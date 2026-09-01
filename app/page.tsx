import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import StatsStrip from "@/components/ui/StatsStrip";
import Features from "@/components/ui/Features";
import ProductShowcase from "@/components/ui/ProductShowcase";
import Testimonials from "@/components/ui/Testimonials";
import Pricing from "@/components/ui/Pricing";
import FAQ from "@/components/ui/FAQ";
import CTA from "@/components/ui/CTA";
import Footer from "@/components/ui/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsStrip />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}