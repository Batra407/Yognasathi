"use client";

export default function ProfileCard({ profile, onEditProfile }) {
  if (!profile || typeof profile !== "object") return null;

  const hasAge = profile.age !== undefined && profile.age !== null;
  const hasState = Boolean(profile.state);
  const hasOccupation = Boolean(profile.occupation);
  const hasIncome = profile.annualIncome !== undefined && profile.annualIncome !== null;
  const hasGender = Boolean(profile.gender);
  const hasCategory = Boolean(profile.casteCategory || profile.category);
  const categoryValue = profile.casteCategory || profile.category;
  const hasLand = profile.landHolding !== undefined && profile.landHolding !== null;
  const hasCrop = Boolean(profile.cropType || profile.crops);
  const cropValue = profile.cropType || (Array.isArray(profile.crops) ? profile.crops.join(', ') : profile.crops);
  const hasStudent = profile.isStudent !== undefined && profile.isStudent !== null;
  const hasDisability = profile.isDisability !== undefined && profile.isDisability !== null;

  const hasAnyField = hasAge || hasState || hasOccupation || hasIncome || hasGender || hasCategory || hasLand || hasCrop || hasStudent || hasDisability;

  if (!hasAnyField) {
    return (
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[#68758A]">
            Extracted User Profile
          </span>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Add profile details
            </button>
          )}
        </div>
        <p className="text-[#68758A] italic">
          No structured profile attributes extracted yet. Add age, state, or occupation to evaluate exact criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5EAF1] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center font-bold text-xs">
            👤
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14233B]">
              Extracted User Profile
            </h4>
            <p className="text-[11px] text-[#68758A]">
              Normalized parameters identified from your input
            </p>
          </div>
        </div>

        {onEditProfile && (
          <button
            type="button"
            onClick={onEditProfile}
            className="px-3 py-1 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#17243A] border border-[#E5EAF1] text-xs font-semibold transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {hasAge && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Age</span>
            <span className="font-bold text-[#17243A] text-sm">{profile.age} years</span>
          </div>
        )}

        {hasState && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">State / Region</span>
            <span className="font-bold text-[#2563EB] text-sm">{profile.state}</span>
          </div>
        )}

        {hasOccupation && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Occupation</span>
            <span className="font-bold text-[#17243A] text-sm capitalize">{profile.occupation}</span>
          </div>
        )}

        {hasIncome && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Annual Income</span>
            <span className="font-bold text-[#15803D] text-sm">₹{Number(profile.annualIncome).toLocaleString('en-IN')}</span>
          </div>
        )}

        {hasCategory && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Category</span>
            <span className="font-bold text-[#17243A] text-sm uppercase">{categoryValue}</span>
          </div>
        )}

        {hasLand && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Land Holding</span>
            <span className="font-bold text-[#17243A] text-sm">{profile.landHolding} Acres</span>
          </div>
        )}

        {hasCrop && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Crops</span>
            <span className="font-bold text-[#15803D] text-sm">{cropValue}</span>
          </div>
        )}

        {hasStudent && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Student Status</span>
            <span className="font-bold text-[#17243A] text-sm">{profile.isStudent ? "Enrolled Student" : "No"}</span>
          </div>
        )}

        {hasDisability && (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <span className="text-[#68758A] block text-[10px] uppercase font-bold tracking-wider">Disability</span>
            <span className="font-bold text-[#17243A] text-sm">{profile.isDisability ? "Yes" : "No"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
