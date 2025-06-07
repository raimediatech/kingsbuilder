import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PerformanceDashboard from "~/components/PerformanceDashboard";

// Mock the useSubmit and useLoaderData hooks
jest.mock("@remix-run/react", () => ({
  useSubmit: jest.fn(() => jest.fn()),
  useLoaderData: jest.fn(() => ({
    metrics: [
      {
        id: "metric1",
        pageId: "page123",
        loadTime: 1500,
        firstPaint: 500,
        firstContentfulPaint: 700,
        ttfb: 200,
        deviceType: "desktop",
        timestamp: new Date().toISOString(),
      },
    ],
    averages: {
      loadTime: 1500,
      firstPaint: 500,
      firstContentfulPaint: 700,
      domInteractive: 600,
      domComplete: 1400,
      ttfb: 200,
      resourceCount: 15,
      resourceSize: 250000,
      sampleSize: 10,
    },
    deviceMetrics: {
      desktop: {
        avgLoadTime: 1400,
        avgFcp: 650,
        sampleSize: 7,
      },
      mobile: {
        avgLoadTime: 1800,
        avgFcp: 850,
        sampleSize: 3,
      },
    },
    trends: [
      {
        interval: "2023-06-01",
        avgLoadTime: 1600,
        avgFcp: 750,
        sampleSize: 5,
      },
      {
        interval: "2023-06-02",
        avgLoadTime: 1500,
        avgFcp: 700,
        sampleSize: 5,
      },
    ],
  })),
}));

describe("PerformanceDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard with tabs", () => {
    render(<PerformanceDashboard pageId="page123" />);
    
    // Check that the main title is rendered
    expect(screen.getByText("Page Performance Metrics")).toBeInTheDocument();
    
    // Check that all tabs are rendered
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Detailed Metrics")).toBeInTheDocument();
    expect(screen.getByText("Device Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Performance Trends")).toBeInTheDocument();
  });

  it("displays average metrics in the overview tab", () => {
    render(<PerformanceDashboard pageId="page123" />);
    
    // Check that the overview tab shows average metrics
    expect(screen.getByText("Average Performance Metrics (Sample Size: 10)")).toBeInTheDocument();
    expect(screen.getByText("Page Load Time")).toBeInTheDocument();
    expect(screen.getByText("First Contentful Paint")).toBeInTheDocument();
    expect(screen.getByText("Time to First Byte")).toBeInTheDocument();
  });

  it("changes tab when clicked", async () => {
    render(<PerformanceDashboard pageId="page123" />);
    
    // Click on the Detailed Metrics tab
    const detailedMetricsTab = screen.getByText("Detailed Metrics");
    await userEvent.click(detailedMetricsTab);
    
    // Check that the detailed metrics table headers are shown
    await waitFor(() => {
      expect(screen.getByText("Timestamp")).toBeInTheDocument();
      expect(screen.getByText("Load Time")).toBeInTheDocument();
      expect(screen.getByText("First Paint")).toBeInTheDocument();
    });
  });

  it("submits form data when refresh button is clicked", async () => {
    const mockSubmit = jest.fn();
    require("@remix-run/react").useSubmit.mockReturnValue(mockSubmit);
    
    render(<PerformanceDashboard pageId="page123" />);
    
    // Click the refresh button
    const refreshButton = screen.getByText("Refresh");
    await userEvent.click(refreshButton);
    
    // Check that the submit function was called with the correct form data
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        get: expect.any(Function),
      }),
      expect.objectContaining({
        method: "post",
      })
    );
  });
});
