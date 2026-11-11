const { prisma } = require('../src/lib/prisma.js');

async function initSessionTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS conversation_sessions (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        profile JSONB NOT NULL DEFAULT '{}'::jsonb,
        messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        consent_given BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ttl_minutes INTEGER NOT NULL DEFAULT 1440
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_conversation_sessions_session_id ON conversation_sessions(session_id);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_conversation_sessions_last_active ON conversation_sessions(last_active);
    `);

    console.log('PostgreSQL conversation_sessions table verified and ready.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize session table in PostgreSQL:', err.message);
    process.exit(1);
  }
}

initSessionTable();
