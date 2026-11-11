/**
 * /api/ai/session
 * Session management endpoint for YojanaSathi 2.0 AI Brain.
 *
 * GET:
 *   ?sessionId=... -> returns { sessionId, profile, messageCount, messages, activeSessions }
 *
 * DELETE:
 *   ?sessionId=... -> clears session profile and conversation history
 */

const {
  getSession,
  getProfile,
  getMessages,
  clearSession,
  activeSessionCount
} = require('../../../../lib/conversationMemory.js');

async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json(
        {
          error: 'sessionId query parameter is required',
          activeSessions: activeSessionCount()
        },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    const profile = getProfile(sessionId);
    const messages = getMessages(sessionId);

    return Response.json({
      sessionId,
      profile,
      messageCount: messages.length,
      messages,
      lastActive: new Date(session.lastActive).toISOString(),
      activeSessions: activeSessionCount()
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to retrieve session state', details: error.message },
      { status: 500 }
    );
  }
}

async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json(
        { error: 'sessionId query parameter is required' },
        { status: 400 }
      );
    }

    clearSession(sessionId);

    return Response.json({
      success: true,
      sessionId,
      message: 'Session cleared successfully',
      activeSessions: activeSessionCount()
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to clear session', details: error.message },
      { status: 500 }
    );
  }
}

module.exports = { GET, DELETE };

