import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { 
  createShopifyPage, 
  updateShopifyPage, 
  getShopifyPages, 
  getShopifyPageById, 
  deleteShopifyPage 
} from "~/utils/shopify-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  // Get query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  try {
    if (id) {
      // Get a single page
      const pageData = await getShopifyPageById(session, id);
      return json(pageData);
    } else {
      // Get all pages
      const pagesData = await getShopifyPages(session);
      return json(pagesData);
    }
  } catch (error) {
    console.error("API Error:", error);
    return json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  // Get the request method
  const method = request.method;
  
  try {
    if (method === "POST") {
      // Create a new page
      const data = await request.json();
      const result = await createShopifyPage(session, data);
      return json(result);
    } else if (method === "PUT") {
      // Update an existing page
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      
      if (!id) {
        return json({ error: "Page ID is required" }, { status: 400 });
      }
      
      const data = await request.json();
      const result = await updateShopifyPage(session, id, data);
      return json(result);
    } else if (method === "DELETE") {
      // Delete a page
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      
      if (!id) {
        return json({ error: "Page ID is required" }, { status: 400 });
      }
      
      const result = await deleteShopifyPage(session, id);
      return json(result);
    }
    
    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("API Error:", error);
    return json({ error: "Failed to process request" }, { status: 500 });
  }
}