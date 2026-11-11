"use client";

import Link from "next/link";
import { Mic, ArrowUpRight, ChevronRight, Sparkles, Play, Compass } from "lucide-react";
import MagneticButton from "@/components/animations/MagneticButton";

export default function FinalCTA({ onOpenAssistant, onPlayPresentation }) {
  const handleStart = () => {
    if (onOpenAssistant) {
      onOpenAssistant();
      return;
    }
    const el = document.getElementById("assistant");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToDiscovery = (e) => {
    e.preventDefault();
    const el = document.getElementById("discovery");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/schemes";
    }
  };

  return (
    <section className="py-20 sm:py-32 bg-white text-[#0F172A] relative overflow-hidden border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#D97706] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            Instant Access • 100% Free For Citizens
          </span>
        </div>

        {/* Exact required title for Section 5 */}
        <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-[#0F172A] leading-tight font-sans">
          Your opportunity starts here.
        </h2>

        <p className="text-base sm:text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed">
          Speak or type in your native language. Discover verified schemes across agriculture, pensions, healthcare, and education in seconds.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          
          {/* Exact required button: Discover Government Schemes */}
          <MagneticButton>
            <a
              href="#discovery"
              onClick={handleScrollToDiscovery}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#FFC66B] hover:brightness-105 text-[#050505] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(245,166,35,0.35)] group cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#050505]" />
              <span>Discover Government Schemes</span>
              <ChevronRight className="w-4 h-4 text-[#050505] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </MagneticButton>

          {/* AI Conversation Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[#0F172A] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Mic className="w-4 h-4 text-[#D97706]" />
            <span>Start Voice Assistant</span>
          </button>

          {/* Play Presentation Button */}
          {onPlayPresentation && (
            <button
              type="button"
              onClick={onPlayPresentation}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#475569] hover:text-[#0F172A] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
              <span>Play Presentation</span>
            </button>
          )}

        </div>

        <div className="pt-8 flex items-center justify-center gap-6 text-xs text-[#64748B] font-mono">
          <span>Punjab State</span>
          <span>•</span>
          <span>Haryana State</span>
          <span>•</span>
          <span>Central India</span>
          <span>•</span>
          <span>672 Total Schemes</span>
        </div>

      </div>
    </section>
  );
}
