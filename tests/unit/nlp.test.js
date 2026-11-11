const { detectLanguage, extractKeywordsAndNormalize } = require('../../src/lib/nlp.js');

describe('Multilingual NLP Unit Tests', () => {
  describe('Language Detection (detectLanguage)', () => {
    test('detects English language', () => {
      expect(detectLanguage('I am a farmer looking for agriculture support')).toBe('en');
    });

    test('detects Hindi language', () => {
      expect(detectLanguage('मुझे किसानों के लिए सरकारी योजना चाहिए')).toBe('hi');
    });

    test('detects Punjabi language', () => {
      expect(detectLanguage('ਮੈਂ ਇੱਕ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਖੇਤੀਬਾੜੀ ਲਈ ਸਰਕਾਰੀ ਯੋਜਨਾ ਚਾਹੁੰਦਾ ਹਾਂ')).toBe('pa');
    });

    test('detects Bengali language', () => {
      expect(detectLanguage('আমার কৃষকদের জন্য সরকারি প্রকল্প দরকার')).toBe('bn');
    });

    test('detects Marathi language', () => {
      expect(detectLanguage('मला शेतकऱ्यांसाठी सरकारी योजना हवी आहे')).toBe('mr');
    });

    test('detects Gujarati language', () => {
      expect(detectLanguage('મારે ખેડૂતો માટે સરકારી યોજના જોઈએ')).toBe('gu');
    });

    test('detects Tamil language', () => {
      expect(detectLanguage('எனக்கு விவசாயிகளுக்கான அரசு திட்டம் வேண்டும்')).toBe('ta');
    });

    test('detects Telugu language', () => {
      expect(detectLanguage('నాకు రైతుల కోసం ప్రభుత్వ పథకం కావాలి')).toBe('te');
    });

    test('detects Kannada language', () => {
      expect(detectLanguage('ನನಗೆ ರೈತರಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆ ಬೇಕು')).toBe('kn');
    });

    test('detects Malayalam language', () => {
      expect(detectLanguage('എനിക്ക് കർഷകർക്കായി സർക്കാർ പദ്ധതി വേണം')).toBe('ml');
    });

    test('detects Mixed language when multiple script families are present', () => {
      expect(detectLanguage('I am किसान and need an agriculture scheme')).toBe('mixed');
    });

    test('returns unknown for empty or whitespace text', () => {
      expect(detectLanguage('')).toBe('unknown');
      expect(detectLanguage('   ')).toBe('unknown');
      expect(detectLanguage(null)).toBe('unknown');
    });
  });

  describe('Keyword Extraction and Query Normalization (extractKeywordsAndNormalize)', () => {
    test('extracts farmer/agriculture keywords from English', () => {
      const { keywords, normalizedQuery } = extractKeywordsAndNormalize('I am a farmer looking for agriculture support');
      expect(keywords).toContain('farmer');
      expect(normalizedQuery).toContain('farmer');
    });

    test('normalizes Hindi query to canonical English concepts', () => {
      const { keywords, normalizedQuery } = extractKeywordsAndNormalize('मुझे किसानों के लिए सरकारी योजना चाहिए');
      expect(keywords).toContain('farmer');
      expect(normalizedQuery).toContain('farmer');
    });

    test('normalizes Punjabi query to canonical English concepts', () => {
      const { keywords, normalizedQuery } = extractKeywordsAndNormalize('ਮੈਂ ਇੱਕ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਖੇਤੀਬਾੜੀ ਲਈ ਸਰਕਾਰੀ ਯੋਜਨਾ ਚਾਹੁੰਦਾ ਹਾਂ');
      expect(keywords).toContain('farmer');
      expect(normalizedQuery).toContain('farmer');
    });

    test('extracts student/scholarship keywords', () => {
      const { keywords } = extractKeywordsAndNormalize('I am a student looking for scholarship');
      expect(keywords).toContain('student');
    });
  });
});
