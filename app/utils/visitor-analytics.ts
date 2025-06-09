import { prisma } from "~/db.server";

export interface VisitorData {
  pageId: string;
  sessionId: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  screenSize?: string;
  entryPath?: string;
  exitPath?: string;
  duration?: number;
  isNewVisitor?: boolean;
  isUnique?: boolean;
}

export interface PageViewData {
  visitorId: string;
  pageId: string;
  path: string;
  duration?: number;
  scrollDepth?: number;
  clickCount?: number;
}

export class VisitorAnalyticsManager {
  /**
   * Records a new visitor
   */
  static async recordVisitor(data: VisitorData) {
    return prisma.visitor.create({
      data: {
        pageId: data.pageId,
        sessionId: data.sessionId,
        referrer: data.referrer,
        userAgent: data.userAgent,
        deviceType: data.deviceType || "unknown",
        browser: data.browser,
        os: data.os,
        country: data.country,
        region: data.region,
        city: data.city,
        language: data.language,
        screenSize: data.screenSize,
        entryPath: data.entryPath,
        exitPath: data.exitPath,
        duration: data.duration,
        isNewVisitor: data.isNewVisitor || false,
        isUnique: data.isUnique || false,
      },
    });
  }

  /**
   * Records a page view
   */
  static async recordPageView(data: PageViewData) {
    return prisma.pageView.create({
      data: {
        visitorId: data.visitorId,
        pageId: data.pageId,
        path: data.path,
        duration: data.duration,
        scrollDepth: data.scrollDepth,
        clickCount: data.clickCount,
      },
    });
  }

  /**
   * Gets visitor analytics for a page
   */
  static async getPageVisitorAnalytics(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total visitors
    const totalVisitors = await prisma.visitor.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get unique visitors
    const uniqueVisitors = await prisma.visitor.count({
      where: {
        pageId,
        isUnique: true,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get new visitors
    const newVisitors = await prisma.visitor.count({
      where: {
        pageId,
        isNewVisitor: true,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get average session duration
    const durationData = await prisma.visitor.findMany({
      where: {
        pageId,
        duration: {
          not: null,
        },
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        duration: true,
      },
    });

    const totalDuration = durationData.reduce(
      (sum, visitor) => sum + (visitor.duration || 0),
      0
    );
    const avgDuration = durationData.length > 0 ? totalDuration / durationData.length : 0;

    // Get device breakdown
    const deviceData = await prisma.visitor.groupBy({
      by: ["deviceType"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        deviceType: true,
      },
    });

    const devices = deviceData.map((item) => ({
      deviceType: item.deviceType,
      count: item._count.deviceType,
      percentage: (item._count.deviceType / totalVisitors) * 100,
    }));

    // Get browser breakdown
    const browserData = await prisma.visitor.groupBy({
      by: ["browser"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        browser: true,
      },
    });

    const browsers = browserData.map((item) => ({
      browser: item.browser,
      count: item._count.browser,
      percentage: (item._count.browser / totalVisitors) * 100,
    }));

    // Get country breakdown
    const countryData = await prisma.visitor.groupBy({
      by: ["country"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        country: true,
      },
    });

    const countries = countryData.map((item) => ({
      country: item.country,
      count: item._count.country,
      percentage: (item._count.country / totalVisitors) * 100,
    }));

    // Get referrer breakdown
    const referrerData = await prisma.visitor.groupBy({
      by: ["referrer"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        referrer: true,
      },
    });

    const referrers = referrerData.map((item) => ({
      referrer: item.referrer,
      count: item._count.referrer,
      percentage: (item._count.referrer / totalVisitors) * 100,
    }));

    // Get daily visitor counts
    const dailyData = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count,
        SUM(CASE WHEN isUnique = true THEN 1 ELSE 0 END) as uniqueCount
      FROM Visitor
      WHERE pageId = ${pageId}
        AND timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    return {
      totalVisitors,
      uniqueVisitors,
      newVisitors,
      avgDuration,
      devices,
      browsers,
      countries,
      referrers,
      dailyData,
    };
  }

  /**
   * Gets page view analytics
   */
  static async getPageViewAnalytics(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total page views
    const totalPageViews = await prisma.pageView.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get average view duration
    const durationData = await prisma.pageView.findMany({
      where: {
        pageId,
        duration: {
          not: null,
        },
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        duration: true,
      },
    });

    const totalDuration = durationData.reduce(
      (sum, view) => sum + (view.duration || 0),
      0
    );
    const avgViewDuration = durationData.length > 0 ? totalDuration / durationData.length : 0;

    // Get average scroll depth
    const scrollData = await prisma.pageView.findMany({
      where: {
        pageId,
        scrollDepth: {
          not: null,
        },
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        scrollDepth: true,
      },
    });

    const totalScrollDepth = scrollData.reduce(
      (sum, view) => sum + (view.scrollDepth || 0),
      0
    );
    const avgScrollDepth = scrollData.length > 0 ? totalScrollDepth / scrollData.length : 0;

    // Get average click count
    const clickData = await prisma.pageView.findMany({
      where: {
        pageId,
        clickCount: {
          not: null,
        },
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        clickCount: true,
      },
    });

    const totalClicks = clickData.reduce(
      (sum, view) => sum + (view.clickCount || 0),
      0
    );
    const avgClickCount = clickData.length > 0 ? totalClicks / clickData.length : 0;

    // Get path breakdown
    const pathData = await prisma.pageView.groupBy({
      by: ["path"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        path: true,
      },
    });

    const paths = pathData.map((item) => ({
      path: item.path,
      count: item._count.path,
      percentage: (item._count.path / totalPageViews) * 100,
    }));

    return {
      totalPageViews,
      avgViewDuration,
      avgScrollDepth,
      avgClickCount,
      paths,
    };
  }

  /**
   * Gets visitor trends over time
   */
  static async getVisitorTrends(pageId: string, days = 30, interval: "day" | "week" = "day") {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let groupByClause;
    if (interval === "day") {
      groupByClause = "DATE(timestamp)";
    } else {
      groupByClause = "CONCAT(YEAR(timestamp), '-W', WEEK(timestamp))";
    }

    const trendsData = await prisma.$queryRaw`
      SELECT 
        ${groupByClause} as interval,
        COUNT(*) as totalVisitors,
        SUM(CASE WHEN isUnique = true THEN 1 ELSE 0 END) as uniqueVisitors,
        SUM(CASE WHEN isNewVisitor = true THEN 1 ELSE 0 END) as newVisitors,
        AVG(duration) as avgDuration
      FROM Visitor
      WHERE pageId = ${pageId}
        AND timestamp >= ${startDate}
      GROUP BY ${groupByClause}
      ORDER BY interval ASC
    `;

    return trendsData;
  }
}