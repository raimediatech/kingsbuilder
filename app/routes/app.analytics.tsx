import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Page, Layout, Tabs, Card, Text } from "@shopify/polaris";
import { useState } from "react";
import VisitorAnalyticsDashboard from "~/components/VisitorAnalyticsDashboard";
import ConversionDashboard from "~/components/ConversionDashboard";
import { VisitorAnalyticsManager } from "~/utils/visitor-analytics";
import { ConversionTrackingManager } from "~/utils/conversion-tracking";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId") || "default";
  const timeRange = parseInt(url.searchParams.get("timeRange") || "30", 10);

  try {
    // Get visitor analytics
    const visitorAnalytics = await VisitorAnalyticsManager.getPageVisitorAnalytics(pageId, timeRange);
    const pageViewAnalytics = await VisitorAnalyticsManager.getPageViewAnalytics(pageId, timeRange);
    const visitorTrends = await VisitorAnalyticsManager.getVisitorTrends(pageId, timeRange);

    // Get conversion analytics
    const conversionAnalytics = await ConversionTrackingManager.getPageConversionAnalytics(pageId, timeRange);
    const conversionFunnel = await ConversionTrackingManager.getConversionFunnelAnalytics(pageId, timeRange);
    const conversionTrends = await ConversionTrackingManager.getConversionTrends(pageId, timeRange);

    return json({
      pageId,
      timeRange,
      visitorAnalytics,
      pageViewAnalytics,
      visitorTrends,
      conversionAnalytics,
      conversionFunnel,
      conversionTrends,
    });
  } catch (error) {
    console.error("Error loading analytics data:", error);
    return json({
      pageId,
      timeRange,
      error: "Failed to load analytics data",
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const pageId = formData.get("pageId") as string;
  const timeRange = parseInt(formData.get("timeRange") as string, 10);
  const action = formData.get("action") as string;

  // Return the same data as the loader
  return json({
    pageId,
    timeRange,
    action,
  });
};

export default function AnalyticsDashboard() {
  const data = useLoaderData();
  const submit = useSubmit();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      id: "visitors",
      content: "Visitor Analytics",
      accessibilityLabel: "Visitor Analytics tab",
      panelID: "visitors-panel",
    },
    {
      id: "conversions",
      content: "Conversion Analytics",
      accessibilityLabel: "Conversion Analytics tab",
      panelID: "conversions-panel",
    },
  ];

  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  };

  return (
    <Page
      title="Analytics Dashboard"
      subtitle="Track visitor behavior and conversion metrics for your pages"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
            <Card.Section>
              {selectedTab === 0 ? (
                <VisitorAnalyticsDashboard pageId={data.pageId} />
              ) : (
                <ConversionDashboard pageId={data.pageId} />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Card.Section>
              <Text variant="headingMd">Analytics Tracking Code</Text>
              <Text variant="bodyMd">
                To track visitors and conversions on your Shopify pages, add the following code to your theme:
              </Text>
              <div style={{ marginTop: "16px", backgroundColor: "#f4f6f8", padding: "16px", borderRadius: "4px" }}>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {`<script>
  // KingsBuilder Analytics Tracking
  (function() {
    var kb = document.createElement('script');
    kb.type = 'text/javascript';
    kb.async = true;
    kb.src = '${window.location.origin}/api/analytics/script?pageId=YOUR_PAGE_ID&shopId=YOUR_SHOP_ID';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(kb, s);
  })();
</script>`}
                </pre>
              </div>
              <Text variant="bodyMd" color="subdued" as="p" style={{ marginTop: "8px" }}>
                Replace YOUR_PAGE_ID with your page identifier and YOUR_SHOP_ID with your Shopify shop ID.
              </Text>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}