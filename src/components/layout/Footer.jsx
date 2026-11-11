"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Database, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F8FAFC] text-[#475569] text-sm font-sans">
      {/* Top Banner / Status Strip */}
      <div className="border-b border-gray-200 bg-gray-50/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#0F172A]">
              System Operational: Verified Government Schemes Intelligence Engine
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B] font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
              <Database className="w-3.5 h-3.5 text-[#D97706]" />
              PostgreSQL Connected
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              672 Schemes Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Col 1: Brand & Identity (2 cols on large) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#F5A623] to-[#FFC66B] flex items-center justify-center text-[#050505] shadow-xs">
                <span className="font-mono text-xs font-bold tracking-tighter">YS</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0F172A] font-heading">
                YOJANASATHI
              </span>
            </Link>
            
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
              An enterprise-grade multilingual AI intelligence platform enabling citizens to discover verified public welfare schemes, evaluate eligibility deterministically, and access benefits.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono text-[#D97706] shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Zero Hallucination Guaranteed Architecture</span>
              </div>
            </div>
          </div>

          {/* Col 2: Platform Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0F172A] font-bold">
              Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <Link href="/assistant" className="hover:text-[#0F172A] transition-colors flex items-center gap-1">
                  <span>Voice AI Assistant</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-[#0F172A] transition-colors">
                  Schemes Directory
                </Link>
              </li>
              <li>
                <Link href="/departments" className="hover:text-[#0F172A] transition-colors">
                  Department Intelligence
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-[#0F172A] transition-colors">
                  Multilingual NLP
                </Link>
              </li>
              <li>
                <Link href="/admin/schemes" className="hover:text-[#0F172A] transition-colors">
                  Data Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Integrity & Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0F172A] font-bold">
              Official Data Sources
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <a
                  href="https://www.indiabudget.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F172A] transition-colors flex items-center gap-1"
                >
                  <span>Union Budget Gazette</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://apisetu.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F172A] transition-colors flex items-center gap-1"
                >
                  <span>API Setu myScheme</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://punjab.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F172A] transition-colors flex items-center gap-1"
                >
                  <span>Punjab State Welfare</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://saralharyana.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F172A] transition-colors flex items-center gap-1"
                >
                  <span>Haryana Antyodaya Saral</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0F172A] font-bold">
              Governance
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <Link href="/about" className="hover:text-[#0F172A] transition-colors">
                  Transparency Audit
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="hover:text-[#0F172A] transition-colors">
                  Privacy &amp; Data Consent
                </Link>
              </li>
              <li>
                <Link href="/about#methodology" className="hover:text-[#0F172A] transition-colors">
                  Eligibility Evaluation Logic
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="hover:text-[#0F172A] transition-colors">
                  Official Inquiries
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Provenance Strip */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>
            © {new Date().getFullYear()} YojanaSathi Inc. All rights reserved. Open welfare discovery infrastructure.
          </p>
          <p className="max-w-xl text-center md:text-right leading-relaxed">
            Transparency Notice: YojanaSathi is an independent public-interest technology platform. Scheme applications are submitted directly on authoritative government portals.
          </p>
        </div>
      </div>
    </footer>
  );
}
