'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments list for dropdown filter
  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await fetch('/api/departments');
        if (!res.ok) throw new Error('Failed to fetch departments');
        const json = await res.json();
        setDepartments(json.data || []);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    }
    loadDepartments();
  }, []);

  // Fetch schemes based on page, search query, and department filter
  useEffect(() => {
    let isMounted = true;
    async function loadSchemes() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          admin: 'true'
        });
        if (search) params.set('search', search);
        if (selectedDept) params.set('department', selectedDept);

        const res = await fetch(`/api/schemes?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();

        if (isMounted) {
          setSchemes(json.data || []);
          setPagination(json.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 });
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSchemes();
    return () => { isMounted = false; };
  }, [pagination.page, pagination.limit, search, selectedDept]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'Not available';
    const num = parseFloat(val);
    return isNaN(num) ? 'Not available' : `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#68758A]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#17243A] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#17243A] font-semibold" aria-current="page">
            Admin Schemes Explorer
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-[#E5EAF1] p-6 sm:p-8 rounded-3xl shadow-xs gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                Official Dataset A
              </span>
              <span className="text-xs text-[#68758A] font-medium">PostgreSQL Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14233B]">
              Government Schemes Explorer
            </h1>
            <p className="text-[#68758A] text-sm max-w-xl">
              Administrative read-only view of verified Union Budget and State welfare scheme records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#F7F9FC] border border-[#E5EAF1] px-4 py-3 rounded-2xl text-right min-w-[110px]">
              <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">Total Schemes</span>
              <span className="text-xl font-black text-blue-600">{pagination.total}</span>
            </div>
            <div className="bg-[#F7F9FC] border border-[#E5EAF1] px-4 py-3 rounded-2xl text-right min-w-[110px]">
              <span className="text-[10px] text-[#68758A] block uppercase font-bold tracking-wider">Departments</span>
              <span className="text-xl font-black text-[#14233B]">{departments.length || 71}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[#E5EAF1] p-5 rounded-2xl shadow-2xs">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <label className="text-xs font-bold text-[#14233B] block mb-1.5 uppercase tracking-wider">
              Search Scheme Name
            </label>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="e.g. Crop Insurance, PM-Kisan, Technology..."
              className="w-full bg-[#F7F9FC] border border-[#E5EAF1] text-[#17243A] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-[#68758A]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-xs font-bold text-[#14233B] block mb-1.5 uppercase tracking-wider">
              Filter by Department
            </label>
            <select
              value={selectedDept}
              onChange={handleDeptChange}
              className="w-full bg-[#F7F9FC] border border-[#E5EAF1] text-[#17243A] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Departments ({departments.length || 71} Total)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d._count?.schemes || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-medium">
            Failed to load schemes: {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-20 bg-white border border-[#E5EAF1] rounded-2xl">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#68758A] text-xs font-medium mt-3">Fetching schemes from PostgreSQL database...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E5EAF1] rounded-2xl">
            <p className="text-[#14233B] font-bold text-sm">No matching government schemes found.</p>
            <p className="text-[#68758A] text-xs mt-1">Try broadening your search query or clearing the department filter.</p>
          </div>
        ) : (
          /* Schemes Table */
          <div className="overflow-x-auto border border-[#E5EAF1] rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F9FC] text-[#68758A] border-b border-[#E5EAF1] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Item #</th>
                  <th className="py-3 px-4">Scheme Name</th>
                  <th className="py-3 px-4">Administering Department</th>
                  <th className="py-3 px-4 text-right">2024-25 Actual</th>
                  <th className="py-3 px-4 text-right">2026-27 BE</th>
                  <th className="py-3 px-4 w-40">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {schemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-[#68758A] font-mono text-xs">{scheme.schemeNo}</td>
                    <td className="py-3 px-4 font-semibold text-[#14233B]">
                      <Link href={`/schemes/${scheme.id}`} className="hover:text-blue-600 transition-colors">
                        {scheme.schemeName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#68758A]">
                      {scheme.department?.name || 'Not available'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">
                      {formatCurrency(scheme.actuals20242025Crores)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 font-mono font-bold">
                      {formatCurrency(scheme.be20262027Crores)}
                    </td>
                    <td className="py-3 px-4 text-[#68758A]">
                      {scheme.eligibilityText ? (
                        <span className="line-clamp-2">{scheme.eligibilityText}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#68758A]">
              Showing page <strong className="text-[#14233B]">{pagination.page}</strong> of{' '}
              <strong className="text-[#14233B]">{pagination.totalPages}</strong> ({pagination.total} total items)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5EAF1] bg-white text-[#17243A] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs"
              >
                &larr; Previous
              </button>

              <span className="text-xs px-3 py-1 bg-[#F7F9FC] border border-[#E5EAF1] rounded-lg text-[#17243A] font-semibold">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5EAF1] bg-white text-[#17243A] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
