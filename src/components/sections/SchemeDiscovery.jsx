"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CheckCircle2, Building2, MapPin, Loader2 } from "lucide-react";
import SchemeListingCard from "@/components/SchemeListingCard";

const CATEGORY_CHIPS = [
  { label: "All Schemes", query: "", state: "" },
  { label: "Punjab State", query: "", state: "Punjab" },
  { label: "Haryana State", query: "", state: "Haryana" },
  { label: "Central Schemes", query: "", state: "Central" },
  { label: "Farmers & Agriculture", query: "farmer", state: "" },
  { label: "Pensions & Senior Citizens", query: "pension", state: "" },
  { label: "Scholarships & Students", query: "scholarship", state: "" },
];

export default function SchemeDiscovery() {
  const [activeChip, setActiveChip] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(672);

  useEffect(() => {
    let mounted = true;
    const chip = CATEGORY_CHIPS[activeChip];
    const params = new URLSearchParams();
    params.set("limit", "6");
    if (chip.state) params.set("state", chip.state);
    if (chip.query) params.set("search", chip.query);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    setLoading(true);
    fetch(`/api/schemes?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        setSchemes(data?.data || []);
        if (data?.pagination?.total) {
          setTotalCount(data.pagination.total);
        }
      })
      .catch((err) => console.warn("Failed to load schemes:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeChip, searchQuery]);

  return (
    <section id="discovery" className="py-20 sm:py-32 bg-white text-[#0F172A] border-b border-gray-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Verified PostgreSQL Scheme Registry • {totalCount} Records
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] font-sans">
              Discover Relevant Government Schemes
            </h2>
            <p className="text-sm sm:text-base text-[#475569]">
              Every listed scheme is verified against official state and central gazettes. All administrative accounting entries are strictly filtered out.
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-gray-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <span>View All Schemes</span>
            <ArrowUpRight className="w-4 h-4 text-[#F5A623]" />
          </Link>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes by name, keyword, or department (e.g. pension, kisan, health)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors shadow-xs"
              />
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveChip(idx);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeChip === idx
                    ? "bg-[#0F172A] text-white shadow-xs font-semibold"
                    : "bg-gray-100 border border-gray-200 text-[#475569] hover:bg-gray-200 hover:text-[#0F172A]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl bg-gray-50 border border-gray-200 animate-pulse p-6 space-y-4"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-16 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : schemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <SchemeListingCard key={scheme.id} scheme={scheme} dark={false} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-[#0F172A]">
                No schemes found matching your search.
              </p>
              <p className="text-xs text-[#64748B]">
                Try searching for common terms like &ldquo;farmer&rdquo;, &ldquo;pension&rdquo;, &ldquo;scholarship&rdquo;, or reset filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveChip(0);
                  setSearchQuery("");
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#0F172A] hover:bg-gray-50 cursor-pointer shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
