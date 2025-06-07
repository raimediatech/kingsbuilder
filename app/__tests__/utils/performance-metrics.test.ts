import { PerformanceMetricsManager } from "~/utils/performance-metrics";

// Mock the prisma client
jest.mock("~/db.server", () => ({
  prisma: {
    performanceMetric: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe("PerformanceMetricsManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("recordMetrics", () => {
    it("should record performance metrics", async () => {
      const mockData = {
        pageId: "page123",
        loadTime: 1500,
        firstPaint: 500,
        firstContentfulPaint: 700,
        domInteractive: 600,
        domComplete: 1400,
        ttfb: 200,
        resourceCount: 15,
        resourceSize: 250000,
        deviceType: "desktop",
      };

      await PerformanceMetricsManager.recordMetrics(mockData);

      // Verify the prisma client was called with the correct data
      expect(require("~/db.server").prisma.performanceMetric.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pageId: "page123",
          loadTime: 1500,
          firstPaint: 500,
          firstContentfulPaint: 700,
        }),
      });
    });
  });

  describe("getPageMetrics", () => {
    it("should retrieve page metrics with the correct limit", async () => {
      const mockMetrics = [
        { id: "metric1", pageId: "page123", loadTime: 1500, timestamp: new Date().toISOString() },
        { id: "metric2", pageId: "page123", loadTime: 1600, timestamp: new Date().toISOString() },
      ];

      require("~/db.server").prisma.performanceMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await PerformanceMetricsManager.getPageMetrics("page123", 10);

      expect(result).toEqual(mockMetrics);
      expect(require("~/db.server").prisma.performanceMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { pageId: "page123" },
          take: 10,
        })
      );
    });
  });

  describe("getPageAverageMetrics", () => {
    it("should calculate average metrics for a page", async () => {
      const mockMetrics = [
        { loadTime: 1500, firstPaint: 500, firstContentfulPaint: 700 },
        { loadTime: 1700, firstPaint: 600, firstContentfulPaint: 800 },
      ];

      require("~/db.server").prisma.performanceMetric.findMany.mockResolvedValue(mockMetrics);
      require("~/db.server").prisma.performanceMetric.count.mockResolvedValue(2);

      const result = await PerformanceMetricsManager.getPageAverageMetrics("page123", 30);

      expect(result).toEqual(expect.objectContaining({
        loadTime: 1600, // Average of 1500 and 1700
        firstPaint: 550, // Average of 500 and 600
        firstContentfulPaint: 750, // Average of 700 and 800
        sampleSize: 2,
      }));
    });
  });
});
