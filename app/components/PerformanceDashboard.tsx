import React, { useState, useEffect } from 'react';
import {
  Card,
  LegacyStack,
  Text,
  Select,
  Button,
  DataTable,
  Spinner,
  EmptyState,
  Banner,
  Tabs,
  LegacyCard,
} from '@shopify/polaris';
import { useSubmit, useLoaderData } from '@remix-run/react';

interface PerformanceMetric {
  id: string;
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
  timestamp: string;
}

interface AverageMetrics {
  loadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  domInteractive: number;
  domComplete: number;
  ttfb: number;
  resourceCount: number;
  resourceSize: number;
  sampleSize: number;
}

interface DeviceMetrics {
  [deviceType: string]: {
    avgLoadTime: number;
    avgFcp: number;
    sampleSize: number;
  };
}

interface TrendData {
  interval: string;
  avgLoadTime: number;
  avgFcp: number;
  sampleSize: number;
}

export default function PerformanceDashboard({ pageId }: { pageId: string }) {
  const submit = useSubmit();
  const { metrics = [], averages = null, deviceMetrics = {}, trends = [] } = useLoaderData<{
    metrics: PerformanceMetric[];
    averages: AverageMetrics | null;
    deviceMetrics: DeviceMetrics;
    trends: TrendData[];
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30');
  const [trendInterval, setTrendInterval] = useState('day');

  // Load performance data
  useEffect(() => {
    loadPerformanceData();
  }, [pageId, timeRange, trendInterval]);

  // Load performance data
  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'getPerformanceData');
      formData.append('pageId', pageId);
      formData.append('days', timeRange);
      formData.append('interval', trendInterval);

      submit(formData, { method: 'post' });
    } catch (err) {
      setError('Failed to load performance data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format milliseconds to readable time
  const formatTime = (ms?: number): string => {
    if (ms === undefined) return 'N/A';
    if (ms < 1000) return ${ms.toFixed(0)}ms;
    return ${(ms / 1000).toFixed(2)}s;
  };

  // Format bytes to readable size
  const formatBytes = (bytes?: number): string => {
    if (bytes === undefined) return 'N/A';
    if (bytes < 1024) return ${bytes.toFixed(0)} B;
    if (bytes < 1024 * 1024) return ${(bytes / 1024).toFixed(2)} KB;
    return ${(bytes / (1024 * 1024)).toFixed(2)} MB;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Tabs for the component
  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
      accessibilityLabel: 'Overview',
      panelID: 'overview-panel',
    },
    {
      id: 'metrics',
      content: 'Detailed Metrics',
      accessibilityLabel: 'Detailed Metrics',
      panelID: 'metrics-panel',
    },
    {
      id: 'devices',
      content: 'Device Breakdown',
      accessibilityLabel: 'Device Breakdown',
      panelID: 'devices-panel',
    },
    {
      id: 'trends',
      content: 'Performance Trends',
      accessibilityLabel: 'Performance Trends',
      panelID: 'trends-panel',
    },
  ];

  return (
    <Card>
      <Card.Section>
        <LegacyStack distribution='equalSpacing' alignment='center'>
          <Text variant='headingMd' as='h2'>
            Page Performance Metrics
          </Text>
          <LegacyStack>
            <Select
              label='Time Range'
              labelHidden
              options={[
                { label: 'Last 7 days', value: '7' },
                { label: 'Last 30 days', value: '30' },
                { label: 'Last 90 days', value: '90' },
              ]}
              value={timeRange}
              onChange={setTimeRange}
            />
            <Button onClick={loadPerformanceData} loading={isLoading}>
              Refresh
            </Button>
          </LegacyStack>
        </LegacyStack>
      </Card.Section>

      {error && (
        <Card.Section>
          <Banner status='critical' onDismiss={() => setError('')}>
            {error}
          </Banner>
        </Card.Section>
      )}

      <LegacyCard>
        <Tabs
          tabs={tabs}
          selected={selectedTab}
          onSelect={(index) => setSelectedTab(index)}
        />

        {isLoading ? (
          <Card.Section>
            <LegacyStack distribution='center'>
              <Spinner accessibilityLabel='Loading performance data' size='large' />
            </LegacyStack>
          </Card.Section>
        ) : (
          <>
            {/* Overview Tab */}
            {selectedTab === 0 && (
              <Card.Section>
                {!averages ? (
                  <EmptyState
                    heading='No performance data available'
                    image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                  >
                    <p>
                      No performance metrics have been collected for this page yet.
                      Metrics will be collected when users visit the published page.
                    </p>
                  </EmptyState>
                ) : (
                  <LegacyStack vertical>
                    <Text variant='headingSm' as='h3'>
                      Average Performance Metrics (Sample Size: {averages.sampleSize})
                    </Text>
                    <LegacyCard sectioned>
                      <LegacyStack distribution='fillEvenly'>
                        <LegacyStack vertical>
                          <Text variant='bodyMd' fontWeight='bold'>
                            Page Load Time
                          </Text>
                          <Text variant='heading2xl' color={averages.loadTime > 3000 ? 'critical' : averages.loadTime > 1500 ? 'warning' : 'success'}>
                            {formatTime(averages.loadTime)}
                          </Text>
                        </LegacyStack>
                        <LegacyStack vertical>
                          <Text variant='bodyMd' fontWeight='bold'>
                            First Contentful Paint
                          </Text>
                          <Text variant='heading2xl' color={averages.firstContentfulPaint > 2000 ? 'critical' : averages.firstContentfulPaint > 1000 ? 'warning' : 'success'}>
                            {formatTime(averages.firstContentfulPaint)}
                          </Text>
                        </LegacyStack>
                        <LegacyStack vertical>
                          <Text variant='bodyMd' fontWeight='bold'>
                            Time to First Byte
                          </Text>
                          <Text variant='heading2xl' color={averages.ttfb > 600 ? 'critical' : averages.ttfb > 300 ? 'warning' : 'success'}>
                            {formatTime(averages.ttfb)}
                          </Text>
                        </LegacyStack>
                      </LegacyStack>
                    </LegacyCard>
                  </LegacyStack>
                )}
              </Card.Section>
            )}

            {/* Detailed Metrics Tab */}
            {selectedTab === 1 && (
              <Card.Section>
                {metrics.length === 0 ? (
                  <EmptyState
                    heading='No performance data available'
                    image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                  >
                    <p>
                      No performance metrics have been collected for this page yet.
                      Metrics will be collected when users visit the published page.
                    </p>
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={[
                      'text',
                      'numeric',
                      'numeric',
                      'numeric',
                      'numeric',
                      'text',
                      'text',
                    ]}
                    headings={[
                      'Timestamp',
                      'Load Time',
                      'First Paint',
                      'First Contentful Paint',
                      'TTFB',
                      'Device',
                      'Resources',
                    ]}
                    rows={metrics.map((metric) => [
                      formatDate(metric.timestamp),
                      formatTime(metric.loadTime),
                      formatTime(metric.firstPaint),
                      formatTime(metric.firstContentfulPaint),
                      formatTime(metric.ttfb),
                      metric.deviceType || 'Unknown',
                      metric.resourceCount ? ${metric.resourceCount} () : 'N/A',
                    ])}
                  />
                )}
              </Card.Section>
            )}

            {/* Device Breakdown Tab */}
            {selectedTab === 2 && (
              <Card.Section>
                {Object.keys(deviceMetrics).length === 0 ? (
                  <EmptyState
                    heading='No device data available'
                    image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                  >
                    <p>
                      No device-specific metrics have been collected for this page yet.
                      Metrics will be collected when users visit the published page.
                    </p>
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={[
                      'text',
                      'numeric',
                      'numeric',
                      'numeric',
                    ]}
                    headings={[
                      'Device Type',
                      'Avg. Load Time',
                      'Avg. First Contentful Paint',
                      'Sample Size',
                    ]}
                    rows={Object.entries(deviceMetrics).map(([deviceType, data]) => [
                      deviceType,
                      formatTime(data.avgLoadTime),
                      formatTime(data.avgFcp),
                      data.sampleSize.toString(),
                    ])}
                  />
                )}
              </Card.Section>
            )}

            {/* Performance Trends Tab */}
            {selectedTab === 3 && (
              <Card.Section>
                <LegacyStack vertical>
                  <LegacyStack>
                    <Select
                      label='Interval'
                      options={[
                        { label: 'Daily', value: 'day' },
                        { label: 'Weekly', value: 'week' },
                      ]}
                      value={trendInterval}
                      onChange={setTrendInterval}
                    />
                  </LegacyStack>

                  {trends.length === 0 ? (
                    <EmptyState
                      heading='No trend data available'
                      image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                    >
                      <p>
                        Not enough data has been collected to show performance trends.
                        Check back after more users have visited the page.
                      </p>
                    </EmptyState>
                  ) : (
                    <DataTable
                      columnContentTypes={[
                        'text',
                        'numeric',
                        'numeric',
                        'numeric',
                      ]}
                      headings={[
                        trendInterval === 'day' ? 'Date' : 'Week',
                        'Avg. Load Time',
                        'Avg. First Contentful Paint',
                        'Sample Size',
                      ]}
                      rows={trends.map((trend) => [
                        trend.interval,
                        formatTime(trend.avgLoadTime),
                        formatTime(trend.avgFcp),
                        trend.sampleSize.toString(),
                      ])}
                    />
                  )}
                </LegacyStack>
              </Card.Section>
            )}
          </>
        )}
      </LegacyCard>
    </Card>
  );
}
