import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

/**
 * Prometheus metrics endpoint
 */
export async function loader() {
  try {
    // Collect metrics
    const metrics = await collectMetrics();
    
    // Format metrics in Prometheus format
    const formattedMetrics = formatMetricsForPrometheus(metrics);
    
    return new Response(formattedMetrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4",
      },
    });
  } catch (error) {
    console.error("Error generating metrics:", error);
    
    return json({
      error: "Failed to generate metrics",
    }, { status: 500 });
  }
}

/**
 * Collect application metrics
 */
async function collectMetrics() {
  // Memory usage
  const memoryUsage = process.memoryUsage();
  
  // Database metrics
  const userCount = await prisma.user.count();
  const pageCount = await prisma.page.count();
  const templateCount = await prisma.template.count();
  
  // Performance metrics
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const avgLoadTime = await prisma.performanceMetric.aggregate({
    _avg: {
      loadTime: true,
      firstContentfulPaint: true,
    },
    where: {
      timestamp: {
        gte: last24Hours,
      },
    },
  });
  
  return {
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
    },
    database: {
      userCount,
      pageCount,
      templateCount,
    },
    performance: {
      avgLoadTime: avgLoadTime._avg.loadTime || 0,
      avgFirstContentfulPaint: avgLoadTime._avg.firstContentfulPaint || 0,
    },
    system: {
      uptime: process.uptime(),
    },
  };
}

/**
 * Format metrics for Prometheus
 */
function formatMetricsForPrometheus(metrics) {
  let output = "";
  
  // Memory metrics
  output += "# HELP nodejs_memory_usage_bytes Memory usage in bytes.\n";
  output += "# TYPE nodejs_memory_usage_bytes gauge\n";
  output += `nodejs_memory_usage_bytes{type="rss"} ${metrics.memory.rss}\n`;
  output += `nodejs_memory_usage_bytes{type="heapTotal"} ${metrics.memory.heapTotal}\n`;
  output += `nodejs_memory_usage_bytes{type="heapUsed"} ${metrics.memory.heapUsed}\n\n`;
  
  // Database metrics
  output += "# HELP kingsbuilder_database_records Total number of records by type.\n";
  output += "# TYPE kingsbuilder_database_records gauge\n";
  output += `kingsbuilder_database_records{type="users"} ${metrics.database.userCount}\n`;
  output += `kingsbuilder_database_records{type="pages"} ${metrics.database.pageCount}\n`;
  output += `kingsbuilder_database_records{type="templates"} ${metrics.database.templateCount}\n\n`;
  
  // Performance metrics
  output += "# HELP kingsbuilder_performance_metrics Average performance metrics in milliseconds.\n";
  output += "# TYPE kingsbuilder_performance_metrics gauge\n";
  output += `kingsbuilder_performance_metrics{type="loadTime"} ${metrics.performance.avgLoadTime}\n`;
  output += `kingsbuilder_performance_metrics{type="firstContentfulPaint"} ${metrics.performance.avgFirstContentfulPaint}\n\n`;
  
  // System metrics
  output += "# HELP nodejs_uptime_seconds Process uptime in seconds.\n";
  output += "# TYPE nodejs_uptime_seconds counter\n";
  output += `nodejs_uptime_seconds ${metrics.system.uptime}\n`;
  
  return output;
}
