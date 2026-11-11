/**
 * POST /api/ai/tts
 * Server-Side Natural Multilingual Text-to-Speech Engine
 * Supports Hindi, Punjabi, and Indian English with high-fidelity voices.
 *
 * Integrates with:
 * 1. Local AI4Bharat Indic-TTS / edge-tts microservice via process.env.ML_SERVICE_URL
 * 2. OpenAI Audio Speech API if OPENAI_API_KEY is present
 * 3. Graceful fallback signaling client to use browser speech synthesis
 */

const VOICE_MAP = {
  hi: {
    edge: "hi-IN-SwaraNeural",
    openai: "nova",
    langCode: "hi-IN"
  },
  pa: {
    edge: "pa-IN-GurpreetNeural",
    openai: "alloy",
    langCode: "pa-IN"
  },
  en: {
    edge: "en-IN-NeerjaNeural",
    openai: "shimmer",
    langCode: "en-IN"
  }
};

async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { text, language = 'en', voice } = body || {};

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return Response.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const trimmed = text.trim();
    const cleanLang = (language.split('-')[0] || 'en').toLowerCase();
    const voiceConfig = VOICE_MAP[cleanLang] || VOICE_MAP.en;

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    const openAiApiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

    // 1. Try Local AI4Bharat / Indic-TTS microservice
    if (mlServiceUrl) {
      try {
        const res = await fetch(`${mlServiceUrl.replace(/\/$/, '')}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmed,
            language: cleanLang,
            voice: voice || voiceConfig.edge
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (res.ok) {
          const audioBuffer = await res.arrayBuffer();
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Disposition': 'inline; filename="yojanasathi_speech.mp3"'
            }
          });
        }
      } catch (err) {
        console.warn('[TTS] Local ML speech service unreachable:', err.message);
      }
    }

    // 2. Try OpenAI Audio Speech API (tts-1)
    if (openAiApiKey && process.env.LLM_PROVIDER === 'openai') {
      try {
        const res = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: trimmed,
            voice: voiceConfig.openai
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (res.ok) {
          const audioBuffer = await res.arrayBuffer();
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Disposition': 'inline; filename="yojanasathi_speech.mp3"'
            }
          });
        }
      } catch (err) {
        console.warn('[TTS] OpenAI Speech API call failed:', err.message);
      }
    }

    // 3. Fallback response for client-side Web Speech API
    return Response.json({
      audioUrl: null,
      message: 'Server-side TTS requires active ML_SERVICE_URL or OPENAI_API_KEY. Use client Web Speech synthesis.',
      fallbackToWebSpeech: true,
      langCode: voiceConfig.langCode,
      text: trimmed
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

module.exports = { POST };
