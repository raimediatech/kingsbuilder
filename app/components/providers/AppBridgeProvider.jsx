// app/components/providers/AppBridgeProvider.jsx
import { useMemo } from "react";
import { Provider } from "@shopify/app-bridge-react";
import { useLocation, useNavigate } from "@remix-run/react";

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridgeProvider that provides the right configuration
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const history = useMemo(
    () => ({
      replace: (path) => {
        navigate(path, { replace: true });
      },
    }),
    [navigate]
  );

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location]
  );

  // Get the host from the query string
  const query = new URLSearchParams(location.search);
  const host = query.get("host");

  const apiKey = window.ENV.SHOPIFY_API_KEY;

  return (
    <Provider config={{ host, apiKey }} router={routerConfig}>
      {children}
    </Provider>
  );
}
