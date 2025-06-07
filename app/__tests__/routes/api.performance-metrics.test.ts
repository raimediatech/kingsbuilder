import { action } from "~/routes/api.performance-metrics";
import { PerformanceMetricsManager } from "~/utils/performance-metrics";

// Mock the PerformanceMetricsManager
jest.mock("~/utils/performance-metrics", () => ({
  PerformanceMetricsManager: {
    recordMetrics: jest.fn(),
  },
}));

describe("Performance Metrics API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 405 for non-POST requests", async () => {
    const request = new Request("https://example.com/api/performance-metrics", {
      method: "GET",
    });

    const response = await action({ request, params: {}, context: {} });
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data).toEqual({ error: "Method not allowed" });
  });

  it("should return 400 if pageId is missing", async () => {
    const request = new Request("https://example.com/api/performance-metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await action({ request, params: {}, context: {} });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Page ID is required" });
  });

  it("should record metrics and return success", async () => {
    const metricsData = {
      pageId: "page123",
      loadTime: 1500,
      firstPaint: 500,
      firstContentfulPaint: 700,
    };

    const request = new Request("https://example.com/api/performance-metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metricsData),
    });

    PerformanceMetricsManager.recordMetrics.mockResolvedValue(undefined);

    const response = await action({ request, params: {}, context: {} });
    const data = await response.json();

    expect(PerformanceMetricsManager.recordMetrics).toHaveBeenCalledWith(metricsData);
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it("should handle errors and return 500", async () => {
    const request = new Request("https://example.com/api/performance-metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageId: "page123" }),
    });

    const mockError = new Error("Database error");
    PerformanceMetricsManager.recordMetrics.mockRejectedValue(mockError);

    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const response = await action({ request, params: {}, context: {} });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to record performance metrics" });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
