import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppBridgeConfig } from "./components/AppBridgeProvider";
import { AuthProvider } from "./components/AuthProvider";
import { json } from "@remix-run/node";

export function links() {
  return [
    { rel: "manifest", href: "/manifest.json" },
    { rel: "icon", href: "/icons/icon.svg", type: "image/svg+xml" },
  ];
}

export const loader = async () => {
  return json({
    shopifyApiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function App() {
  const { shopifyApiKey } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Add sandbox permissions for iframe */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' https://cdn.shopify.com;"
        />
        <meta
          httpEquiv="X-Frame-Options"
          content="ALLOW-FROM https://*.myshopify.com https://*.shopify.com"
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {shopifyApiKey ? (
          <AuthProvider>
            <AppBridgeConfig>
              <Outlet />
            </AppBridgeConfig>
          </AuthProvider>
        ) : (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
