import { ActionFunction, json } from "@remix-run/node";
import { ConversionTrackingManager } from "~/utils/conversion-tracking";

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      pageId,
      sessionId,
      conversionType,
      conversionValue,
      currency,
      productId,
      productName,
      quantity,
      formId,
      buttonId,
      customEventName,
      metadata,
    } = body;

    if (!pageId || !sessionId || !conversionType) {
      return json({ error: "Invalid conversion data" }, { status: 400 });
    }

    // Record conversion
    await ConversionTrackingManager.recordConversion({
      pageId,
      visitorId: sessionId,
      sessionId,
      conversionType,
      conversionValue,
      currency,
      productId,
      productName,
      quantity,
      formId,
      buttonId,
      customEventName,
      metadata,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error recording conversion:", error);
    return json({ error: "Failed to record conversion" }, { status: 500 });
  }
};