"use client";

import { ShieldCheck, CheckCircle2, FileText, Lock, Database, Mic, Search } from "lucide-react";

export default function TrustSection({ onOpenSpeak, onOpenType }) {
  const handleOpenSpeak = () => {
    if (onOpenSpeak) {
      onOpenSpeak();
      return;
    }
    const el = document.getElementById("assistant");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenType = () => {
    if (onOpenType) {
      onOpenType();
      return;
    }
    const el = document.getElementById("text-requirement");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus();
    }
  };

  return (
    <section id="features" className="py-20 sm:py-32 bg-[#F8FAFC] text-[#0F172A] border-t border-gray-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-white border border-gray-200 p-8 sm:p-14 shadow-lg relative overflow-hidden">
          
          <div className="max-w-3xl space-y-6 relative z-10">
            
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Official Source Transparency
              </span>
            </div>

            {/* Exact Required Title for E2E Tests */}
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] font-sans">
              Democratizing Access to Public Welfare
            </h2>

            <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
              Navigating government assistance shouldn&apos;t be intimidating due to bureaucratic jargon or language barriers.
              YojanaSathi bridges the gap with a voice-first conversational experience linking directly to authentic state and central government portals.
            </p>

            {/* 3 Pillars of Data Trust */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="font-mono text-xs font-bold text-[#0F172A] block">
                  100% Official Sources
                </span>
                <p className="text-xs text-[#64748B] leading-normal">
                  All welfare programs are cross-referenced with .gov.in, .nic.in, or state gazettes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="font-mono text-xs font-bold text-[#0F172A] block">
                  Audited Classifications
                </span>
                <p className="text-xs text-[#64748B] leading-normal">
                  Budget accounting recoveries and internal fund transfers are strictly filtered out.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="font-mono text-xs font-bold text-[#0F172A] block">
                  Zero Hallucination
                </span>
                <p className="text-xs text-[#64748B] leading-normal">
                  Missing citizen parameters produce transparent follow-ups, never invented criteria.
                </p>
              </div>
            </div>

            {/* Action Buttons honoring exact E2E selectors */}
            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenSpeak}
                aria-label="Try Speaking Now"
                className="px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-gray-800 text-white font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Mic className="w-4 h-4 text-[#F5A623]" />
                <span>Try Speaking Now</span>
              </button>

              <button
                type="button"
                onClick={handleOpenType}
                aria-label="Try Typing Now"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0F172A] font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Search className="w-4 h-4 text-[#64748B]" />
                <span>Try Typing Now</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
