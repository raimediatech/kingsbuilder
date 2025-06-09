import { ActionFunction, json } from "@remix-run/node";
import { VisitorAnalyticsManager } from "~/utils/visitor-analytics";

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { type, data, deviceType, browser, os, language, isNewVisitor, isUnique } = body;

    if (!data || !data.pageId || !data.sessionId) {
      return json({ error: "Invalid tracking data" }, { status: 400 });
    }

    // Record visitor data
    await VisitorAnalyticsManager.recordVisitor({
      pageId: data.pageId,
      sessionId: data.sessionId,
      referrer: data.referrer,
      userAgent: data.userAgent,
      deviceType,
      browser,
      os,
      country: null, // Would be determined server-side from IP
      region: null,
      city: null,
      language,
      screenSize: data.screenSize,
      entryPath: data.path,
      exitPath: null, // Will be updated on page exit
      duration: null, // Will be updated on page exit
      isNewVisitor,
      isUnique,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error recording visitor data:", error);
    return json({ error: "Failed to record visitor data" }, { status: 500 });
  }
};