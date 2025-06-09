import React, { useState } from "react";
import { useSubmit, useLoaderData } from "@remix-run/react";
import {
  Card,
  Tabs,
  Layout,
  LegacyCard,
  DataTable,
  Button,
  ButtonGroup,
  SkeletonBodyText,
  Text,
  Icon,
  EmptyState,
} from "@shopify/polaris";
import {
  AnalyticsMinor,
  ReportMinor,
  CustomersMajor,
  GlobeMajor,
  MobileMajor,
  BrowserMajor,
  RefreshMajor,
} from "@shopify/polaris-icons";

interface VisitorAnalyticsDashboardProps {
  pageId: string;
}

const VisitorAnalyticsDashboard: React.FC<VisitorAnalyticsDashboardProps> = ({ pageId }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState(30); // Default to 30 days
  const submit = useSubmit();
  const data = useLoaderData();

  // Handle refresh button click
  const handleRefresh = () => {
    const formData = new FormData();
    formData.append("pageId", pageId);
    formData.append("timeRange", timeRange.toString());
    formData.append("action", "refresh");
    
    submit(formData, { method: "post" });
  };

  // Handle time range change
  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
    
    const formData = new FormData();
    formData.append("pageId", pageId);
    formData.append("timeRange", days.toString());
    formData.append("action", "changeTimeRange");
    
    submit(formData, { method: "post" });
  };

  // Check if data is loaded
  const isLoading = !data || !data.visitorAnalytics;
  
  // If data is still loading, show skeleton
  if (isLoading) {
    return (
      <Card>
        <Card.Section>
          <Text variant="headingLg">Visitor Analytics</Text>
          <SkeletonBodyText lines={10} />
        </Card.Section>
      </Card>
    );
  }

  // Extract data from loader
  const { 
    visitorAnalytics, 
    pageViewAnalytics, 
    visitorTrends 
  } = data;

  // If no data is available, show empty state
  if (
    !visitorAnalytics.totalVisitors &&
    !pageViewAnalytics.totalPageViews
  ) {
    return (
      <Card>
        <Card.Section>
          <EmptyState
            heading="No visitor data available"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{ content: "Refresh Data", onAction: handleRefresh }}
          >
            <p>
              There is no visitor data available for this page yet. Check back
              after your page has received some traffic.
            </p>
          </EmptyState>
        </Card.Section>
      </Card>
    );
  }

  // Prepare tabs
  const tabs = [
    {
      id: "overview",
      content: "Overview",
      accessibilityLabel: "Overview tab",
      panelID: "overview-panel",
    },
    {
      id: "visitors",
      content: "Visitors",
      accessibilityLabel: "Visitors tab",
      panelID: "visitors-panel",
    },
    {
      id: "pageViews",
      content: "Page Views",
      accessibilityLabel: "Page Views tab",
      panelID: "pageViews-panel",
    },
    {
      id: "trends",
      content: "Trends",
      accessibilityLabel: "Trends tab",
      panelID: "trends-panel",
    },
  ];

  // Format duration in seconds to readable format
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Render overview tab
  const renderOverviewTab = () => {
    return (
      <Layout>
        <Layout.Section oneHalf>
          <LegacyCard title="Visitor Summary" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={["Metric", "Value"]}
              rows={[
                ["Total Visitors", visitorAnalytics.totalVisitors.toLocaleString()],
                ["Unique Visitors", visitorAnalytics.uniqueVisitors.toLocaleString()],
                ["New Visitors", visitorAnalytics.newVisitors.toLocaleString()],
                ["Avg. Session Duration", formatDuration(visitorAnalytics.avgDuration)],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title="Page View Summary" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={["Metric", "Value"]}
              rows={[
                ["Total Page Views", pageViewAnalytics.totalPageViews.toLocaleString()],
                ["Avg. View Duration", formatDuration(pageViewAnalytics.avgViewDuration)],
                ["Avg. Scroll Depth", formatPercentage(pageViewAnalytics.avgScrollDepth)],
                ["Avg. Click Count", pageViewAnalytics.avgClickCount.toFixed(2)],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneThird>
          <LegacyCard title="Device Breakdown" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Device", "Count", "Percentage"]}
              rows={visitorAnalytics.devices.map((device) => [
                device.deviceType || "Unknown",
                device.count.toLocaleString(),
                formatPercentage(device.percentage),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneThird>
          <LegacyCard title="Browser Breakdown" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Browser", "Count", "Percentage"]}
              rows={visitorAnalytics.browsers.map((browser) => [
                browser.browser || "Unknown",
                browser.count.toLocaleString(),
                formatPercentage(browser.percentage),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneThird>
          <LegacyCard title="Country Breakdown" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Country", "Count", "Percentage"]}
              rows={visitorAnalytics.countries.map((country) => [
                country.country || "Unknown",
                country.count.toLocaleString(),
                formatPercentage(country.percentage),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render visitors tab
  const renderVisitorsTab = () => {
    return (
      <Layout>
        <Layout.Section>
          <LegacyCard title="Visitor Details" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric"]}
              headings={["Metric", "Total", "Unique", "New"]}
              rows={[
                [
                  "Visitors",
                  visitorAnalytics.totalVisitors.toLocaleString(),
                  visitorAnalytics.uniqueVisitors.toLocaleString(),
                  visitorAnalytics.newVisitors.toLocaleString(),
                ],
                [
                  "Percentage",
                  "100%",
                  formatPercentage((visitorAnalytics.uniqueVisitors / visitorAnalytics.totalVisitors) * 100),
                  formatPercentage((visitorAnalytics.newVisitors / visitorAnalytics.totalVisitors) * 100),
                ],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title="Referrer Breakdown" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Referrer", "Count", "Percentage"]}
              rows={visitorAnalytics.referrers.map((referrer) => [
                referrer.referrer || "Direct",
                referrer.count.toLocaleString(),
                formatPercentage(referrer.percentage),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title="Device & Browser" sectioned>
            <Layout>
              <Layout.Section oneHalf>
                <Card>
                  <Card.Section>
                    <Text variant="headingMd">
                      <Icon source={MobileMajor} /> Devices
                    </Text>
                    <DataTable
                      columnContentTypes={["text", "numeric"]}
                      headings={["Device", "Count"]}
                      rows={visitorAnalytics.devices.map((device) => [
                        device.deviceType || "Unknown",
                        device.count.toLocaleString(),
                      ])}
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
              
              <Layout.Section oneHalf>
                <Card>
                  <Card.Section>
                    <Text variant="headingMd">
                      <Icon source={BrowserMajor} /> Browsers
                    </Text>
                    <DataTable
                      columnContentTypes={["text", "numeric"]}
                      headings={["Browser", "Count"]}
                      rows={visitorAnalytics.browsers.map((browser) => [
                        browser.browser || "Unknown",
                        browser.count.toLocaleString(),
                      ])}
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
            </Layout>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Geographic Distribution" sectioned>
            <Layout>
              <Layout.Section>
                <Text variant="headingMd">
                  <Icon source={GlobeMajor} /> Countries
                </Text>
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric"]}
                  headings={["Country", "Count", "Percentage"]}
                  rows={visitorAnalytics.countries.map((country) => [
                    country.country || "Unknown",
                    country.count.toLocaleString(),
                    formatPercentage(country.percentage),
                  ])}
                />
              </Layout.Section>
            </Layout>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render page views tab
  const renderPageViewsTab = () => {
    return (
      <Layout>
        <Layout.Section>
          <LegacyCard title="Page View Metrics" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={["Metric", "Value"]}
              rows={[
                ["Total Page Views", pageViewAnalytics.totalPageViews.toLocaleString()],
                ["Views per Visitor", (pageViewAnalytics.totalPageViews / visitorAnalytics.totalVisitors).toFixed(2)],
                ["Avg. View Duration", formatDuration(pageViewAnalytics.avgViewDuration)],
                ["Avg. Scroll Depth", formatPercentage(pageViewAnalytics.avgScrollDepth)],
                ["Avg. Click Count", pageViewAnalytics.avgClickCount.toFixed(2)],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Path Breakdown" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Path", "Views", "Percentage"]}
              rows={pageViewAnalytics.paths.map((path) => [
                path.path,
                path.count.toLocaleString(),
                formatPercentage(path.percentage),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render trends tab
  const renderTrendsTab = () => {
    return (
      <Layout>
        <Layout.Section>
          <LegacyCard title="Visitor Trends" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric"]}
              headings={["Date", "Total Visitors", "Unique Visitors", "New Visitors", "Avg. Duration"]}
              rows={visitorTrends.map((trend) => [
                trend.interval,
                trend.totalVisitors.toLocaleString(),
                trend.uniqueVisitors.toLocaleString(),
                trend.newVisitors.toLocaleString(),
                formatDuration(trend.avgDuration),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render the selected tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderOverviewTab();
      case 1:
        return renderVisitorsTab();
      case 2:
        return renderPageViewsTab();
      case 3:
        return renderTrendsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Card>
      <Card.Section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <Text variant="headingLg">
            <Icon source={AnalyticsMinor} /> Visitor Analytics
          </Text>
          <div style={{ display: "flex", gap: "8px" }}>
            <ButtonGroup segmented>
              <Button
                pressed={timeRange === 7}
                onClick={() => handleTimeRangeChange(7)}
              >
                7 Days
              </Button>
              <Button
                pressed={timeRange === 30}
                onClick={() => handleTimeRangeChange(30)}
              >
                30 Days
              </Button>
              <Button
                pressed={timeRange === 90}
                onClick={() => handleTimeRangeChange(90)}
              >
                90 Days
              </Button>
            </ButtonGroup>
            <Button icon={RefreshMajor} onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>

        <Tabs
          tabs={tabs}
          selected={selectedTab}
          onSelect={(index) => setSelectedTab(index)}
        />

        <div style={{ marginTop: "16px" }}>{renderTabContent()}</div>
      </Card.Section>
    </Card>
  );
};

export default VisitorAnalyticsDashboard;