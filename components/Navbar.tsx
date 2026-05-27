"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-[#E5E7EB] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-serif text-[22px] leading-none select-none">
          <span className="text-[#111827]">Yield</span>
          <span className="text-[#1D9E75]">It</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => handleLinkClick(e, l.href)}
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href="#audit"
          onClick={(e) => handleLinkClick(e, "#audit")}
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-lg bg-[#1D9E75] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#085041] hover:scale-[1.02] active:scale-[0.98]"
        >
          Get a free audit
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-[#111827]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-6 pb-6">
          <ul className="flex flex-col gap-5 pt-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => handleLinkClick(e, l.href)}
                  className="text-base font-medium text-[#111827]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#audit"
            onClick={(e) => handleLinkClick(e, "#audit")}
            className="mt-6 inline-flex w-full items-center justify-center px-5 py-3 rounded-lg bg-[#1D9E75] text-white text-sm font-semibold"
          >
            Get a free audit
          </a>
        </div>
      )}
    </header>
  );
}
