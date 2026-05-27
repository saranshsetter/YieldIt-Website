import { Mail, Phone } from "lucide-react";

const footerLinks = {
  Services: [
    "Google Ads Management",
    "Local SEO",
    "AI Follow-Up",
    "Reputation Management",
    "Website Optimization",
  ],
  Company: ["How it works", "Pricing", "Free Audit", "Privacy Policy", "Terms"],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F1A15] text-white pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="font-serif text-2xl leading-none">
              <span className="text-white">Yield</span>
              <span className="text-[#1D9E75]">It</span>
            </a>
            <p className="text-[#9CA3AF] text-sm leading-relaxed mt-4 max-w-xs">
              AI-powered marketing built exclusively for HVAC contractors. More inbound
              calls, more booked jobs, zero guesswork.
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <a
                href="mailto:hello@yieldit.io"
                className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#1D9E75] transition-colors"
              >
                <Mail size={14} />
                hello@yieldit.io
              </a>
              <a
                href="tel:+18005551234"
                className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#1D9E75] transition-colors"
              >
                <Phone size={14} />
                (800) 555-1234
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#6B7280] mb-4">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4B5563]">
          <p>© {year} YieldIt. All rights reserved.</p>
          <p>
            Built for the trades.{" "}
            <span className="text-[#1D9E75]">Powered by AI.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
