"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Globe
} from "lucide-react";

export default function MLEvaluationDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live test state
  const [testInput, setTestInput] = useState(
    "मैं पंजाब का 35 वर्षीय किसान हूँ, मुझे ट्रैक्टर और ट्यूबवेल सब्सिडी चाहिए।"
  );
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ml-evaluation")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setReport(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRunTest = async () => {
    if (!testInput.trim()) return;
    setTesting(true);
    try {
      const res = await fetch("/api/schemes/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testInput })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.warn("Test failed:", err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">Admin</span>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">ML Evaluation Dashboard</span>
          </nav>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Model State: {report?.status || "ONLINE"}
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              scikit-learn 1.8.0 • Python 3.12
            </span>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <Brain className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Multilingual NLP &amp; Intent Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            ML Model Training &amp; Held-Out Test Evaluation
          </h1>
          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            Real performance metrics measured on an independent 109-sample held-out test split with zero train/test leakage.
            Covers 12 citizen welfare intent domains across Hindi, English, Punjabi, and Hinglish.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-semibold text-[#64748B]">
            Loading ML Evaluation Report...
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
            Failed to load evaluation report: {error}
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
                  Test Accuracy
                </span>
                <div className="text-3xl font-extrabold text-[#0F172A]">
                  {(report.metrics.accuracy * 100).toFixed(2)}%
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 109 Unseen Test Samples
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
                  Macro F1-Score
                </span>
                <div className="text-3xl font-extrabold text-[#D97706]">
                  {(report.metrics.macro_f1 * 100).toFixed(2)}%
                </div>
                <span className="text-[11px] text-[#64748B]">
                  Across all 12 domains
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
                  Macro Precision
                </span>
                <div className="text-3xl font-extrabold text-[#2563EB]">
                  {(report.metrics.macro_precision * 100).toFixed(2)}%
                </div>
                <span className="text-[11px] text-[#64748B]">
                  Zero false-positive focus
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
                  Macro Recall
                </span>
                <div className="text-3xl font-extrabold text-[#7C3AED]">
                  {(report.metrics.macro_recall * 100).toFixed(2)}%
                </div>
                <span className="text-[11px] text-[#64748B]">
                  High coverage for citizens
                </span>
              </div>
            </div>

            {/* Architecture & Dataset Split */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm">
                  <Cpu className="w-4 h-4 text-[#D97706]" />
                  <span>Production Champion Model</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs font-mono text-[#0F172A]">
                  {report.selected_model}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Trained with Word N-Grams (1-2) + Subword Character N-Grams (2-5) with sublinear TF scaling for cross-lingual generalization.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm">
                  <Database className="w-4 h-4 text-[#2563EB]" />
                  <span>Dataset Partition</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Total Dataset</span>
                    <span className="font-bold text-[#0F172A]">{report.total_dataset_size} samples</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Training Set (70%)</span>
                    <span className="font-semibold text-[#0F172A]">{report.train_samples} samples</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Validation Set (15%)</span>
                    <span className="font-semibold text-[#0F172A]">{report.validation_samples} samples</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Held-Out Test Set (15%)</span>
                    <span className="font-bold text-[#D97706]">{report.test_samples} samples</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Per-Language F1 Breakdown</span>
                </div>
                <div className="space-y-2 text-xs">
                  {Object.entries(report.per_language).map(([lang, info]) => (
                    <div key={lang} className="flex justify-between items-center py-1 border-b border-[#E2E8F0] last:border-0">
                      <span className="font-bold uppercase text-[#0F172A]">{lang} ({info.samples} samples)</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {(info.f1_score * 100).toFixed(2)}% F1
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-Class Performance Table */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    12-Class Detailed Performance Breakdown
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Precision, Recall, and F1 measured on the 109-sample unseen test set
                  </p>
                </div>
                <span className="text-xs font-mono text-[#D97706] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  12 Intent Categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#CBD5E1] text-[#64748B] font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">Citizen Welfare Category</th>
                      <th className="py-2.5 px-3">Precision</th>
                      <th className="py-2.5 px-3">Recall</th>
                      <th className="py-2.5 px-3">F1-Score</th>
                      <th className="py-2.5 px-3">Test Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {report.intent_classes.map((cls) => {
                      const cMetrics = report.per_class[cls] || {};
                      return (
                        <tr key={cls} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                            {cls}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {((cMetrics.precision || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {((cMetrics.recall || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#D97706]">
                            {((cMetrics["f1-score"] || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#64748B]">
                            {cMetrics.support || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confusion Matrix Table */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  12x12 Confusion Matrix (Held-out Test Samples)
                </h3>
                <p className="text-xs text-[#64748B]">
                  True Labels (Rows) vs. Predicted Labels (Columns)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="text-[10px] font-mono border-collapse border border-[#CBD5E1]">
                  <thead>
                    <tr className="bg-[#F1F5F9]">
                      <th className="p-2 border border-[#CBD5E1] text-left">True \ Pred</th>
                      {report.confusion_matrix.labels.map((lbl, idx) => (
                        <th key={idx} className="p-2 border border-[#CBD5E1] text-center" title={lbl}>
                          {lbl.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.confusion_matrix.matrix.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-amber-50/40">
                        <td className="p-2 border border-[#CBD5E1] font-bold text-[#0F172A] whitespace-nowrap">
                          {report.confusion_matrix.labels[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-2 border border-[#CBD5E1] text-center ${
                              rIdx === cIdx
                                ? val > 0 ? "bg-emerald-100 font-bold text-emerald-900" : "bg-gray-50 text-gray-400"
                                : val > 0 ? "bg-red-100 font-bold text-red-900" : "text-gray-300"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Model Evaluation Sandbox */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Live Multilingual Inference Sandbox
                </h3>
              </div>
              <p className="text-xs text-[#64748B]">
                Test arbitrary citizen inquiries in Hindi, English, Punjabi, or Hinglish against the production pipeline.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Type or paste query..."
                  className="flex-1 p-3 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                />
                <button
                  onClick={handleRunTest}
                  disabled={testing}
                  className="px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {testing ? "Evaluating..." : "Run Inference"}
                </button>
              </div>

              {testResult && (
                <div className="mt-4 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#64748B]">Detected Language:</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] uppercase">
                      {testResult.language}
                    </span>
                    <span className="text-xs font-bold text-[#64748B] ml-2">Classified Intent:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#D97706] border border-amber-200 text-xs font-bold">
                      {testResult.intent?.primary_intent || "GENERAL_WELFARE"}
                    </span>
                    {testResult.intent?.confidence && (
                      <span className="text-xs text-[#64748B] font-mono">
                        ({(testResult.intent.confidence * 100).toFixed(0)}% confidence)
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-[#64748B]">Extracted Citizen Profile:</span>
                    <pre className="p-3 bg-white rounded-xl border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A] overflow-x-auto">
                      {JSON.stringify(testResult.profile || {}, null, 2)}
                    </pre>
                  </div>

                  {testResult.results && (
                    <div className="text-xs text-[#64748B]">
                      Verified Schemes Matched: <strong className="text-[#0F172A]">{testResult.results.length}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

