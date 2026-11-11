const { prisma } = require('../../../../../lib/prisma.js');

async function GET(request, context) {
  try {
    const params = context?.params ? await context.params : {};
    const schemeId = params?.schemeId;

    if (!schemeId || typeof schemeId !== 'string' || schemeId.trim() === '') {
      return Response.json(
        { error: 'schemeId parameter is required.' },
        { status: 400 }
      );
    }

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

    return Response.json({
      schemeId: scheme.id,
      schemeName: scheme.schemeName,
      department: scheme.department?.name || 'Unknown',
      rules: scheme.eligibilityRules || []
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while fetching eligibility rules.' },
      { status: 500 }
    );
  }
}

module.exports = { GET };
