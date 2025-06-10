import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { getShopifyPages } from "~/utils/shopify-api.server";
import { useAuth } from "~/components/AuthProvider";
import * as ShopifyApiClient from "~/utils/shopify-api.client";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  try {
    // Get all pages from Shopify
    const response = await getShopifyPages(session);
    const pages = response.data?.pages?.edges?.map((edge: any) => edge.node) || [];
    
    return json({
      pages,
      shopDomain: session.shop,
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Error loading pages:", error);
    return json({ 
      error: "Failed to load pages",
      shopDomain: session.shop,
      accessToken: session.accessToken,
    }, { status: 500 });
  }
}

export default function Pages() {
  const { pages: initialPages, shopDomain, accessToken } = useLoaderData<typeof loader>();
  const { login } = useAuth();
  const [pages, setPages] = useState<any[]>(initialPages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store the shop and accessToken in the auth context
  useEffect(() => {
    if (shopDomain && accessToken) {
      login(shopDomain, accessToken);
      
      // Also store in localStorage for the page builder
      localStorage.setItem('shopifyShop', shopDomain);
      localStorage.setItem('shopifyToken', accessToken);
    }
  }, [shopDomain, accessToken, login]);
  
  // Function to create a new page
  const createNewPage = async () => {
    if (!shopDomain || !accessToken) {
      setError("Authentication required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ShopifyApiClient.createPage(shopDomain, accessToken, {
        title: "New Page",
        handle: "new-page-" + Date.now(),
        content: "<div>This is a new page created with KingsBuilder</div>",
        published: false
      });
      
      if (result.success && result.page) {
        // Redirect to the builder
        window.location.href = `/builder/${result.page.id}?shop=${shopDomain}`;
      } else {
        setError("Failed to create page");
      }
    } catch (error: any) {
      setError(error.message || "Failed to create page");
    } finally {
      setIsLoading(false);
    }
  };
  
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
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1
          }}
          onClick={createNewPage}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Page"}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: "#FEE2E2", 
          color: "#B91C1C", 
          padding: "10px 15px", 
          borderRadius: "4px", 
          marginBottom: "20px" 
        }}>
          {error}
        </div>
      )}
      
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
                  to={`/builder/${page.id}?shop=${shopDomain}`}
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