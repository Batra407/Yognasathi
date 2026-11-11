/**
 * LoadingSkeleton — reusable skeleton placeholders.
 * Pass `variant="card"` for a scheme card, `variant="row"` for a table row,
 * or `variant="dept"` for a department card.
 */
export default function LoadingSkeleton({ variant = "card", count = 6 }) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            aria-hidden="true"
          >
            <div className="space-y-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-5 w-full rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "dept") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            aria-hidden="true"
          >
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // row fallback
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
          <div className="skeleton h-5 w-12 rounded" />
          <div className="skeleton h-5 flex-1 rounded" />
          <div className="skeleton h-5 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}
