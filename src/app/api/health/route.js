import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const startTime = Date.now();

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: "UNKNOWN",
    ml_model: "UNKNOWN",
    schemes_count: 0
  };

  let isHealthy = true;

  // 1. Probe Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.scheme.count();
    checks.database = "CONNECTED";
    checks.schemes_count = count;
  } catch (dbErr) {
    checks.database = `DISCONNECTED: ${dbErr.message}`;
    isHealthy = false;
  }

  // 2. Probe ML Model Artifact
  try {
    const modelPath = path.join(process.cwd(), "ml", "models", "intent_classifier_12class.joblib");
    if (fs.existsSync(modelPath)) {
      checks.ml_model = "READY";
    } else {
      checks.ml_model = "MISSING_ARTIFACT";
    }
  } catch (mlErr) {
    checks.ml_model = `ERROR: ${mlErr.message}`;
  }

  const payload = {
    status: isHealthy ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    checks
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}

