"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Star } from "lucide-react";

const stats = [
  { value: 47, suffix: "%", label: "Average increase in inbound calls" },
  { value: 2.1, suffix: "M+", label: "Revenue attributed to clients", prefix: "$" },
  { value: 300, suffix: "+", label: "HVAC businesses served" },
];

function CountUp({ target, suffix, prefix = "" }: { target: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Number(current.toFixed(target < 10 ? 1 : 0)));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const display = target < 10 ? count.toFixed(1) : Math.round(count);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

export default function Hero() {
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
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden bg-white"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #E1F5EE 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
            AI-Powered HVAC Marketing
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-on-scroll font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-[#111827] mb-6">
          Your competitors are
          <br />
          <span className="italic text-[#1D9E75]">already online.</span>
          <br />
          Are you winning?
        </h1>

        {/* Subtext */}
        <p className="animate-on-scroll text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
          YieldIt runs your Google Ads, local SEO, and AI follow-up — built exclusively
          for HVAC contractors. More calls, more booked jobs, zero marketing headaches.
        </p>

        {/* CTAs */}
        <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#audit"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#audit")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#1D9E75] text-white font-semibold text-base transition-all duration-200 hover:bg-[#085041] hover:scale-[1.02] shadow-lg shadow-[#1D9E75]/25"
          >
            Get your free audit
            <ArrowRight size={18} />
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-[#E5E7EB] text-[#111827] font-semibold text-base transition-all duration-200 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          >
            See how it works
          </a>
        </div>

        {/* Trust row */}
        <div className="animate-on-scroll flex items-center justify-center gap-2 mb-16 text-sm text-[#6B7280]">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
            ))}
          </div>
          <span>Trusted by 300+ HVAC contractors across North America</span>
        </div>

        {/* Stats bar */}
        <div className="animate-on-scroll grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E7EB] rounded-2xl overflow-hidden border border-[#E5E7EB]">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white px-8 py-7 text-center">
              <p className="font-serif text-4xl font-normal text-[#111827] mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-sm text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
