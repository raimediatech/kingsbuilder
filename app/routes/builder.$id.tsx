import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import { getShopifyPageById } from "~/utils/shopify-api.server";
import { useEffect } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  const { id } = params;
  
  try {
    if (!id) {
      throw new Error("Page ID is required");
    }
    
    // Get the page data from Shopify
    const pageData = await getShopifyPageById(session, id);
    
    return json({
      pageId: id,
      pageData,
      shopDomain: session.shop,
    });
  } catch (error) {
    console.error("Error loading page:", error);
    return json({ error: "Failed to load page" }, { status: 500 });
  }
}

export default function PageBuilder() {
  const { pageId, pageData, shopDomain } = useLoaderData<typeof loader>();
  
  useEffect(() => {
    // Redirect to the builder page in the Express app
    window.location.href = `/builder/${pageId}?shop=${shopDomain}`;
  }, [pageId, shopDomain]);
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>Loading Page Builder...</h1>
      <p>You will be redirected to the page builder in a moment.</p>
    </div>
  );
}