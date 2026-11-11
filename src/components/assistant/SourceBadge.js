"use client";

export default function SourceBadge({ officialSource, rulesAvailable = true }) {
  if (!officialSource && !rulesAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
        <span>Source pending official link</span>
      </span>
    );
  }

  const sourceName = officialSource?.sourceName || "Official Government Source";
  const sourceUrl = officialSource?.sourceUrl;

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-[11px] transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span>{sourceName}</span>
        <span>↗</span>
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
      <span className="text-slate-500">Official:</span>
      <span className="text-[#2563EB] font-semibold">{sourceName}</span>
    </span>
  );
}
