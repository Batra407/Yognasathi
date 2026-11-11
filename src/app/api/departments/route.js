const { prisma } = require('../../../lib/prisma.js');

async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const all = searchParams.get('all') === 'true';

    // By default on the citizen platform, only show departments that actually administer citizen welfare schemes.
    // Budget-only departments do not appear as welfare providers unless they have actual welfare schemes.
    const where = {};

    if (!all) {
      where.schemes = {
        some: { recordType: 'CITIZEN_WELFARE_SCHEME' }
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              schemes: all ? true : { where: { recordType: 'CITIZEN_WELFARE_SCHEME' } }
            }
          }
        }
      }),
      prisma.department.count({ where })
    ]);

    return Response.json({
      data: departments,
      total,
      meta: {
        welfareOnly: !all,
        budgetOnlyDepartmentsExcluded: !all
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'An unexpected database error occurred while fetching departments.' },
      { status: 500 }
    );
  }
}

module.exports = { GET };
