"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.warn("Global root error caught:", error?.message || error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] font-sans p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-4xl font-extrabold text-[#F5A623]">YojanaSathi</div>
          <h1 className="text-xl font-bold text-slate-900">Application Unavailable</h1>
          <p className="text-slate-600 text-sm">
            A critical error occurred while rendering the page. Please refresh or try again in a few moments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

