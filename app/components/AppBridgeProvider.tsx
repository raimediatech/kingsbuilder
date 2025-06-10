import React, { useMemo, useState, useEffect } from "react";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { useLocation, useNavigate } from "@remix-run/react";

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridgeProvider that provides the right configuration
 */
export function AppBridgeConfig({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [appBridgeConfig, setAppBridgeConfig] = useState<{
    host: string;
    apiKey: string;
    forceRedirect: boolean;
  } | null>(null);

  useEffect(() => {
    // Get host and API key from the URL query parameters
    const params = new URLSearchParams(location.search);
    const host = params.get("host");
    const apiKey = process.env.SHOPIFY_API_KEY || "";

    if (host && apiKey) {
      setAppBridgeConfig({
        host,
        apiKey,
        forceRedirect: true,
      });
    }
  }, [location.search]);

  const history = useMemo(
    () => ({
      replace: (path: string) => {
        navigate(path, { replace: true });
      },
    }),
    [navigate]
  );

  // Wait for the host to be available before mounting the app
  if (!appBridgeConfig) {
    return null;
  }

  return (
    <AppBridgeProvider config={appBridgeConfig} router={{ history }}>
      {children}
    </AppBridgeProvider>
  );
}