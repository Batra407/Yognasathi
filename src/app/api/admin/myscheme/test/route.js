import { NextResponse } from 'next/server';
import { validateApiConfig, fetchMySchemeData } from '@/lib/government/myscheme-api';

export async function GET() {
  // 1. Check Configuration First
  const configCheck = validateApiConfig();
  if (!configCheck.isValid) {
    return NextResponse.json({
      success: false,
      connected: false,
      status: 400,
      message: 'API credentials are required before real data can be retrieved.',
      missingCredentials: configCheck.missing,
      note: 'Please register on API Setu (https://apisetu.gov.in) and populate APISETU_CLIENT_ID and APISETU_API_KEY in .env'
    }, { status: 400 });
  }

  // 2. Make Official API Connection Request
  const result = await fetchMySchemeData({ page: 1, limit: 10 });

  // 3. Return Safe Test Response (No Credential Exposure)
  return NextResponse.json({
    success: result.success,
    connected: result.success,
    httpStatus: result.status,
    message: result.success ? 'Successfully connected to official myScheme API Setu endpoint.' : result.error,
    details: result.details || null,
    recordCount: result.recordCount || 0,
    pagination: result.pagination || null,
    rawPayloadSaved: result.success
  }, { status: result.status || 500 });
}
