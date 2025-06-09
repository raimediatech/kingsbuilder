import { prisma } from "~/db.server";

export type ConversionType = 
  | "purchase" 
  | "add_to_cart" 
  | "checkout" 
  | "signup" 
  | "lead" 
  | "form_submission" 
  | "click" 
  | "custom";

export interface ConversionData {
  pageId: string;
  visitorId: string;
  sessionId: string;
  conversionType: ConversionType;
  conversionValue?: number;
  currency?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  formId?: string;
  buttonId?: string;
  customEventName?: string;
  metadata?: Record<string, any>;
}

export class ConversionTrackingManager {
  /**
   * Records a conversion event
   */
  static async recordConversion(data: ConversionData) {
    return prisma.conversion.create({
      data: {
        pageId: data.pageId,
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        conversionType: data.conversionType,
        conversionValue: data.conversionValue,
        currency: data.currency,
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        formId: data.formId,
        buttonId: data.buttonId,
        customEventName: data.customEventName,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  /**
   * Gets conversion analytics for a page
   */
  static async getPageConversionAnalytics(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total conversions
    const totalConversions = await prisma.conversion.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get total visitors for the same period (for conversion rate)
    const totalVisitors = await prisma.visitor.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Calculate conversion rate
    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    // Get conversion breakdown by type
    const conversionsByType = await prisma.conversion.groupBy({
      by: ["conversionType"],
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        conversionType: true,
      },
      _sum: {
        conversionValue: true,
      },
    });

    const conversionTypes = conversionsByType.map((item) => ({
      type: item.conversionType,
      count: item._count.conversionType,
      percentage: (item._count.conversionType / totalConversions) * 100,
      value: item._sum.conversionValue || 0,
    }));

    // Get total conversion value
    const totalValue = conversionTypes.reduce((sum, item) => sum + item.value, 0);

    // Get average conversion value
    const avgValue = totalConversions > 0 ? totalValue / totalConversions : 0;

    // Get top products
    const productData = await prisma.conversion.groupBy({
      by: ["productId", "productName"],
      where: {
        pageId,
        productId: {
          not: null,
        },
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        productId: true,
      },
      _sum: {
        conversionValue: true,
        quantity: true,
      },
    });

    const products = productData.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      count: item._count.productId,
      value: item._sum.conversionValue || 0,
      quantity: item._sum.quantity || 0,
    }));

    // Get daily conversion counts
    const dailyData = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count,
        SUM(conversionValue) as value
      FROM Conversion
      WHERE pageId = ${pageId}
        AND timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    return {
      totalConversions,
      conversionRate,
      totalValue,
      avgValue,
      conversionTypes,
      products,
      dailyData,
    };
  }

  /**
   * Gets conversion funnel analytics
   */
  static async getConversionFunnelAnalytics(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Define the funnel stages
    const funnelStages = [
      { name: "View", type: null }, // Page view (from visitors table)
      { name: "Add to Cart", type: "add_to_cart" },
      { name: "Checkout", type: "checkout" },
      { name: "Purchase", type: "purchase" },
    ];

    // Get visitor count (first stage)
    const viewCount = await prisma.visitor.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Get counts for each conversion type
    const conversionCounts = await Promise.all(
      funnelStages.slice(1).map(async (stage) => {
        return prisma.conversion.count({
          where: {
            pageId,
            conversionType: stage.type as ConversionType,
            timestamp: {
              gte: startDate,
            },
          },
        });
      })
    );

    // Build the funnel data
    const funnel = [
      {
        stage: funnelStages[0].name,
        count: viewCount,
        dropoff: 0,
        dropoffRate: 0,
      },
    ];

    for (let i = 0; i < conversionCounts.length; i++) {
      const prevCount = i === 0 ? viewCount : conversionCounts[i - 1];
      const currentCount = conversionCounts[i];
      const dropoff = prevCount - currentCount;
      const dropoffRate = prevCount > 0 ? (dropoff / prevCount) * 100 : 0;

      funnel.push({
        stage: funnelStages[i + 1].name,
        count: currentCount,
        dropoff,
        dropoffRate,
      });
    }

    return funnel;
  }

  /**
   * Gets conversion trends over time
   */
  static async getConversionTrends(pageId: string, days = 30, interval: "day" | "week" = "day") {
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
        COUNT(*) as totalConversions,
        SUM(conversionValue) as totalValue,
        AVG(conversionValue) as avgValue
      FROM Conversion
      WHERE pageId = ${pageId}
        AND timestamp >= ${startDate}
      GROUP BY ${groupByClause}
      ORDER BY interval ASC
    `;

    return trendsData;
  }
}