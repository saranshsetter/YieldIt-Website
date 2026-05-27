import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import MissCallCallout from "@/components/MissCallCallout";
import Pricing from "@/components/Pricing";
import AuditForm from "@/components/AuditForm";
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
        <AuditForm />
      </main>
      <Footer />
    </>
  );
}
