"use client";

export default function TrustNotice({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#17243A] text-xs leading-relaxed">
        <svg className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          <span className="font-semibold text-[#14233B]">Trust Notice:</span> Eligibility information is based solely on verified rules available in our database. Always confirm final eligibility with the official government portal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#FFFFFF] text-[#17243A] border border-[#E5EAF1] shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#14233B] flex items-center gap-2">
            Verified Guidance Notice
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              Government Intelligence
            </span>
          </h4>
          <p className="text-xs text-[#68758A] leading-relaxed">
            Eligibility assessments and scheme discovery are automated informational tools based strictly on published government guidelines. This platform does not issue legally binding sanctions or disburse funds; the final decision rests solely with the competent government department.
          </p>
        </div>
      </div>
    </div>
  );
}
