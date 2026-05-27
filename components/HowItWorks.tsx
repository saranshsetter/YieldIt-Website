"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Free Marketing Audit",
    description:
      "We analyze your current online presence — Google rankings, ad spend efficiency, review profile, and competitor gaps — and show you exactly where you're losing money.",
    detail: "Takes 48 hours. No fluff.",
  },
  {
    number: "02",
    title: "Custom Growth Strategy",
    description:
      "We build a tailored plan for your market, service area, and budget. You'll know exactly which channels we'll attack first and what results to expect by month 3.",
    detail: "Market-specific, not cookie-cutter.",
  },
  {
    number: "03",
    title: "Launch & Optimize",
    description:
      "Our team handles setup, copywriting, campaign build-out, and technical SEO. We're live within 7 business days. AI systems start running follow-up from day one.",
    detail: "Live in 7 days or less.",
  },
  {
    number: "04",
    title: "Grow & Scale",
    description:
      "You watch the inbound calls climb. We send weekly performance reports, adjust spend as seasons shift, and compound results month over month as your authority grows.",
    detail: "Compound growth, not vanity metrics.",
  },
];

export default function HowItWorks() {
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
      (item as HTMLElement).style.transitionDelay = `${i * 120}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-6 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
            <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
              The process
            </span>
          </div>
          <h2 className="animate-on-scroll font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
            Simple to start.
            <br />
            <span className="italic text-[#1D9E75]">Built to compound.</span>
          </h2>
          <p className="animate-on-scroll text-[#6B7280] text-lg max-w-lg mx-auto">
            From audit to first lead in under two weeks. Here&apos;s exactly how we do it.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="animate-on-scroll relative p-8 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#1D9E75]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#1D9E75]/5 group"
            >
              {/* Step number */}
              <div className="font-serif text-6xl font-normal text-[#E1F5EE] group-hover:text-[#1D9E75]/15 transition-colors leading-none mb-4 select-none">
                {step.number}
              </div>
              <h3 className="font-semibold text-[#111827] text-xl mb-3">{step.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                {step.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E1F5EE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                <span className="text-xs font-semibold text-[#085041]">{step.detail}</span>
              </div>

              {/* Connector line for desktop */}
              {i === 0 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-px bg-[#E5E7EB]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
