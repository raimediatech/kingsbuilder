import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

/**
 * Health check endpoint for monitoring
 */
export async function loader() {
  try {
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Check API status
    const apiStatus = true;
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Overall status
    const isHealthy = dbStatus && apiStatus;
    
    return json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        api: { status: apiStatus ? "up" : "down" },
        database: { status: dbStatus ? "up" : "down" },
      },
      metrics: {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        },
        uptime: Math.round(process.uptime()),
      },
    }, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    }, { status: 503 });
  }
}

/**
 * Check database connection
 */
async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
