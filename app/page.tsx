import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import MissCallCallout from "@/components/MissCallCallout";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import BookCall from "@/components/BookCall";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <MissCallCallout />
        <Pricing />
        <Testimonials />
        <BookCall />
      </main>
      <Footer />
    </>
  );
}
