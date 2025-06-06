/**
 * Utility functions for page performance metrics
 */

/**
 * Performance metric types
 */
export interface PerformanceMetrics {
  // Navigation timing metrics
  navigationStart?: number;
  redirectTime?: number;
  dnsLookupTime?: number;
  tcpConnectTime?: number;
  serverResponseTime?: number;
  pageDownloadTime?: number;
  domProcessingTime?: number;
  domContentLoadedTime?: number;
  pageLoadTime?: number;
  
  // Resource timing metrics
  resourceCount?: number;
  resourceLoadTime?: number;
  
  // Paint timing metrics
  firstPaint?: number;
  firstContentfulPaint?: number;
  
  // Layout shift metrics
  cumulativeLayoutShift?: number;
  
  // Largest contentful paint
  largestContentfulPaint?: number;
  
  // First input delay
  firstInputDelay?: number;
  
  // Total blocking time
  totalBlockingTime?: number;
  
  // Time to interactive
  timeToInteractive?: number;
}

/**
 * Collect performance metrics from the browser
 * @returns Performance metrics object
 */
export function collectPerformanceMetrics(): PerformanceMetrics {
  // Only run in browser environment
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }
  
  const metrics: PerformanceMetrics = {};
  
  // Navigation timing metrics
  if (performance.timing) {
    const timing = performance.timing;
    
    metrics.navigationStart = timing.navigationStart;
    metrics.redirectTime = timing.redirectEnd - timing.redirectStart;
    metrics.dnsLookupTime = timing.domainLookupEnd - timing.domainLookupStart;
    metrics.tcpConnectTime = timing.connectEnd - timing.connectStart;
    metrics.serverResponseTime = timing.responseStart - timing.requestStart;
    metrics.pageDownloadTime = timing.responseEnd - timing.responseStart;
    metrics.domProcessingTime = timing.domComplete - timing.domLoading;
    metrics.domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
  }
  
  // Resource timing metrics
  const resources = performance.getEntriesByType('resource');
  if (resources.length > 0) {
    metrics.resourceCount = resources.length;
    metrics.resourceLoadTime = resources.reduce((total, resource) => total + resource.duration, 0);
  }
  
  // Paint timing metrics
  const paintEntries = performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
  const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  
  if (firstPaint) {
    metrics.firstPaint = firstPaint.startTime;
  }
  
  if (firstContentfulPaint) {
    metrics.firstContentfulPaint = firstContentfulPaint.startTime;
  }
  
  // Layout shift metrics
  if ('LayoutShift' in window) {
    let cumulativeLayoutShift = 0;
    
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      }
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
    metrics.cumulativeLayoutShift = cumulativeLayoutShift;
  }
  
  // Largest contentful paint
  if ('LargestContentfulPaint' in window) {
    let largestContentfulPaint = 0;
    
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      largestContentfulPaint = lastEntry.startTime;
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    metrics.largestContentfulPaint = largestContentfulPaint;
  }
  
  return metrics;
}

/**
 * Initialize performance monitoring
 * @param callback Function to call with performance metrics
 * @param sendToServer Whether to send metrics to the server
 * @param serverEndpoint Server endpoint to send metrics to
 */
export function initPerformanceMonitoring(
  callback?: (metrics: PerformanceMetrics) => void,
  sendToServer: boolean = false,
  serverEndpoint: string = '/api/performance-metrics'
): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Wait for the page to fully load
  window.addEventListener('load', () => {
    // Wait a bit to ensure all metrics are available
    setTimeout(() => {
      const metrics = collectPerformanceMetrics();
      
      // Call the callback if provided
      if (callback) {
        callback(metrics);
      }
      
      // Send metrics to the server if requested
      if (sendToServer) {
        fetch(serverEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metrics),
        }).catch(error => {
          console.error('Error sending performance metrics:', error);
        });
      }
    }, 1000);
  });
}

/**
 * Format a time value in milliseconds to a human-readable string
 * @param timeMs Time in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timeMs: number | undefined): string {
  if (timeMs === undefined) return 'N/A';
  
  if (timeMs < 1) {
    return '< 1ms';
  } else if (timeMs < 1000) {
    return `${Math.round(timeMs)}ms`;
  } else {
    return `${(timeMs / 1000).toFixed(2)}s`;
  }
}

/**
 * Get a performance score based on metrics
 * @param metrics Performance metrics
 * @returns Score from 0 to 100
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  // This is a simplified scoring algorithm
  // In a real app, you would use a more sophisticated algorithm
  
  let score = 100;
  
  // Penalize for slow page load time
  if (metrics.pageLoadTime) {
    if (metrics.pageLoadTime > 5000) {
      score -= 30;
    } else if (metrics.pageLoadTime > 3000) {
      score -= 20;
    } else if (metrics.pageLoadTime > 1000) {
      score -= 10;
    }
  }
  
  // Penalize for slow first contentful paint
  if (metrics.firstContentfulPaint) {
    if (metrics.firstContentfulPaint > 3000) {
      score -= 20;
    } else if (metrics.firstContentfulPaint > 1500) {
      score -= 10;
    } else if (metrics.firstContentfulPaint > 1000) {
      score -= 5;
    }
  }
  
  // Penalize for layout shifts
  if (metrics.cumulativeLayoutShift) {
    if (metrics.cumulativeLayoutShift > 0.25) {
      score -= 20;
    } else if (metrics.cumulativeLayoutShift > 0.1) {
      score -= 10;
    } else if (metrics.cumulativeLayoutShift > 0.05) {
      score -= 5;
    }
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}