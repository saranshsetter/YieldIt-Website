"use client";

import { useEffect, useRef } from "react";
import { Search, TrendingUp, MessageSquare, Star, BarChart2, Zap } from "lucide-react";

const services = [
  {
    icon: TrendingUp,
    title: "Google Ads Management",
    description:
      "We build and manage high-converting PPC campaigns targeting homeowners searching for HVAC services in your zip codes — right when they need you most.",
  },
  {
    icon: Search,
    title: "Local SEO Domination",
    description:
      'Rank in the Google Map Pack and organic results for high-intent searches like "AC repair near me." We handle citations, on-page, and Google Business Profile.',
  },
  {
    icon: MessageSquare,
    title: "AI Follow-Up System",
    description:
      "Miss a call? Our AI texts the lead back within 60 seconds, qualifies them, and books the appointment — even at 2am. No lead left behind.",
  },
  {
    icon: Star,
    title: "Reputation Management",
    description:
      "Automate review requests after every job. Respond to reviews with AI. Build the 5-star presence that makes homeowners choose you over the competition.",
  },
  {
    icon: BarChart2,
    title: "Performance Reporting",
    description:
      "Clear, weekly reports that show exactly where every dollar went and what it returned. No fluff — just cost per lead, booked jobs, and revenue attributed.",
  },
  {
    icon: Zap,
    title: "Website Optimization",
    description:
      "We convert your existing site into a lead machine — optimized landing pages, fast load times, and trust signals that turn visitors into phone calls.",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const items = el.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((item, i) => {
      (item as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
            <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
              What we do
            </span>
          </div>
          <h2 className="animate-on-scroll font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
            Everything your HVAC business
            <br />
            needs to <span className="italic text-[#1D9E75]">dominate locally</span>
          </h2>
          <p className="animate-on-scroll text-[#6B7280] text-lg max-w-xl mx-auto">
            We handle the full marketing stack — so you can focus on the work, not the pipeline.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="animate-on-scroll group p-7 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#1D9E75]/40 hover:shadow-lg hover:shadow-[#1D9E75]/5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-5 group-hover:bg-[#1D9E75] transition-colors duration-300">
                  <Icon
                    size={20}
                    className="text-[#1D9E75] group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <h3 className="font-semibold text-[#111827] text-lg mb-2">
                  {service.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
