"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SchemeListingCard from "@/components/SchemeListingCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Pagination from "@/components/Pagination";
import Link from "next/link";

function SchemesContent() {
  const searchParams = useSearchParams();
  const initialState = searchParams.get("state") || "";
  const initialSearch = searchParams.get("search") || "";

  // ── State ──────────────────────────────────────────────────────────────────
  const [schemes, setSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [committedSearch, setCommittedSearch] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedState, setSelectedState] = useState(initialState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search
  const searchDebounce = useRef(null);
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setCommittedSearch(val.trim());
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    clearTimeout(searchDebounce.current);
    setCommittedSearch(searchInput.trim());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCommittedSearch("");
    setSelectedDept("");
    setSelectedState("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // ── Fetch departments once ─────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setDepartments(json?.data || []))
      .catch(() => {});
  }, []);

  // ── Fetch schemes ──────────────────────────────────────────────────────────
  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (committedSearch) params.set("search", committedSearch);
      if (selectedDept) params.set("department", selectedDept);
      if (selectedState) params.set("state", selectedState);

      const res = await fetch(`/api/schemes?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const json = await res.json();

      setSchemes(json.data || []);
      setPagination(
        json.pagination || { page: 1, limit: 18, total: 0, totalPages: 0 }
      );
    } catch (err) {
      setError(err.message || "Failed to load schemes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, committedSearch, selectedDept, selectedState]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const hasFilters = committedSearch || selectedDept || selectedState;
  const selectedDeptName = departments.find((d) => d.id === selectedDept)?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#17243A]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="bg-[#F8FAFC] border-b border-[#E5EAF1] py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-[#68758A] mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#2563EB] transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#17243A] font-semibold" aria-current="page">
                Find Schemes
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                  Verified Government Welfare Catalogue
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#14233B] font-heading">
                  Discover Government Welfare Schemes
                </h1>
                <p className="text-[#68758A] text-xs sm:text-sm leading-relaxed">
                  Browse {pagination.total > 0 ? `${pagination.total.toLocaleString("en-IN")} ` : ""}verified citizen welfare programs. Budget accounting entries and internal fiscal lines are filtered out.
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex gap-3 shrink-0">
                <div className="text-right bg-[#FFFFFF] border border-[#E5EAF1] shadow-xs rounded-xl px-4 py-2.5">
                  <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">
                    Welfare Schemes
                  </span>
                  <span className="text-xl font-black text-[#14233B]">
                    {pagination.total > 0 ? pagination.total.toLocaleString("en-IN") : "—"}
                  </span>
                </div>
                <div className="text-right bg-[#FFFFFF] border border-[#E5EAF1] shadow-xs rounded-xl px-4 py-2.5">
                  <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">
                    Administering Depts
                  </span>
                  <span className="text-xl font-black text-[#2563EB]">
                    {departments.length || 17}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls Bar ─────────────────────────────────── */}
        <div className="bg-[#FFFFFF] border-b border-[#E5EAF1] sticky top-16 sm:top-20 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row gap-3"
              role="search"
              aria-label="Search and filter schemes"
            >
              {/* Search text input */}
              <div className="relative flex-1">
                <label htmlFor="scheme-search" className="sr-only">
                  Search scheme name
                </label>
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="scheme-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by scheme name or keywords (e.g. Pension, Kisan, Scholarship)…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5EAF1] bg-[#F8FAFC] text-[#17243A] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                  aria-label="Search by scheme name"
                />
              </div>

              {/* State filter */}
              <div>
                <label htmlFor="state-filter" className="sr-only">
                  Filter by state
                </label>
                <select
                  id="state-filter"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full sm:w-44 px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAF1] bg-[#F8FAFC] text-[#17243A] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                  aria-label="Filter by state"
                >
                  <option value="">All Regions</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                </select>
              </div>

              {/* Department filter */}
              <div>
                <label htmlFor="dept-filter" className="sr-only">
                  Filter by department
                </label>
                <select
                  id="dept-filter"
                  value={selectedDept}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full sm:w-56 px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAF1] bg-[#F8FAFC] text-[#17243A] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition truncate"
                  aria-label="Filter by department"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d._count?.schemes || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold transition-colors shadow-xs cursor-pointer"
              >
                Search
              </button>

              {/* Clear filters button */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 rounded-xl border border-[#E5EAF1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#68758A] text-sm font-semibold transition-colors cursor-pointer"
                  aria-label="Clear all filters"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Active filter tags */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3" aria-live="polite" aria-atomic="true">
                <span className="text-xs text-[#68758A] font-medium mr-1">Active filters:</span>
                {committedSearch && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                    Search: &ldquo;{committedSearch}&rdquo;
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setCommittedSearch("");
                        setPagination((p) => ({ ...p, page: 1 }));
                      }}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label={`Remove search filter: ${committedSearch}`}
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedState && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                    State: {selectedState}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedState("");
                        setPagination((p) => ({ ...p, page: 1 }));
                      }}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label={`Remove state filter: ${selectedState}`}
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDeptName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                    Dept: {selectedDeptName}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDept("");
                        setPagination((p) => ({ ...p, page: 1 }));
                      }}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label={`Remove department filter: ${selectedDeptName}`}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Content Area ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchSchemes}
                className="underline font-bold hover:text-red-900"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-[#E5EAF1]" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && schemes.length === 0 && (
            <div className="text-center py-16 bg-[#F8FAFC] border border-[#E5EAF1] rounded-3xl p-8 space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-[#14233B]">
                No matching government schemes found
              </h3>
              <p className="text-xs sm:text-sm text-[#68758A] leading-relaxed">
                {hasFilters
                  ? "Try broadening your search term or clearing the active department / region filters."
                  : "No verified schemes match this criterion."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Schemes Grid */}
          {!loading && !error && schemes.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme) => (
                  <SchemeListingCard key={scheme.id} scheme={scheme} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(p) => {
                      setPagination((prev) => ({ ...prev, page: p }));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={6} />}>
      <SchemesContent />
    </Suspense>
  );
}
