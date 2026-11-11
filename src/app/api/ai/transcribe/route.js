/**
 * POST /api/ai/transcribe
 * Speech-to-text processing for YojanaSathi voice queries.
 *
 * Accepts multipart/form-data containing:
 * - audio (Blob/File)
 * - language (optional, e.g. "hi-IN", "pa-IN", "en-IN")
 *
 * Integrates with:
 * 1. Local Python/FastAPI ML service at process.env.ML_SERVICE_URL/transcribe (Whisper / AI4Bharat)
 * 2. OpenAI Whisper API if OPENAI_API_KEY is present
 * 3. Graceful fallback advising client-side Web Speech recognition
 */

const { detectLanguage } = require('../../../../lib/nlp.js');

async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const languageHint = formData.get('language') || 'auto';

    if (!audioFile) {
      return Response.json(
        { error: 'No audio file provided in request.' },
        { status: 400 }
      );
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    const openAiApiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

    // Strategy 1: Forward to local Python ML Service (Whisper/AI4Bharat pipeline)
    if (mlServiceUrl) {
      try {
        const mlFormData = new FormData();
        mlFormData.append('audio', audioFile);
        mlFormData.append('language', languageHint);

        const response = await fetch(`${mlServiceUrl.replace(/\/$/, '')}/transcribe`, {
          method: 'POST',
          body: mlFormData,
          signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
          const result = await response.json();
          const detected = detectLanguage(result.text || '');
          return Response.json({
            text: result.text,
            language: result.language || detected,
            engine: 'ml-local-whisper',
            confidence: result.confidence || 0.95
          });
        }
      } catch (err) {
        console.warn('ML transcribe service unavailable, attempting fallback:', err.message);
      }
    }

    // Strategy 2: Official OpenAI Whisper API
    if (openAiApiKey && process.env.LLM_PROVIDER === 'openai') {
      try {
        const whisperData = new FormData();
        whisperData.append('file', audioFile);
        whisperData.append('model', 'whisper-1');
        if (languageHint && languageHint !== 'auto') {
          whisperData.append('language', languageHint.split('-')[0]);
        }

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiApiKey}`
          },
          body: whisperData,
          signal: AbortSignal.timeout(20000)
        });

        if (whisperRes.ok) {
          const result = await whisperRes.json();
          const detected = detectLanguage(result.text || '');
          return Response.json({
            text: result.text,
            language: detected,
            engine: 'openai-whisper-api',
            confidence: 0.98
          });
        }
      } catch (err) {
        console.warn('Whisper API call failed:', err.message);
      }
    }

    // Strategy 3: Graceful response explaining offline mode
    return Response.json({
      text: null,
      message: 'Server-side speech engine requires active ML_SERVICE_URL or OPENAI_API_KEY. Use client-side Web Speech API.',
      engine: 'fallback-browser-speech',
      supportedClientLangs: ['hi-IN', 'pa-IN', 'en-IN']
    }, { status: 200 });

  } catch (error) {
    return Response.json(
      { error: 'Audio transcription failed', details: error.message },
      { status: 500 }
    );
  }
}

module.exports = { POST };

