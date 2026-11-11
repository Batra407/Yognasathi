import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yojanasathi.in";

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/schemes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/departments`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/assistant`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85
    }
  ];

  try {
    // Fetch verified citizen schemes for sitemap indexing (top 200 priority schemes)
    const schemes = await prisma.scheme.findMany({
      where: { recordType: "CITIZEN_WELFARE_SCHEME" },
      select: { id: true, updatedAt: true },
      take: 200
    });

    const schemeRoutes = schemes.map((s) => ({
      url: `${baseUrl}/schemes/${s.id}`,
      lastModified: s.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.75
    }));

    return [...staticRoutes, ...schemeRoutes];
  } catch {
    // Return static routes if database is unreachable during sitemap build
    return staticRoutes;
  }
}

