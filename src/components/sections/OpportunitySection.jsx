"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, ShieldCheck } from "lucide-react";
import RevealSection from "@/components/animations/RevealSection";

const CITIZEN_STORIES = [
  {
    role: "Agricultural Producers",
    title: "Smallholder Farmers in Punjab & Haryana",
    desc: "Over 140 million rural families qualify for fertilizer subsidies, direct cash transfers (PM-Kisan), and subsidized tube-well power, yet many struggle with complex paperwork.",
    image: "/images/scene_farmer.jpg",
    stat: "₹6,000 / year",
    statLabel: "Direct DBT Entitlement",
  },
  {
    role: "Higher Education Scholars",
    title: "First-Generation College Students",
    desc: "Post-matric and technical education scholarships frequently lapse unclaimed due to decentralized departmental notifications across states.",
    image: "/images/scene_student.jpg",
    stat: "100% Tuition Waiver",
    statLabel: "Post-Matric Support",
  },
  {
    role: "Rural Micro-Enterprises",
    title: "Women Artisans & Self-Help Groups",
    desc: "Traditional handicraft producers and women-led cooperatives need collateral-free working capital and direct market links without middlemen.",
    image: "/images/scene_women_entrepreneur.jpg",
    stat: "Collateral-Free",
    statLabel: "Microcredit Assistance",
  },
];

export default function OpportunitySection() {
  return (
    <section
      id="story-opportunity"
      className="py-20 sm:py-32 bg-white text-[#0F172A] border-t border-gray-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Section Header */}
        <RevealSection className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              The Public Welfare Access Gap
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] font-sans">
            One Platform, Many Opportunities.
          </h2>

          <p className="text-base sm:text-xl text-[#475569] leading-relaxed">
            India operates hundreds of central and state welfare programs with thousands of crores in public allocations.
            Yet millions of citizens remain unaware of which programs they qualify for due to administrative silos and complex gazettes.
          </p>
        </RevealSection>

        {/* 3 Authentic Citizen Story Compositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CITIZEN_STORIES.map((story) => (
            <div
              key={story.title}
              className="group rounded-2xl bg-[#F8FAFC] border border-gray-200 hover:border-[#F5A623]/80 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg"
            >
              <div>
                {/* Visual Header */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/95 backdrop-blur-md border border-gray-200 text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] shadow-sm">
                      {story.role}
                    </span>
                  </div>

                  {/* Stat Pill */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between bg-white/90 backdrop-blur-md border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {story.stat}
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {story.statLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#D97706] transition-colors leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {story.desc}
                  </p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="px-6 pb-6 pt-2">
                <a
                  href="#discovery"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
                >
                  <span>Explore matching schemes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Metrics Bar — Clean White Treatment */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-gray-200 shadow-xs">
          <div className="space-y-1">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-[#D97706]">
              672
            </span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Verified Schemes
            </span>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-[#0F172A]">
              0%
            </span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              LLM Hallucinations
            </span>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-[#D97706]">
              4 Languages
            </span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Hindi • PB • EN • Hinglish
            </span>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0">
            <span className="font-mono text-2xl sm:text-4xl font-bold text-[#0F172A]">
              100% Free
            </span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              For Every Citizen
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
