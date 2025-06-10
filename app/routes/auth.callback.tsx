import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  // Get the shop and accessToken from the session
  const shop = session.shop;
  const accessToken = session.accessToken;
  
  if (!shop || !accessToken) {
    return json({ error: "Authentication failed" }, { status: 401 });
  }
  
  // Return the shop and accessToken to be stored in localStorage
  return json({
    shop,
    accessToken,
    success: true
  });
}

export default function AuthCallback() {
  const data = useLoaderData<typeof loader>();
  
  useEffect(() => {
    if (data.success) {
      // Store the shop and accessToken in localStorage
      localStorage.setItem('shopifyShop', data.shop);
      localStorage.setItem('shopifyToken', data.accessToken);
      
      // Redirect to the app
      window.location.href = '/';
    }
  }, [data]);
  
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Authenticating...</h1>
      <p>You will be redirected to the app in a moment.</p>
    </div>
  );
}