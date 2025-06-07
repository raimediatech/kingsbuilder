import { prisma } from "~/db.server";

export interface PerformanceMetricData {
  pageId: string;
  loadTime?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  domInteractive?: number;
  domComplete?: number;
  ttfb?: number;
  resourceCount?: number;
  resourceSize?: number;
  deviceType?: string;
}

export class PerformanceMetricsManager {
  /**
   * Records performance metrics for a page
   */
  static async recordMetrics(data: PerformanceMetricData) {
    return prisma.performanceMetric.create({
      data: {
        pageId: data.pageId,
        loadTime: data.loadTime,
        firstPaint: data.firstPaint,
        firstContentfulPaint: data.firstContentfulPaint,
        domInteractive: data.domInteractive,
        domComplete: data.domComplete,
        ttfb: data.ttfb,
        resourceCount: data.resourceCount,
        resourceSize: data.resourceSize,
        deviceType: data.deviceType || "unknown",
      },
    });
  }

  /**
   * Gets the most recent performance metrics for a page
   */
  static async getPageMetrics(pageId: string, limit = 50) {
    return prisma.performanceMetric.findMany({
      where: {
        pageId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });
  }

  /**
   * Gets average performance metrics for a page over a specified time period
   */
  static async getPageAverageMetrics(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        loadTime: true,
        firstPaint: true,
        firstContentfulPaint: true,
        domInteractive: true,
        domComplete: true,
        ttfb: true,
        resourceCount: true,
        resourceSize: true,
      },
    });

    const sampleSize = await prisma.performanceMetric.count({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
    });

    if (sampleSize === 0) {
      return null;
    }

    // Calculate averages
    const averages = metrics.reduce(
      (acc, metric) => {
        return {
          loadTime: acc.loadTime + (metric.loadTime || 0),
          firstPaint: acc.firstPaint + (metric.firstPaint || 0),
          firstContentfulPaint: acc.firstContentfulPaint + (metric.firstContentfulPaint || 0),
          domInteractive: acc.domInteractive + (metric.domInteractive || 0),
          domComplete: acc.domComplete + (metric.domComplete || 0),
          ttfb: acc.ttfb + (metric.ttfb || 0),
          resourceCount: acc.resourceCount + (metric.resourceCount || 0),
          resourceSize: acc.resourceSize + (metric.resourceSize || 0),
        };
      },
      {
        loadTime: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        domInteractive: 0,
        domComplete: 0,
        ttfb: 0,
        resourceCount: 0,
        resourceSize: 0,
      }
    );

    return {
      loadTime: Math.round(averages.loadTime / sampleSize),
      firstPaint: Math.round(averages.firstPaint / sampleSize),
      firstContentfulPaint: Math.round(averages.firstContentfulPaint / sampleSize),
      domInteractive: Math.round(averages.domInteractive / sampleSize),
      domComplete: Math.round(averages.domComplete / sampleSize),
      ttfb: Math.round(averages.ttfb / sampleSize),
      resourceCount: Math.round(averages.resourceCount / sampleSize),
      resourceSize: Math.round(averages.resourceSize / sampleSize),
      sampleSize,
    };
  }

  /**
   * Gets metrics broken down by device type
   */
  static async getMetricsByDeviceType(pageId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        deviceType: true,
        loadTime: true,
        firstContentfulPaint: true,
      },
    });

    // Group by device type
    const deviceGroups: Record<
      string,
      { loadTimes: number[]; fcpTimes: number[]; count: number }
    > = {};

    metrics.forEach((metric) => {
      const deviceType = metric.deviceType || "unknown";
      
      if (!deviceGroups[deviceType]) {
        deviceGroups[deviceType] = {
          loadTimes: [],
          fcpTimes: [],
          count: 0,
        };
      }
      
      if (metric.loadTime) {
        deviceGroups[deviceType].loadTimes.push(metric.loadTime);
      }
      
      if (metric.firstContentfulPaint) {
        deviceGroups[deviceType].fcpTimes.push(metric.firstContentfulPaint);
      }
      
      deviceGroups[deviceType].count++;
    });

    // Calculate averages for each device type
    const result: Record<
      string,
      { avgLoadTime: number; avgFcp: number; sampleSize: number }
    > = {};

    Object.entries(deviceGroups).forEach(([deviceType, data]) => {
      const avgLoadTime = data.loadTimes.length > 0
        ? Math.round(data.loadTimes.reduce((sum, val) => sum + val, 0) / data.loadTimes.length)
        : 0;
        
      const avgFcp = data.fcpTimes.length > 0
        ? Math.round(data.fcpTimes.reduce((sum, val) => sum + val, 0) / data.fcpTimes.length)
        : 0;

      result[deviceType] = {
        avgLoadTime,
        avgFcp,
        sampleSize: data.count,
      };
    });

    return result;
  }

  /**
   * Gets performance trends over time
   */
  static async getPerformanceTrends(pageId: string, days = 30, interval: "day" | "week" = "day") {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        pageId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
        loadTime: true,
        firstContentfulPaint: true,
      },
    });

    // Group by interval (day or week)
    const intervalGroups: Record<
      string,
      { loadTimes: number[]; fcpTimes: number[]; count: number }
    > = {};

    metrics.forEach((metric) => {
      const date = new Date(metric.timestamp);
      let intervalKey: string;
      
      if (interval === "day") {
        intervalKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        // For week, use the year and week number
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        intervalKey = `${date.getFullYear()}-W${weekNumber}`;
      }
      
      if (!intervalGroups[intervalKey]) {
        intervalGroups[intervalKey] = {
          loadTimes: [],
          fcpTimes: [],
          count: 0,
        };
      }
      
      if (metric.loadTime) {
        intervalGroups[intervalKey].loadTimes.push(metric.loadTime);
      }
      
      if (metric.firstContentfulPaint) {
        intervalGroups[intervalKey].fcpTimes.push(metric.firstContentfulPaint);
      }
      
      intervalGroups[intervalKey].count++;
    });

    // Calculate averages for each interval
    const result = Object.entries(intervalGroups).map(([intervalKey, data]) => {
      const avgLoadTime = data.loadTimes.length > 0
        ? Math.round(data.loadTimes.reduce((sum, val) => sum + val, 0) / data.loadTimes.length)
        : 0;
        
      const avgFcp = data.fcpTimes.length > 0
        ? Math.round(data.fcpTimes.reduce((sum, val) => sum + val, 0) / data.fcpTimes.length)
        : 0;

      return {
        interval: intervalKey,
        avgLoadTime,
        avgFcp,
        sampleSize: data.count,
      };
    });

    // Sort by interval
    return result.sort((a, b) => a.interval.localeCompare(b.interval));
  }
}
