const { prisma } = require('../../../../lib/prisma.js');
const { validateUserProfile, evaluateEligibility } = require('../../../../lib/government/eligibility-engine.js');

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

    const { schemeId, profile } = body || {};

    if (!schemeId || typeof schemeId !== 'string' || schemeId.trim() === '') {
      return Response.json(
        { error: 'schemeId parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // Validate profile structure
    const validation = validateUserProfile(profile);
    if (!validation.valid) {
      return Response.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Retrieve verified rules for scheme from PostgreSQL (Dataset C)
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
      include: {
        department: {
          select: { name: true }
        },
        eligibilityRules: {
          where: { isVerified: true }
        }
      }
    });

    if (!scheme) {
      return Response.json(
        { error: `Scheme with ID "${schemeId}" not found.` },
        { status: 404 }
      );
    }

    const verifiedRules = scheme.eligibilityRules || [];
    const evaluation = evaluateEligibility(profile, verifiedRules, scheme.id);

    return Response.json({
      schemeId: scheme.id,
      schemeName: scheme.schemeName,
      department: scheme.department?.name || 'Unknown',
      eligibilityStatus: evaluation.eligibilityStatus,
      matchedCriteria: evaluation.matchedCriteria,
      failedCriteria: evaluation.failedCriteria,
      missingInformation: evaluation.missingInformation,
      unresolvedConditions: evaluation.unresolvedConditions,
      officialVerificationRequired: evaluation.officialVerificationRequired,
      verifiedRulesCount: verifiedRules.length
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while evaluating scheme eligibility.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };
