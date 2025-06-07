import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Page,
  Layout,
  LegacyCard,
  Select,
  LegacyStack,
  EmptyState,
} from '@shopify/polaris';
import { authenticate } from '~/shopify.server';
import { prisma } from '~/db.server';
import PerformanceDashboard from '~/components/PerformanceDashboard';
import { PerformanceMetricsManager } from '~/utils/performance-metrics';
import { useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Get all pages
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  return json({
    pages,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get('action') as string;
  const pageId = formData.get('pageId') as string;
  const days = parseInt(formData.get('days') as string || '30');
  const interval = formData.get('interval') as 'day' | 'week' || 'day';

  if (!pageId) {
    return json({ error: 'Page ID is required' }, { status: 400 });
  }

  switch (action) {
    case 'getPerformanceData':
      try {
        // Get raw metrics
        const metrics = await PerformanceMetricsManager.getPageMetrics(pageId, 100);
        
        // Get average metrics
        const averages = await PerformanceMetricsManager.getPageAverageMetrics(pageId, days);
        
        // Get device metrics
        const deviceMetrics = await PerformanceMetricsManager.getMetricsByDeviceType(pageId, days);
        
        // Get performance trends
        const trends = await PerformanceMetricsManager.getPerformanceTrends(pageId, days, interval);
        
        return json({
          metrics,
          averages,
          deviceMetrics,
          trends,
        });
      } catch (error) {
        console.error('Error getting performance data:', error);
        return json({ error: 'Failed to get performance data' }, { status: 500 });
      }
    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
};

export default function PerformancePage() {
  const { pages } = useLoaderData<typeof loader>();
  const [selectedPageId, setSelectedPageId] = useState(pages.length > 0 ? pages[0].id : '');

  return (
    <Page
      title='Performance Metrics'
      subtitle='Monitor and analyze page performance'
      backAction={{ content: 'Dashboard', url: '/app' }}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <LegacyStack vertical>
              <Select
                label='Select Page'
                options={pages.map((page) => ({
                  label: page.title,
                  value: page.id,
                }))}
                value={selectedPageId}
                onChange={setSelectedPageId}
                helpText='Select a page to view its performance metrics'
              />
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          {selectedPageId ? (
            <PerformanceDashboard pageId={selectedPageId} />
          ) : (
            <LegacyCard sectioned>
              <EmptyState
                heading='No pages available'
                image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
              >
                <p>Create a page first to view performance metrics.</p>
              </EmptyState>
            </LegacyCard>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
