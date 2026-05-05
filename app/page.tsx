import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import Features from "@/components/ui/Features";
import Testimonials from "@/components/ui/Testimonials";
import Footer from "@/components/ui/Footer";
import CTA from "@/components/ui/CTA";
import Contacts from "@/components/ui/Contacts";

export default function Home() {
  return (
    <main className="bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Contacts />
      <CTA />
      <Footer />
    </main>
  );
}