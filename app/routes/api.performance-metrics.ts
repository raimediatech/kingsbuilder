import { json, type ActionFunctionArgs } from '@remix-run/node';
import { PerformanceMetricsManager } from '~/utils/performance-metrics';

export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.pageId) {
      return json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Record the performance metrics
    await PerformanceMetricsManager.recordMetrics(data);

    return json({ success: true });
  } catch (error) {
    console.error('Error recording performance metrics:', error);
    return json({ error: 'Failed to record performance metrics' }, { status: 500 });
  }
}
