"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DepartmentCard from "@/components/DepartmentCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Link from "next/link";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/departments")
      .then((r) => {
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then((json) => {
        if (!ignore) setDepartments(json.data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = searchInput.trim()
    ? departments.filter((d) =>
        d.name.toLowerCase().includes(searchInput.trim().toLowerCase())
      )
    : departments;

  const totalSchemes = departments.reduce(
    (sum, d) => sum + (d._count?.schemes || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-[#E5EAF1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <nav className="flex items-center gap-2 text-xs text-[#68758A] mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#17243A] transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#17243A] font-semibold" aria-current="page">
                Departments
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  Official Administrative Directory
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#14233B]">
                  Ministry & Department Directory
                </h1>
                <p className="text-[#68758A] text-sm sm:text-base max-w-xl leading-relaxed">
                  Browse all {departments.length || ""} central government ministries and departments indexed in our Union Budget and state dataset.
                </p>
              </div>

              {/* Stats */}
              {!loading && !error && (
                <div className="flex gap-3 shrink-0">
                  <div className="text-right bg-[#F7F9FC] border border-[#E5EAF1] rounded-2xl px-5 py-3 shadow-2xs">
                    <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">Departments</span>
                    <span className="text-xl font-black text-[#14233B]">{departments.length}</span>
                  </div>
                  <div className="text-right bg-[#F7F9FC] border border-[#E5EAF1] rounded-2xl px-5 py-3 shadow-2xs">
                    <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">Indexed Schemes</span>
                    <span className="text-xl font-black text-blue-600">{totalSchemes.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search filter */}
        <div className="bg-white border-b border-[#E5EAF1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative max-w-md">
              <label htmlFor="dept-search" className="sr-only">
                Search departments
              </label>
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68758A] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="dept-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search department or ministry name…"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5EAF1] bg-[#F7F9FC] text-[#17243A] placeholder-[#68758A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
                aria-label="Search departments"
              />
            </div>

            {searchInput && (
              <p className="mt-2 text-xs text-[#68758A]" aria-live="polite">
                {filtered.length === 0
                  ? "No departments matched your search."
                  : `Showing ${filtered.length} of ${departments.length} departments`}
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error */}
          {error && (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#14233B]">Failed to load departments</p>
                <p className="text-sm text-[#68758A]">{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && <LoadingSkeleton variant="dept" count={12} />}

          {/* Empty search */}
          {!loading && !error && filtered.length === 0 && searchInput && (
            <div className="text-center py-16 space-y-4 bg-white border border-[#E5EAF1] rounded-3xl p-8">
              <p className="font-bold text-[#14233B]">No departments found</p>
              <p className="text-sm text-[#68758A]">
                Try a different search term or clear your filter.
              </p>
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="px-4 py-2 rounded-xl border border-[#E5EAF1] bg-[#F7F9FC] text-sm font-semibold text-[#17243A] hover:bg-slate-100 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-xs font-semibold text-[#68758A] uppercase tracking-wider mb-6" aria-live="polite">
                {searchInput
                  ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}`
                  : `${departments.length} ministries and departments`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((dept) => (
                  <DepartmentCard key={dept.id} department={dept} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA section */}
        {!loading && !error && departments.length > 0 && (
          <div className="bg-white border-t border-[#E5EAF1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#14233B]">
                Looking for a specific citizen scheme?
              </h2>
              <p className="text-[#68758A] text-sm max-w-lg mx-auto leading-relaxed">
                Use the scheme directory or talk with our conversational AI voice assistant in Hindi, English, Punjabi, or Hinglish to check eligibility instantly.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/schemes"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  Browse All Schemes
                </Link>
                <Link
                  href="/assistant"
                  className="px-6 py-2.5 rounded-xl bg-[#F7F9FC] hover:bg-slate-100 border border-[#E5EAF1] text-[#14233B] text-xs font-bold transition-colors shadow-2xs"
                >
                  Open AI Voice Assistant
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
