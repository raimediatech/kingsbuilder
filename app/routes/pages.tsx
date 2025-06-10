import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import { getShopifyPages } from "~/utils/shopify-api.server";
import { Page } from "@shopify/shopify-api/rest/admin/2023-01/page";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  try {
    // Get all pages from Shopify
    const response = await getShopifyPages(session);
    const pages = response.data.pages.edges.map((edge: any) => edge.node);
    
    return json({
      pages,
      shopDomain: session.shop,
    });
  } catch (error) {
    console.error("Error loading pages:", error);
    return json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export default function Pages() {
  const { pages, shopDomain } = useLoaderData<typeof loader>();
  
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Pages</h1>
        <button 
          style={{ 
            backgroundColor: "#000", 
            color: "#fff", 
            padding: "10px 20px", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer" 
          }}
          onClick={() => {
            // Create a new page and redirect to the builder
            // This would typically call an API endpoint
            alert("This would create a new page and redirect to the builder");
          }}
        >
          Create Page
        </button>
      </div>
      
      {pages && pages.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {pages.map((page: any) => (
            <div 
              key={page.id} 
              style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "20px",
                backgroundColor: "#fff" 
              }}
            >
              <h2 style={{ marginTop: 0 }}>{page.title}</h2>
              <p style={{ color: "#666", fontSize: "14px" }}>
                {page.bodySummary ? page.bodySummary.substring(0, 100) + "..." : "No content"}
              </p>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <Link 
                  to={`/builder/${page.id}`}
                  style={{ 
                    backgroundColor: "#000", 
                    color: "#fff", 
                    padding: "8px 16px", 
                    borderRadius: "4px", 
                    textDecoration: "none" 
                  }}
                >
                  Edit with Builder
                </Link>
                <a 
                  href={`https://${shopDomain}/pages/${page.handle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    backgroundColor: "#f5f5f5", 
                    color: "#000", 
                    padding: "8px 16px", 
                    borderRadius: "4px", 
                    textDecoration: "none" 
                  }}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h2>No pages found</h2>
          <p>Create your first page to get started.</p>
        </div>
      )}
    </div>
  );
}