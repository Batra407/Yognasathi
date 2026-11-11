"use client";

import Link from "next/link";

/**
 * DepartmentCard — displays a department/ministry with scheme count and a link
 * to filter the scheme listing by that department.
 * Styled in Premium White + Navy + Blue design system.
 */
export default function DepartmentCard({ department }) {
  if (!department) return null;

  const schemeCount = department._count?.schemes ?? 0;

  return (
    <article className="card-interactive group flex flex-col h-full bg-white rounded-2xl border border-[#E5EAF1] hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 space-y-4">
      {/* Icon + Name */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#14233B] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {department.name}
          </h3>
        </div>
      </div>

      {/* Scheme count badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F7F9FC] border border-[#E5EAF1] text-[#17243A]">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {schemeCount} {schemeCount === 1 ? "scheme" : "schemes"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action: link to schemes filtered by this dept */}
      <div className="pt-2 border-t border-[#E5EAF1]">
        <Link
          href={`/schemes?department=${encodeURIComponent(department.id)}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          aria-label={`Browse schemes from ${department.name}`}
        >
          <span>Browse Schemes</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
