"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Home, HelpCircle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="relative">
            <span className="text-8xl sm:text-9xl font-black text-slate-200 tracking-tight">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold uppercase tracking-widest text-[#F5A623] bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
                Page Not Found
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              We couldn&apos;t find that page
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              The government scheme or portal page you are looking for might have been moved, renamed, or is temporarily unavailable.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/schemes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Explore 672 Schemes
            </Link>
            <Link
              href="/#workflow"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-50 text-amber-800 text-sm font-semibold hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#F5A623]" />
              AI Voice Assistant
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

