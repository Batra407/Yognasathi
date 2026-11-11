/**
 * Deterministic Government Scheme Eligibility Engine
 * Evaluates normalized user profiles strictly against verified Dataset C eligibility rules.
 */

/**
 * Validates user profile fields and types.
 * Returns { valid: true } or { valid: false, error: "..." }
 */
function validateUserProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return { valid: false, error: 'User profile must be a valid JSON object.' };
  }

  if (profile.age !== undefined && profile.age !== null) {
    if (typeof profile.age !== 'number' || !Number.isInteger(profile.age) || profile.age <= 0 || profile.age > 120) {
      return { valid: false, error: 'Age must be a positive integer between 1 and 120.' };
    }
  }

  if (profile.annualIncome !== undefined && profile.annualIncome !== null) {
    if (typeof profile.annualIncome !== 'number' || isNaN(profile.annualIncome) || profile.annualIncome < 0) {
      return { valid: false, error: 'Annual income must be a non-negative number.' };
    }
  }

  if (profile.landHolding !== undefined && profile.landHolding !== null) {
    if (typeof profile.landHolding !== 'number' || isNaN(profile.landHolding) || profile.landHolding < 0) {
      return { valid: false, error: 'Land holding must be a non-negative number.' };
    }
  }

  return { valid: true };
}

/**
 * Evaluates a user profile against a set of Dataset C eligibility rules.
 * ONLY evaluates rules where isVerified = true.
 */
