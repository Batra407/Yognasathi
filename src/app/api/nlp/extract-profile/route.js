const { extractUserProfile } = require('../../../../lib/government/profile-extractor.js');

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

    const extractionResult = extractUserProfile(text);

    return Response.json(extractionResult);
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while extracting user profile.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };
