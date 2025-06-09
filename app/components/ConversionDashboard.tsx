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
  ProgressBar,
} from "@shopify/polaris";
import {
  AnalyticsMinor,
  ReportMinor,
  OrdersMajor,
  FunnelMajor,
  RefreshMajor,
  MoneyMajor,
  ProductsMajor,
} from "@shopify/polaris-icons";

interface ConversionDashboardProps {
  pageId: string;
}

const ConversionDashboard: React.FC<ConversionDashboardProps> = ({ pageId }) => {
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
  const isLoading = !data || !data.conversionAnalytics;
  
  // If data is still loading, show skeleton
  if (isLoading) {
    return (
      <Card>
        <Card.Section>
          <Text variant="headingLg">Conversion Analytics</Text>
          <SkeletonBodyText lines={10} />
        </Card.Section>
      </Card>
    );
  }

  // Extract data from loader
  const { 
    conversionAnalytics, 
    conversionFunnel, 
    conversionTrends 
  } = data;

  // If no data is available, show empty state
  if (!conversionAnalytics.totalConversions) {
    return (
      <Card>
        <Card.Section>
          <EmptyState
            heading="No conversion data available"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{ content: "Refresh Data", onAction: handleRefresh }}
          >
            <p>
              There is no conversion data available for this page yet. Check back
              after your page has received some conversions.
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
      id: "conversions",
      content: "Conversions",
      accessibilityLabel: "Conversions tab",
      panelID: "conversions-panel",
    },
    {
      id: "funnel",
      content: "Funnel",
      accessibilityLabel: "Funnel tab",
      panelID: "funnel-panel",
    },
    {
      id: "trends",
      content: "Trends",
      accessibilityLabel: "Trends tab",
      panelID: "trends-panel",
    },
  ];

  // Format currency
  const formatCurrency = (value: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
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
          <LegacyCard title="Conversion Summary" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={["Metric", "Value"]}
              rows={[
                ["Total Conversions", conversionAnalytics.totalConversions.toLocaleString()],
                ["Conversion Rate", formatPercentage(conversionAnalytics.conversionRate)],
                ["Total Value", formatCurrency(conversionAnalytics.totalValue)],
                ["Average Value", formatCurrency(conversionAnalytics.avgValue)],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title="Conversion Funnel" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Stage", "Count", "Dropoff Rate"]}
              rows={conversionFunnel.map((stage) => [
                stage.stage,
                stage.count.toLocaleString(),
                formatPercentage(stage.dropoffRate),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Conversion Types" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric"]}
              headings={["Type", "Count", "Percentage", "Value"]}
              rows={conversionAnalytics.conversionTypes.map((type) => [
                type.type,
                type.count.toLocaleString(),
                formatPercentage(type.percentage),
                formatCurrency(type.value),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render conversions tab
  const renderConversionsTab = () => {
    return (
      <Layout>
        <Layout.Section>
          <LegacyCard title="Conversion Details" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric"]}
              headings={["Metric", "Value", "Percentage"]}
              rows={[
                [
                  "Total Conversions",
                  conversionAnalytics.totalConversions.toLocaleString(),
                  "100%",
                ],
                [
                  "Conversion Rate",
                  formatPercentage(conversionAnalytics.conversionRate),
                  "-",
                ],
                [
                  "Total Value",
                  formatCurrency(conversionAnalytics.totalValue),
                  "100%",
                ],
                [
                  "Average Value",
                  formatCurrency(conversionAnalytics.avgValue),
                  "-",
                ],
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Conversion Types" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric"]}
              headings={["Type", "Count", "Percentage", "Value"]}
              rows={conversionAnalytics.conversionTypes.map((type) => [
                type.type,
                type.count.toLocaleString(),
                formatPercentage(type.percentage),
                formatCurrency(type.value),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Top Products" sectioned>
            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", "numeric"]}
              headings={["Product ID", "Product Name", "Count", "Quantity", "Value"]}
              rows={conversionAnalytics.products.map((product) => [
                product.productId || "-",
                product.productName || "Unknown",
                product.count.toLocaleString(),
                product.quantity.toLocaleString(),
                formatCurrency(product.value),
              ])}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    );
  };

  // Render funnel tab
  const renderFunnelTab = () => {
    // Find the maximum count for scaling
    const maxCount = Math.max(...conversionFunnel.map((stage) => stage.count));
    
    return (
      <Layout>
        <Layout.Section>
          <LegacyCard title="Conversion Funnel" sectioned>
            <div style={{ marginBottom: "20px" }}>
              <Text variant="bodyMd">
                This funnel shows the progression of visitors through the conversion process.
              </Text>
            </div>
            
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <Text variant="bodyMd">{stage.stage}</Text>
                  <Text variant="bodyMd">
                    {stage.count.toLocaleString()} 
                    {index > 0 && ` (${formatPercentage(100 - stage.dropoffRate)} of previous)`}
                  </Text>
                </div>
                <ProgressBar progress={(stage.count / maxCount) * 100} size="small" />
                {index < conversionFunnel.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                    <Text variant="bodySm" color="subdued">
                      Dropoff: {stage.dropoff.toLocaleString()} ({formatPercentage(stage.dropoffRate)})
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title="Funnel Details" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric"]}
              headings={["Stage", "Count", "Dropoff", "Dropoff Rate"]}
              rows={conversionFunnel.map((stage) => [
                stage.stage,
                stage.count.toLocaleString(),
                stage.dropoff.toLocaleString(),
                formatPercentage(stage.dropoffRate),
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
          <LegacyCard title="Conversion Trends" sectioned>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric"]}
              headings={["Date", "Conversions", "Total Value", "Avg. Value"]}
              rows={conversionTrends.map((trend) => [
                trend.interval,
                trend.totalConversions.toLocaleString(),
                formatCurrency(trend.totalValue),
                formatCurrency(trend.avgValue),
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
        return renderConversionsTab();
      case 2:
        return renderFunnelTab();
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
            <Icon source={OrdersMajor} /> Conversion Analytics
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

export default ConversionDashboard;