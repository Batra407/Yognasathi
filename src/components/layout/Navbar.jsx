"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, Globe, Sparkles, Play } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "AI Assistant", href: "/#assistant" },
  { label: "Explore Schemes", href: "/schemes" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Departments", href: "/departments" },
  { label: "About", href: "/about" },
];

export default function Navbar({
  selectedLanguage = "en",
  onSelectLanguage,
  onPlayPresentation,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-3"
          : "bg-white border-b border-gray-100 py-3.5 sm:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo — Clean Wordmark with Amber Accent */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
            aria-label="YojanaSathi Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FFC66B] flex items-center justify-center text-[#050505] transition-transform duration-200 group-hover:scale-95 shadow-sm">
              <span className="font-mono text-xs font-bold tracking-tighter">YS</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-[-0.03em] text-[#0F172A] font-heading">
                YOJANASATHI
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider text-[#D97706] border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">
                GOV AI
              </span>
            </div>
          </Link>

          {/* Center Navigation Links — Minimalist Clean Style */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-[#0F172A] font-semibold bg-gray-100"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Stack: Presentation + Language + Talk to AI */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Play Presentation Header Pill */}
            {onPlayPresentation && (
              <button
                type="button"
                onClick={onPlayPresentation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50/50 text-[#D97706] border border-amber-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3 fill-[#D97706]" />
                <span>Presentation</span>
              </button>
            )}

            {/* Minimal Language Switcher */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 text-xs font-medium text-[#475569] bg-gray-50">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
              {["en", "hi", "pa"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSelectLanguage && onSelectLanguage(lang)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    selectedLanguage.startsWith(lang)
                      ? "bg-white text-[#0F172A] font-semibold shadow-xs border border-gray-200"
                      : "hover:text-[#0F172A]"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "hi" ? "हिं" : "ਪੰ"}
                </button>
              ))}
            </div>

            {/* Talk to AI CTA Button */}
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F5A623] to-[#FFC66B] hover:brightness-105 text-[#050505] text-sm font-bold tracking-tight transition-all duration-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Talk to AI</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-black" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {onPlayPresentation && (
              <button
                type="button"
                onClick={onPlayPresentation}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-[#D97706] text-xs font-mono border border-amber-200"
              >
                ▶ Film
              </button>
            )}
            <Link
              href="/assistant"
              className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black text-xs font-bold"
            >
              AI
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-down Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-gray-100 text-[#0F172A] font-semibold"
                    : "text-[#475569] hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">LANGUAGE</span>
            <div className="flex gap-1.5">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी" },
                { code: "pa", label: "ਪੰਜਾਬੀ" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    if (onSelectLanguage) onSelectLanguage(item.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    selectedLanguage.startsWith(item.code)
                      ? "border-[#F5A623] bg-[#F5A623] text-black font-semibold"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
