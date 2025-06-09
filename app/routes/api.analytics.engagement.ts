import { ActionFunction, json } from "@remix-run/node";
import { VisitorAnalyticsManager } from "~/utils/visitor-analytics";

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { pageId, sessionId, duration, scrollDepth, clickCount } = body;

    if (!pageId || !sessionId) {
      return json({ error: "Invalid engagement data" }, { status: 400 });
    }

    // Record page view data
    await VisitorAnalyticsManager.recordPageView({
      visitorId: sessionId,
      pageId,
      path: request.headers.get("Referer") || "",
      duration,
      scrollDepth,
      clickCount,
    });

    // Update visitor duration
    // In a real implementation, you would update the visitor record with the exit path and duration
    // This would require a more complex database operation

    return json({ success: true });
  } catch (error) {
    console.error("Error recording engagement data:", error);
    return json({ error: "Failed to record engagement data" }, { status: 500 });
  }
};