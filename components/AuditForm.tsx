"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, CheckCircle, Calendar } from "lucide-react";

// Replace with your actual Calendly link
const CALENDLY_URL = "https://calendly.com/yieldit/free-audit-call";

const adSpendOptions = [
  "Not running ads yet",
  "$500 – $1,000/mo",
  "$1,000 – $3,000/mo",
  "$3,000 – $7,500/mo",
  "$7,500+/mo",
];

const challengeOptions = [
  "Not enough inbound calls",
  "Poor Google rankings",
  "Wasting money on ads",
  "Missing too many leads",
  "Need more 5-star reviews",
  "No time for marketing",
];

type FormData = {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  adSpend: string;
  challenge: string;
};

function CalendlyWidget({ name, email }: { name: string; email: string }) {
  const params = new URLSearchParams({
    name,
    email,
    hide_gdpr_banner: "1",
    background_color: "ffffff",
    text_color: "111827",
    primary_color: "1D9E75",
  });
  const url = `${CALENDLY_URL}?${params.toString()}`;

  useEffect(() => {
    // Only load script once; widget.js auto-inits any .calendly-inline-widget[data-url] on the page
    if (!document.getElementById("calendly-script")) {
      const script = document.createElement("script");
      script.id = "calendly-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).Calendly) {
      // Script already loaded — init this new element manually
      (window as any).Calendly.initInlineWidgets();
    }
  }, []);

  return (
    <div
      className="calendly-inline-widget w-full rounded-2xl overflow-hidden border border-[#E5E7EB]"
      data-url={url}
      style={{ minHeight: 680 }}
    />
  );
}

export default function AuditForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    adSpend: "",
    challenge: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
      // Scroll section into view smoothly so booking widget is visible
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 transition-all";

  return (
    <section id="audit" ref={sectionRef} className="py-24 px-6 bg-[#F9FAFB]">
      <div
        className="max-w-5xl mx-auto transition-all duration-500"
        style={{ opacity: 1 }}
      >
        {/* ── STEP 1: Form ── */}
        <div
          className={`transition-all duration-500 ${
            submitted ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-2">
              <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
                <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
                  Free audit
                </span>
              </div>
              <h2 className="animate-on-scroll font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-5">
                Find out where
                <br />
                you&apos;re{" "}
                <span className="italic text-[#1D9E75]">leaving money</span>
                <br />
                on the table.
              </h2>
              <p className="animate-on-scroll text-[#6B7280] text-base leading-relaxed mb-8">
                Fill out the form and our team will run a full analysis of your online
                presence — ads, SEO, reviews, and lead capture — then send you a
                personalized report within 48 hours.
              </p>
              <ul className="animate-on-scroll flex flex-col gap-3">
                {["No sales pressure", "No commitment required", "Delivered in 48 hours"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#374151]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Form card */}
            <div className="animate-on-scroll lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-lg shadow-black/5"
              >
                <h3 className="font-semibold text-[#111827] text-lg mb-6">
                  Request your free audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                      Your name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                      Business name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="Smith HVAC Services"
                      value={formData.businessName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="john@smithhvac.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                    Current monthly ad spend
                  </label>
                  <select
                    name="adSpend"
                    required
                    value={formData.adSpend}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled>Select your range...</option>
                    {adSpendOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                    Biggest marketing challenge
                  </label>
                  <select
                    name="challenge"
                    required
                    value={formData.challenge}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled>Select your challenge...</option>
                    {challengeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#1D9E75] text-white font-semibold text-sm transition-all duration-200 hover:bg-[#085041] hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get my free audit
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#9CA3AF] mt-4">
                  We respect your privacy. No spam — ever.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ── STEP 2: Booking ── */}
        <div
          className={`transition-all duration-500 ${
            submitted ? "opacity-100" : "opacity-0 h-0 overflow-hidden pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
              <CheckCircle size={14} className="text-[#1D9E75]" />
              <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
                Audit request received
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
              One last step,{" "}
              <span className="italic text-[#1D9E75]">{formData.name.split(" ")[0] || "friend"}.</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Lock in a 20-minute strategy call so we can walk you through the audit
              results live — and show you exactly what we&apos;d do differently.
            </p>
          </div>

          {/* What to expect strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Calendar, title: "20 minutes", sub: "No fluff — just your numbers and our plan" },
              { icon: CheckCircle, title: "Audit review", sub: "We walk through every gap we found" },
              { icon: ArrowRight, title: "No pressure", sub: "You decide if we're the right fit" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E5E7EB]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-[#1D9E75]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#111827]">{item.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendly embed */}
          {submitted && (
            <CalendlyWidget name={formData.name} email={formData.email} />
          )}

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            Prefer email?{" "}
            <a href="mailto:hello@yieldit.io" className="text-[#1D9E75] hover:underline">
              hello@yieldit.io
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
