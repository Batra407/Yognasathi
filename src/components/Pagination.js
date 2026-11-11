"use client";

/**
 * Pagination — accessible, keyboard-operable pagination control.
 * Renders Previous / Next and up to 7 page number buttons.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const delta = 2;
    const left = page - delta;
    const right = page + delta;

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-2 text-slate-400 text-sm select-none"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={p === page}
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[var(--navy-700)] text-white cursor-default shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
