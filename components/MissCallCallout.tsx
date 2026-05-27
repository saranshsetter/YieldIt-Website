"use client";

import { useEffect, useRef } from "react";
import { PhoneMissed, Clock, ArrowRight } from "lucide-react";

export default function MissCallCallout() {
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
      { threshold: 0.15 }
    );
    items.forEach((item, i) => {
      (item as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-[#0F1A15] overflow-hidden relative">
      {/* Decorative glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(29,158,117,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Top stat */}
        <div className="animate-on-scroll text-center mb-14">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/10 mb-8">
            <PhoneMissed size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">
              The silent revenue killer
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
            HVAC businesses miss
            <br />
            <span className="text-[#1D9E75] italic">35% of inbound calls.</span>
          </h2>

          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
            At an average job value of $2,400 — every 10 missed calls is $8,400 in lost
            revenue. That&apos;s not a marketing problem. That&apos;s a follow-up problem.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            {
              icon: PhoneMissed,
              stat: "35%",
              label: "of calls go unanswered",
              sub: "Industry average for HVAC companies without after-hours coverage",
            },
            {
              icon: Clock,
              stat: "< 60s",
              label: "AI text-back response time",
              sub: "YieldIt's follow-up system engages every missed lead within 60 seconds",
            },
            {
              icon: ArrowRight,
              stat: "3×",
              label: "more likely to convert",
              sub: "Leads contacted in under 1 minute are 3× more likely to book a job",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.stat}
                className="animate-on-scroll p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#1D9E75]" />
                </div>
                <div className="font-serif text-4xl text-white mb-1">{card.stat}</div>
                <div className="text-sm font-semibold text-[#E5E7EB] mb-2">
                  {card.label}
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="animate-on-scroll text-center">
          <p className="text-[#9CA3AF] text-base mb-6">
            YieldIt&apos;s AI follow-up system works 24/7 — even on Christmas Eve.
          </p>
          <a
            href="#audit"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#audit")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#1D9E75] text-white font-semibold text-base transition-all duration-200 hover:bg-[#085041] hover:scale-[1.02]"
          >
            Stop losing leads now
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
