const { validateUserProfile, evaluateEligibility } = require('../../src/lib/government/eligibility-engine.js');

describe('Eligibility Engine Unit Tests', () => {
  describe('validateUserProfile', () => {
    test('passes valid profile', () => {
      const res = validateUserProfile({ age: 35, annualIncome: 200000, landHolding: 2 });
      expect(res.valid).toBe(true);
    });

    test('rejects non-object profile', () => {
      expect(validateUserProfile(null).valid).toBe(false);
      expect(validateUserProfile('invalid').valid).toBe(false);
      expect(validateUserProfile([]).valid).toBe(false);
    });

    test('rejects invalid age values', () => {
      expect(validateUserProfile({ age: -5 }).valid).toBe(false);
      expect(validateUserProfile({ age: 150 }).valid).toBe(false);
      expect(validateUserProfile({ age: 'thirty' }).valid).toBe(false);
    });

    test('rejects invalid income values', () => {
      expect(validateUserProfile({ annualIncome: -1000 }).valid).toBe(false);
      expect(validateUserProfile({ annualIncome: 'abc' }).valid).toBe(false);
    });

    test('rejects invalid land holding values', () => {
      expect(validateUserProfile({ landHolding: -1 }).valid).toBe(false);
      expect(validateUserProfile({ landHolding: 'invalid' }).valid).toBe(false);
    });
  });

  describe('evaluateEligibility', () => {
    const verifiedRuleSample = [{
      id: 'rule-sample-1',
      schemeId: 'scheme-1',
      ageMin: 18,
      ageMax: 40,
      gender: null,
      state: null,
      occupation: 'student',
      annualIncomeMin: null,
      annualIncomeMax: 350000.0,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      isVerified: true
    }];

    test('evaluates ELIGIBLE status when all applicable verified criteria pass', () => {
      const userProfile = { age: 22, occupation: 'student', annualIncome: 200000 };
      const res = evaluateEligibility(userProfile, verifiedRuleSample, 'scheme-1');

      expect(res.eligibilityStatus).toBe('ELIGIBLE');
      expect(res.matchedCriteria.length).toBeGreaterThan(0);
      expect(res.failedCriteria.length).toBe(0);
      expect(res.missingInformation.length).toBe(0);
    });

    test('evaluates NOT_ELIGIBLE status when mandatory verified criterion fails', () => {
      const userProfile = { age: 50, occupation: 'student', annualIncome: 200000 }; // age > 40
      const res = evaluateEligibility(userProfile, verifiedRuleSample, 'scheme-1');

      expect(res.eligibilityStatus).toBe('NOT_ELIGIBLE');
      expect(res.failedCriteria.some(c => c.field === 'age')).toBe(true);
    });

    test('evaluates INSUFFICIENT_INFORMATION when mandatory profile field is missing', () => {
      const userProfile = { occupation: 'student' }; // age & annualIncome missing
      const res = evaluateEligibility(userProfile, verifiedRuleSample, 'scheme-1');

      expect(res.eligibilityStatus).toBe('INSUFFICIENT_INFORMATION');
      expect(res.missingInformation).toContain('annualIncome');
    });

    test('evaluates INSUFFICIENT_INFORMATION when scheme has 0 verified rules', () => {
      const userProfile = { age: 25, occupation: 'student' };
      const res = evaluateEligibility(userProfile, [], 'scheme-no-rules');

      expect(res.eligibilityStatus).toBe('INSUFFICIENT_INFORMATION');
      expect(res.matchedCriteria.length).toBe(0);
      expect(res.officialVerificationRequired).toBe(true);
    });

    test('ignores rules where isVerified = false', () => {
      const unverifiedRules = [{
        id: 'unverified-1',
        schemeId: 'scheme-unverified',
        ageMin: 18,
        isVerified: false
      }];

      const res = evaluateEligibility({ age: 25 }, unverifiedRules, 'scheme-unverified');
      expect(res.eligibilityStatus).toBe('INSUFFICIENT_INFORMATION');
      expect(res.matchedCriteria.length).toBe(0);
    });
  });
});
