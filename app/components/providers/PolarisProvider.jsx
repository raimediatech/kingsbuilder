// app/components/providers/PolarisProvider.jsx
import { useCallback } from "react";
import { AppProvider } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

import "@shopify/polaris/build/esm/styles.css";

/**
 * @desc A component to setup the Polaris provider
 */
export function PolarisProvider({ children }) {
  const navigate = useNavigate();
  const linkComponent = useCallback(
    ({ children, url, ...rest }) => {
      const isExternalLink = url.startsWith("http");
      if (isExternalLink) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
            {children}
          </a>
        );
      }

      return (
        <a
          {...rest}
          onClick={(event) => {
            event.preventDefault();
            navigate(url);
          }}
        >
          {children}
        </a>
      );
    },
    [navigate]
  );

  return (
    <AppProvider linkComponent={linkComponent}>
      {children}
    </AppProvider>
  );
}
