const { prisma } = require('../../../lib/prisma.js');

const VALID_PUBLIC_RECORD_TYPES = ['CITIZEN_WELFARE_SCHEME'];

async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and sanitize pagination parameters
    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '20', 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department')?.trim() || '';
    const state = searchParams.get('state')?.trim() || '';
    const recordTypeParam = searchParams.get('recordType')?.trim();
    const isAdmin = searchParams.get('admin') === 'true';

    // Validate recordType parameter if explicitly provided for public requests
    if (!isAdmin && recordTypeParam && !VALID_PUBLIC_RECORD_TYPES.includes(recordTypeParam)) {
      return Response.json(
        {
          error: `Invalid recordType '${recordTypeParam}'. Public citizen portal only provides verified CITIZEN_WELFARE_SCHEME records.`
        },
        { status: 400 }
      );
    }

    // Public citizen API strictly serves CITIZEN_WELFARE_SCHEME
    // Budget accounting entries and unverified pending lines are never exposed here.
    const where = {
      isActive: true
    };

    if (!isAdmin) {
      where.recordType = 'CITIZEN_WELFARE_SCHEME';
    } else if (recordTypeParam) {
      where.recordType = recordTypeParam;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      if (searchLower === 'farmer' || searchLower === 'agriculture' || searchLower === 'kisan') {
        where.OR = [
          { schemeName: { contains: 'Farm', mode: 'insensitive' } },
          { schemeName: { contains: 'Kisan', mode: 'insensitive' } },
          { schemeName: { contains: 'Bhavantar', mode: 'insensitive' } },
          { schemeName: { contains: 'Mera Pani', mode: 'insensitive' } },
          { schemeName: { contains: 'Solar Water', mode: 'insensitive' } },
          { schemeName: { contains: 'Agriculture', mode: 'insensitive' } }
        ];
      } else if (searchLower === 'scholarship') {
        where.OR = [
          { schemeName: { contains: 'Scholarship', mode: 'insensitive' } },
          { schemeName: { contains: 'Chhatravriti', mode: 'insensitive' } },
          { schemeName: { contains: 'Student', mode: 'insensitive' } },
          { schemeName: { contains: 'Medhavi', mode: 'insensitive' } }
        ];
      } else {
        where.schemeName = {
          contains: search,
          mode: 'insensitive'
        };
      }
    }

    if (department) {
      where.OR = [
        { departmentId: department },
        { department: { name: { contains: department, mode: 'insensitive' } } }
      ];
    }

    if (state) {
      if (state.toLowerCase() === 'central') {
        where.OR = [
          { state: null },
          { state: { contains: 'Central', mode: 'insensitive' } },
          { schemeLevel: { contains: 'Central', mode: 'insensitive' } }
        ];
      } else {
        where.state = {
          contains: state,
          mode: 'insensitive'
        };
      }
    }

    // Execute query & count in parallel
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.scheme.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { schemeName: 'asc' }
        ],
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.scheme.count({ where })
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      meta: {
        recordType: 'CITIZEN_WELFARE_SCHEME',
        budgetEntriesExcluded: true,
        pendingClassificationsExcluded: true
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'An unexpected database error occurred while fetching schemes.' },
      { status: 500 }
    );
  }
}

module.exports = { GET };
