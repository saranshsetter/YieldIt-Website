"use client";

import { useEffect, useRef } from "react";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$997",
    period: "/month",
    tagline: "For contractors ready to get found online.",
    highlight: false,
    features: [
      "Google Business Profile optimization",
      "Local SEO for 1 service area",
      "Monthly performance report",
      "Review request automation",
      "On-page website optimization",
      "Dedicated account manager",
    ],
    cta: "Start with Starter",
  },
  {
    name: "Growth",
    price: "$1,997",
    period: "/month",
    tagline: "For businesses that want to own their market.",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "Google Ads management (up to $5k/mo ad spend)",
      "Local SEO for up to 3 service areas",
      "AI missed-call follow-up system",
      "Weekly performance reporting",
      "Landing page builds & optimization",
      "Competitor tracking dashboard",
    ],
    cta: "Start with Growth",
  },
  {
    name: "Scale",
    price: "$3,497",
    period: "/month",
    tagline: "For multi-location or aggressive growth targets.",
    highlight: false,
    features: [
      "Everything in Growth",
      "Unlimited service areas",
      "Google Ads (no spend cap)",
      "Full reputation management",
      "AI voice & SMS follow-up sequences",
      "Custom reporting dashboard",
      "Bi-weekly strategy calls",
      "Priority support (4hr SLA)",
    ],
    cta: "Start with Scale",
  },
];

export default function Pricing() {
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
      { threshold: 0.05 }
    );
    items.forEach((item, i) => {
      (item as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
            <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
              Transparent pricing
            </span>
          </div>
          <h2 className="animate-on-scroll font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
            No hidden fees.
            <br />
            <span className="italic text-[#1D9E75]">Cancel anytime.</span>
          </h2>
          <p className="animate-on-scroll text-[#6B7280] text-lg max-w-lg mx-auto">
            Month-to-month contracts. Most clients see ROI within 60 days or we work
            for free until they do.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`animate-on-scroll relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? "bg-[#0F1A15] border-2 border-[#1D9E75] shadow-2xl shadow-[#1D9E75]/15 scale-[1.02]"
                  : "bg-white border border-[#E5E7EB] hover:border-[#1D9E75]/30 hover:shadow-lg hover:shadow-[#1D9E75]/5"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-[#1D9E75] text-white text-xs font-bold tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <h3
                  className={`font-semibold text-lg mb-1 ${
                    plan.highlight ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-5 ${
                    plan.highlight ? "text-[#9CA3AF]" : "text-[#6B7280]"
                  }`}
                >
                  {plan.tagline}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className={`font-serif text-5xl leading-none ${
                      plan.highlight ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm pb-1 ${
                      plan.highlight ? "text-[#9CA3AF]" : "text-[#6B7280]"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                className={`h-px mb-6 ${
                  plan.highlight ? "bg-white/10" : "bg-[#E5E7EB]"
                }`}
              />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlight ? "bg-[#1D9E75]/30" : "bg-[#E1F5EE]"
                      }`}
                    >
                      <Check
                        size={10}
                        className={plan.highlight ? "text-[#1D9E75]" : "text-[#085041]"}
                        strokeWidth={3}
                      />
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${
                        plan.highlight ? "text-[#D1D5DB]" : "text-[#374151]"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#audit"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#audit")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-[#1D9E75] text-white hover:bg-[#085041]"
                    : "border border-[#E5E7EB] text-[#111827] hover:border-[#1D9E75] hover:text-[#1D9E75]"
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="animate-on-scroll text-center text-sm text-[#6B7280] mt-10">
          All plans include onboarding, setup, and a dedicated account manager.
          Ad spend billed separately and passed through at cost — we don&apos;t mark it up.
        </p>
      </div>
    </section>
  );
}
