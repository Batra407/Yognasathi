"use client";

export default function MissingInformation({
  missingInformation = [],
  missingFields = [],
  onProvideInfo,
  onSelectField
}) {
  const fields = missingFields.length > 0 ? missingFields : missingInformation;
  if (!fields || fields.length === 0) return null;

  const fieldLabels = {
    age: "Age / Date of Birth",
    annualIncome: "Annual Household Income",
    state: "State of Residence",
    occupation: "Primary Occupation / Trade",
    gender: "Gender",
    casteCategory: "Social Category (General / SC / ST / OBC)",
    landHolding: "Agricultural Land Holding (Acres)"
  };

  return (
    <div className="p-5 rounded-2xl bg-[#171a25] border border-amber-500/30 text-amber-200 space-y-3.5 shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
            Eligibility Information Required
          </span>
          <p className="text-[11px] text-slate-300">
            Official government criteria require these parameters to confirm your scheme qualification:
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {fields.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectField && onSelectField(item)}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-amber-400 font-bold">+</span>
            <span>{fieldLabels[item] || item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