function evaluateEligibility(userProfile, rules, schemeId) {
  // Validate profile types first
  const validation = validateUserProfile(userProfile);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Filter strictly for verified rules
  const verifiedRules = (rules || []).filter(r => r && r.isVerified === true);

  if (verifiedRules.length === 0) {
    return {
      schemeId: schemeId || null,
      eligibilityStatus: 'INSUFFICIENT_INFORMATION',
      matchedCriteria: [],
      failedCriteria: [],
      missingInformation: ['No verified eligibility rules available for this scheme'],
      unresolvedConditions: [],
      officialVerificationRequired: true
    };
  }

  const matchedCriteria = [];
  const failedCriteria = [];
  const missingInformation = [];
  const unresolvedConditions = [];

  for (const rule of verifiedRules) {
    // 1. Age Range Evaluation
    if (rule.ageMin !== null || rule.ageMax !== null) {
      if (userProfile.age === undefined || userProfile.age === null) {
        missingInformation.push('age');
      } else {
        const userAge = userProfile.age;
        let passAge = true;
        if (rule.ageMin !== null && userAge < rule.ageMin) passAge = false;
        if (rule.ageMax !== null && userAge > rule.ageMax) passAge = false;

        if (passAge) {
          matchedCriteria.push({
            field: 'age',
            userValue: userAge,
            required: { ageMin: rule.ageMin, ageMax: rule.ageMax },
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'age',
            userValue: userAge,
            required: { ageMin: rule.ageMin, ageMax: rule.ageMax },
            status: 'FAIL'
          });
        }
      }
    }

    // 2. Gender Evaluation
    if (rule.gender && rule.gender.trim() !== '' && rule.gender.toLowerCase() !== 'all') {
      if (!userProfile.gender) {
        missingInformation.push('gender');
      } else {
        const uGen = userProfile.gender.trim().toLowerCase();
        const rGen = rule.gender.trim().toLowerCase();
        if (uGen === rGen || rGen === 'all') {
          matchedCriteria.push({
            field: 'gender',
            userValue: userProfile.gender,
            requiredValue: rule.gender,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'gender',
            userValue: userProfile.gender,
            requiredValue: rule.gender,
            status: 'FAIL'
          });
        }
      }
    }

    // 3. State Evaluation
    if (rule.state && rule.state.trim() !== '' && rule.state.toLowerCase() !== 'all') {
      if (!userProfile.state) {
        missingInformation.push('state');
      } else {
        const uState = userProfile.state.trim().toLowerCase();
        const rState = rule.state.trim().toLowerCase();
        if (uState === rState || rState === 'all' || rState === 'all states') {
          matchedCriteria.push({
            field: 'state',
            userValue: userProfile.state,
            requiredValue: rule.state,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'state',
            userValue: userProfile.state,
            requiredValue: rule.state,
            status: 'FAIL'
          });
        }
      }
    }

    // 4. Occupation Evaluation
    if (rule.occupation && rule.occupation.trim() !== '') {
      if (!userProfile.occupation) {
        missingInformation.push('occupation');
      } else {
        const uOcc = userProfile.occupation.trim().toLowerCase();
        const rOcc = rule.occupation.trim().toLowerCase();
        if (uOcc.includes(rOcc) || rOcc.includes(uOcc)) {
          matchedCriteria.push({
            field: 'occupation',
            userValue: userProfile.occupation,
            requiredValue: rule.occupation,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'occupation',
            userValue: userProfile.occupation,
            requiredValue: rule.occupation,
            status: 'FAIL'
          });
        }
      }
    }

    // 5. Annual Income Evaluation
    if (rule.annualIncomeMin !== null || rule.annualIncomeMax !== null) {
      if (userProfile.annualIncome === undefined || userProfile.annualIncome === null) {
        missingInformation.push('annualIncome');
      } else {
        const uInc = userProfile.annualIncome;
        let passInc = true;
        if (rule.annualIncomeMin !== null && uInc < rule.annualIncomeMin) passInc = false;
        if (rule.annualIncomeMax !== null && uInc > rule.annualIncomeMax) passInc = false;

        if (passInc) {
          matchedCriteria.push({
            field: 'annualIncome',
            userValue: uInc,
            required: { annualIncomeMin: rule.annualIncomeMin, annualIncomeMax: rule.annualIncomeMax },
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'annualIncome',
            userValue: uInc,
            required: { annualIncomeMin: rule.annualIncomeMin, annualIncomeMax: rule.annualIncomeMax },
            status: 'FAIL'
          });
        }
      }
    }

    // 6. Category Evaluation
    if (rule.category && rule.category.trim() !== '') {
      if (!userProfile.category) {
        missingInformation.push('category');
      } else {
        const uCat = userProfile.category.trim().toLowerCase();
        const rCat = rule.category.trim().toLowerCase();
        if (rCat.includes(uCat) || uCat.includes(rCat)) {
          matchedCriteria.push({
            field: 'category',
            userValue: userProfile.category,
            requiredValue: rule.category,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'category',
            userValue: userProfile.category,
            requiredValue: rule.category,
            status: 'FAIL'
          });
        }
      }
    }

    // 7. Residency Evaluation
    if (rule.residency && rule.residency.trim() !== '') {
      if (!userProfile.residency) {
        missingInformation.push('residency');
      } else {
        const uRes = userProfile.residency.trim().toLowerCase();
        const rRes = rule.residency.trim().toLowerCase();
        if (rRes.includes('indian') || rRes.includes('resident') || uRes === rRes || rRes.includes(uRes) || uRes.includes(rRes)) {
          matchedCriteria.push({
            field: 'residency',
            userValue: userProfile.residency,
            requiredValue: rule.residency,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'residency',
            userValue: userProfile.residency,
            requiredValue: rule.residency,
            status: 'FAIL'
          });
        }
      }
    }

    // 8. Land Holding Evaluation
    if (rule.landHoldingMin !== null || rule.landHoldingMax !== null) {
      if (userProfile.landHolding === undefined || userProfile.landHolding === null) {
        missingInformation.push('landHolding');
      } else {
        const uLand = userProfile.landHolding;
        let passLand = true;
        if (rule.landHoldingMin !== null && uLand < rule.landHoldingMin) passLand = false;
        if (rule.landHoldingMax !== null && uLand > rule.landHoldingMax) passLand = false;

        if (passLand) {
          matchedCriteria.push({
            field: 'landHolding',
            userValue: uLand,
            required: { landHoldingMin: rule.landHoldingMin, landHoldingMax: rule.landHoldingMax },
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'landHolding',
            userValue: uLand,
            required: { landHoldingMin: rule.landHoldingMin, landHoldingMax: rule.landHoldingMax },
            status: 'FAIL'
          });
        }
      }
    }

    // 9. Employment Status Evaluation
    if (rule.employmentStatus && rule.employmentStatus.trim() !== '') {
      if (!userProfile.employmentStatus) {
        missingInformation.push('employmentStatus');
      } else {
        const uEmp = userProfile.employmentStatus.trim().toLowerCase();
        const rEmp = rule.employmentStatus.trim().toLowerCase();
        if (uEmp.includes(rEmp) || rEmp.includes(uEmp)) {
          matchedCriteria.push({
            field: 'employmentStatus',
            userValue: userProfile.employmentStatus,
            requiredValue: rule.employmentStatus,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'employmentStatus',
            userValue: userProfile.employmentStatus,
            requiredValue: rule.employmentStatus,
            status: 'FAIL'
          });
        }
      }
    }

    // 10. Disability Status Evaluation
    if (rule.disabilityStatus && rule.disabilityStatus.trim() !== '') {
      if (userProfile.disabilityStatus === undefined || userProfile.disabilityStatus === null) {
        missingInformation.push('disabilityStatus');
      } else {
        const uDis = userProfile.disabilityStatus;
        if (uDis === true || uDis === 'yes' || (typeof uDis === 'string' && uDis.trim().length > 0 && uDis !== 'false' && uDis !== 'no')) {
          matchedCriteria.push({
            field: 'disabilityStatus',
            userValue: userProfile.disabilityStatus,
            requiredValue: rule.disabilityStatus,
            status: 'PASS'
          });
        } else {
          failedCriteria.push({
            field: 'disabilityStatus',
            userValue: userProfile.disabilityStatus,
            requiredValue: rule.disabilityStatus,
            status: 'FAIL'
          });
        }
      }
    }
  }

  const uniqueMissing = Array.from(new Set(missingInformation));

  // Determine overall status using strict priority:
  // IF any mandatory verified criterion FAILS -> NOT_ELIGIBLE
  // ELSE IF any mandatory verified criterion is MISSING or unresolved -> INSUFFICIENT_INFORMATION
  // ELSE IF all applicable verified criteria PASS -> ELIGIBLE
  let eligibilityStatus = 'INSUFFICIENT_INFORMATION';

  if (failedCriteria.length > 0) {
    eligibilityStatus = 'NOT_ELIGIBLE';
  } else if (uniqueMissing.length > 0 || unresolvedConditions.length > 0) {
    eligibilityStatus = 'INSUFFICIENT_INFORMATION';
  } else if (matchedCriteria.length > 0) {
    eligibilityStatus = 'ELIGIBLE';
  }

  return {
    schemeId: schemeId || null,
    eligibilityStatus,
    matchedCriteria,
    failedCriteria,
    missingInformation: uniqueMissing,
    unresolvedConditions,
    officialVerificationRequired: true
  };
}

module.exports = {
  validateUserProfile,
  evaluateEligibility
};
