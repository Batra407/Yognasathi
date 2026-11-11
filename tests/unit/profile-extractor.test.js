const { extractUserProfile } = require('../../src/lib/government/profile-extractor.js');

describe('User Profile Extractor Unit Tests', () => {
  test('extracts full profile from English text', () => {
    const text = 'I am a 35 year old farmer from Punjab with an annual income of 2 lakh.';
    const res = extractUserProfile(text);

    expect(res.profile.age).toBe(35);
    expect(res.profile.occupation).toBe('farmer');
    expect(res.profile.state).toBe('Punjab');
    expect(res.profile.annualIncome).toBe(200000);
    expect(res.extractedFields).toContain('age');
    expect(res.extractedFields).toContain('occupation');
    expect(res.extractedFields).toContain('state');
    expect(res.extractedFields).toContain('annualIncome');
  });

  test('extracts full profile from Hindi text', () => {
    const text = 'मैं 35 साल का पंजाब का किसान हूँ और मेरी सालाना आय 2 लाख है।';
    const res = extractUserProfile(text);

    expect(res.profile.age).toBe(35);
    expect(res.profile.occupation).toBe('farmer');
    expect(res.profile.state).toBe('Punjab');
    expect(res.profile.annualIncome).toBe(200000);
  });

  test('extracts full profile from Punjabi text', () => {
    const text = 'ਮੈਂ 35 ਸਾਲ ਦਾ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੇਰੀ ਸਾਲਾਨਾ ਆਮਦਨ 2 ਲੱਖ ਹੈ।';
    const res = extractUserProfile(text);

    expect(res.profile.age).toBe(35);
    expect(res.profile.occupation).toBe('farmer');
    expect(res.profile.state).toBe('Punjab');
    expect(res.profile.annualIncome).toBe(200000);
  });

  test('extracts profile from Hinglish text', () => {
    const text = 'Main Punjab ka farmer hoon, meri age 35 hai aur income 2 lakh hai.';
    const res = extractUserProfile(text);

    expect(res.profile.age).toBe(35);
    expect(res.profile.occupation).toBe('farmer');
    expect(res.profile.state).toBe('Punjab');
    expect(res.profile.annualIncome).toBe(200000);
  });

  test('does not invent missing profile fields', () => {
    const text = 'मैं किसान हूँ';
    const res = extractUserProfile(text);

    expect(res.profile.occupation).toBe('farmer');
    expect(res.profile.age).toBeUndefined();
    expect(res.profile.state).toBeUndefined();
    expect(res.profile.annualIncome).toBeUndefined();
    expect(res.profile.gender).toBeUndefined();
  });

  test('handles ambiguous loan context without setting annual income', () => {
    const text = 'मुझे 2 लाख का लोन चाहिए';
    const res = extractUserProfile(text);

    expect(res.profile.annualIncome).toBeUndefined();
  });

  test('extracts female gender', () => {
    const text = 'मैं महिला किसान हूँ';
    const res = extractUserProfile(text);

    expect(res.profile.gender).toBe('female');
    expect(res.profile.occupation).toBe('farmer');
  });

  test('extracts land holding', () => {
    const text = 'मेरे पास 2 एकड़ जमीन है';
    const res = extractUserProfile(text);

    expect(res.profile.landHolding).toBe(2);
  });

  test('handles invalid input cleanly', () => {
    const resEmpty = extractUserProfile('');
    expect(resEmpty.error).toBeDefined();
    expect(resEmpty.status).toBe(400);

    const resNull = extractUserProfile(null);
    expect(resNull.error).toBeDefined();
  });
});
