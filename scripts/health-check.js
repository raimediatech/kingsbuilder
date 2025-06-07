/**
 * Health check script for KingsBuilder
 */

const https = require("https");
const { MongoClient } = require("mongodb");

// Environment URLs from GitHub secrets
const PRODUCTION_URL = process.env.PRODUCTION_URL;
const STAGING_URL = process.env.STAGING_URL;

// Check if an endpoint is responding
async function checkEndpoint(url, endpoint) {
  return new Promise((resolve) => {
    https.get(`${url}${endpoint}`, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => {
      resolve(false);
    });
  });
}

// Main health check function
async function runHealthChecks() {
  console.log("Starting health checks...");
  
  // Check production environment
  const prodApiCheck = await checkEndpoint(PRODUCTION_URL, "/api/health");
  const prodHomeCheck = await checkEndpoint(PRODUCTION_URL, "/");
  
  // Check staging environment
  const stagingApiCheck = await checkEndpoint(STAGING_URL, "/api/health");
  const stagingHomeCheck = await checkEndpoint(STAGING_URL, "/");
  
  // Determine overall health
  const allChecksPass = prodApiCheck && prodHomeCheck && stagingApiCheck && stagingHomeCheck;
  
  // Exit with appropriate code
  process.exit(allChecksPass ? 0 : 1);
}

// Run the health checks
runHealthChecks().catch(() => process.exit(1));
