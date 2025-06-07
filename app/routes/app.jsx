// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    // This would normally authenticate with Shopify
    // const { session } = await authenticate.admin(request);
    
    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "your_api_key",
      authenticated: true
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "your_api_key",
      authenticated: false,
      error: error.message
    });
  }
};

export default function App() {
  const { authenticated, error } = useLoaderData();
  
  if (!authenticated) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <h1>Authentication Required</h1>
        <p>Please install this app from the Shopify App Store to continue.</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <a 
          href="https://admin.shopify.com/store/kingsbuilder/apps/kingsbuilder" 
          style={{ 
            display: "inline-block", 
            padding: "10px 20px", 
            background: "#2c6ecb", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px",
            marginTop: "20px"
          }}
        >
          Go to Shopify
        </a>
      </div>
    );
  }
  
  return <Outlet />;
}
