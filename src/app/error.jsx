"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log error to monitoring service in production (e.g. Sentry)
    console.warn("Application runtime error caught by boundary:", error?.message || error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Something went wrong
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              An unexpected error occurred while loading this section. Our team has been notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

