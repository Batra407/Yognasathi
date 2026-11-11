const { detectLanguage, extractKeywordsAndNormalize } = require('../../../../lib/nlp.js');

async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const text = body?.text;

    if (text === undefined || text === null || typeof text !== 'string' || text.trim() === '') {
      return Response.json(
        { error: 'Text parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const language = detectLanguage(trimmedText);
    const { normalizedQuery, keywords } = extractKeywordsAndNormalize(trimmedText);

    return Response.json({
      originalText: trimmedText,
      language,
      normalizedQuery,
      keywords
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while analyzing input text.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };
