"use client";

import { Play, Compass } from "lucide-react";
import MagneticButton from "@/components/animations/MagneticButton";

export default function HeroOverlay({ onPlayPresentation }) {
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
    <div className="relative z-20 flex flex-col justify-end h-full p-8 sm:p-14 lg:p-20 text-white pointer-events-none">
      
      {/* Editorial Content Container */}
      <div className="max-w-3xl space-y-5 pointer-events-auto">
        
        {/* Exact required headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white leading-[1.08] font-sans drop-shadow-sm">
          Every Indian deserves access to the right opportunity.
        </h1>

        {/* Exact required supporting description */}
        <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed font-normal drop-shadow-sm">
          Discover government schemes, understand your eligibility, and access opportunities through intelligent multilingual assistance.
        </p>

        {/* Only two primary actions as strictly required */}
        <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
          
          {/* 1. Explore Schemes (Amber Primary Button) */}
          <MagneticButton>
            <a
              href="#discovery"
              onClick={handleScrollToDiscovery}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#FFC66B] hover:brightness-105 text-[#050505] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,166,35,0.35)] cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#050505]" />
              <span>Explore Schemes</span>
            </a>
          </MagneticButton>

          {/* 2. Play Presentation (Minimal Secondary Button) */}
          <MagneticButton>
            <button
              type="button"
              onClick={onPlayPresentation}
              className="px-6 py-3.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 hover:border-white/50 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-md group"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-[#F5A623] flex items-center justify-center transition-colors">
                <Play className="w-2.5 h-2.5 fill-white group-hover:fill-black text-white group-hover:text-black ml-0.5 transition-colors" />
              </div>
              <span>Play Presentation</span>
            </button>
          </MagneticButton>

        </div>

      </div>

    </div>
  );
}
