"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { Calendar, Clock, CheckCircle } from "lucide-react";

const perks = [
  "Full audit of your Google rankings, ads & reviews",
  "A clear breakdown of where you're losing leads",
  "A custom growth plan for your service area",
  "No hard pitch — just honest recommendations",
];

export default function BookCall() {
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
      (item as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="audit" ref={sectionRef} className="py-24 px-6 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
              Free strategy call
            </span>
          </div>
          <h2 className="animate-on-scroll font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
            Book your free
            <br />
            <span className="italic text-[#1D9E75]">marketing audit call.</span>
          </h2>
          <p className="animate-on-scroll text-[#6B7280] text-lg max-w-xl mx-auto">
            30 minutes. No obligations. Walk away with a clear picture of where your
            business stands and exactly what it takes to grow.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left: perks */}
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll get card */}
            <div className="animate-on-scroll rounded-2xl border border-[#E5E7EB] bg-white p-7">
              <h3 className="font-semibold text-[#111827] text-base mb-5">
                What you&apos;ll get on this call:
              </h3>
              <ul className="flex flex-col gap-4">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <CheckCircle
                      size={17}
                      className="text-[#1D9E75] flex-shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-[#374151] leading-snug">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta info */}
            <div className="animate-on-scroll rounded-2xl border border-[#E5E7EB] bg-white p-7 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-[#374151]">
                <div className="w-9 h-9 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-[#085041]" />
                </div>
                <span>
                  <span className="font-semibold text-[#111827]">30 minutes</span> — fits in your lunch break
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#374151]">
                <div className="w-9 h-9 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-[#085041]" />
                </div>
                <span>
                  <span className="font-semibold text-[#111827]">Pick any open slot</span> — mornings, afternoons, or evenings
                </span>
              </div>
            </div>
          </div>

          {/* Right: Calendly embed */}
          <div className="animate-on-scroll lg:col-span-3 rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
            {/* Calendly inline widget */}
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/nocturostheshade/30-minute-mock-clone?hide_event_type_details=1"
              style={{ minWidth: "320px", height: "700px" }}
            />
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="lazyOnload"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
