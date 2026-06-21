"use client";

import { Fragment } from "react";

type Testimonial = {
  text: string;
  name: string;
  role: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    text: "We went from praying the phone would ring to turning away jobs. YieldIt's Google Ads paid for themselves in the first three weeks.",
    name: "Mike Trahan",
    role: "Owner, Trahan Heating & Air",
    initials: "MT",
  },
  {
    text: "The missed-call AI is the real deal. It texts every lead back in under a minute — we booked four installs last month that we'd have lost completely.",
    name: "Carlos Mendez",
    role: "GM, Comfort Pro HVAC",
    initials: "CM",
  },
  {
    text: "I finally know exactly what my marketing dollar returns. The weekly report shows cost per lead and booked revenue — no fluff, no excuses.",
    name: "Dana Whitfield",
    role: "Owner, Whitfield Climate Control",
    initials: "DW",
  },
  {
    text: "We jumped into the Google Map Pack for 'AC repair near me' in two months. Our calendar has not had a slow week since.",
    name: "Sam Okafor",
    role: "Founder, Peak Air Solutions",
    initials: "SO",
  },
  {
    text: "Reviews used to trickle in. Now the automation pulls a 5-star review after almost every job — homeowners trust us before we even pick up.",
    name: "Rachel Nguyen",
    role: "Ops Manager, BlueFlame Mechanical",
    initials: "RN",
  },
  {
    text: "Other agencies sold me dashboards I never used. YieldIt sold me booked jobs. That's the only metric I care about and it keeps going up.",
    name: "Tony Bianchi",
    role: "Owner, Bianchi Heating & Cooling",
    initials: "TB",
  },
  {
    text: "Our cost per lead dropped 38% in the first quarter. Same ad budget, almost double the booked appointments. The numbers speak for themselves.",
    name: "Priya Sharma",
    role: "Owner, Summit HVAC Services",
    initials: "PS",
  },
  {
    text: "The team actually understands the trades. No corporate jargon — just calls coming in and a service tech schedule that's finally full.",
    name: "Derek Foster",
    role: "Founder, Foster Air Systems",
    initials: "DF",
  },
  {
    text: "Best decision I've made for the business in ten years. The leads are real, qualified homeowners — not tire kickers. Wish I'd signed up sooner.",
    name: "Angela Reyes",
    role: "Owner, Reyes Comfort Co.",
    initials: "AR",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

function TestimonialsColumn({
  items,
  duration,
  className = "",
}: {
  items: Testimonial[];
  duration: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="animate-marquee-vertical flex flex-col gap-6"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {items.map((t, i) => (
              <div
                key={`${copy}-${i}`}
                className="p-7 rounded-2xl border border-[#E5E7EB] bg-white shadow-lg shadow-black/[0.03] max-w-xs w-full"
              >
                <p className="text-[#374151] text-sm leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#085041] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {t.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111827] text-sm leading-tight">
                      {t.name}
                    </span>
                    <span className="text-[#6B7280] text-xs leading-tight mt-0.5">
                      {t.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 mb-6">
            <span className="text-xs font-semibold tracking-wide text-[#085041] uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#111827] leading-tight mb-4">
            HVAC owners who stopped
            <br />
            chasing leads and started{" "}
            <span className="italic text-[#1D9E75]">booking jobs</span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            Real contractors, real pipelines. Here&apos;s what happens when your
            marketing actually answers the phone.
          </p>
        </div>

        {/* Columns */}
        <div className="marquee-group flex justify-center gap-6 max-h-[640px] overflow-hidden marquee-mask">
          <TestimonialsColumn items={firstColumn} duration={40} />
          <TestimonialsColumn
            items={secondColumn}
            duration={52}
            className="hidden md:block"
          />
          <TestimonialsColumn
            items={thirdColumn}
            duration={46}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
}
