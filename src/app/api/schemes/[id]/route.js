const { prisma } = require('../../../../lib/prisma.js');

async function GET(request, context) {
  try {
    const params = context?.params ? await context.params : {};
    const id = params?.id;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return Response.json(
        { error: 'Scheme ID is required' },
        { status: 400 }
      );
    }

    const scheme = await prisma.scheme.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        eligibilityRules: {
          where: { isVerified: true },
          orderBy: { createdAt: 'asc' }
        },
        mappings: {
          include: {
            governmentScheme: {
              select: {
                schemeName: true,
                sourceUrl: true,
                sourceName: true,
                officialUrl: true,
                description: true,
                benefits: true,
                targetBeneficiaries: true,
                eligibilityText: true,
                applicationProcess: true,
                requiredDocuments: true,
                sourceLastUpdated: true
              }
            }
          }
        }
      }
    });

    if (!scheme) {
      return Response.json(
        { error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return Response.json(scheme);
  } catch (error) {
    return Response.json(
      { error: 'An unexpected database error occurred while retrieving scheme details.' },
      { status: 500 }
    );
  }
}

module.exports = { GET };
