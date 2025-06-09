import React, { useEffect, useRef } from "react";

interface CustomCodeWidgetProps {
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  height?: string;
  width?: string;
  containerStyle?: React.CSSProperties;
}

const CustomCodeWidget: React.FC<CustomCodeWidgetProps> = ({
  htmlContent = "",
  cssContent = "",
  jsContent = "",
  height = "auto",
  width = "100%",
  containerStyle = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to initialize the iframe content
  const initializeIframe = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    // Create the HTML content with embedded CSS and JS
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;

    // Write the content to the iframe
    iframeDoc.open();
    iframeDoc.write(content);
    iframeDoc.close();

    // Adjust iframe height to content if height is 'auto'
    if (height === "auto" && iframe.contentWindow) {
      const resizeObserver = new ResizeObserver(() => {
        if (iframe.contentWindow && iframe.contentDocument?.body) {
          const newHeight = iframe.contentDocument.body.scrollHeight;
          iframe.style.height = `${newHeight}px`;
        }
      });

      resizeObserver.observe(iframe.contentDocument.body);
      
      // Clean up observer on unmount
      return () => {
        resizeObserver.disconnect();
      };
    }
  };

  // Initialize the iframe when the component mounts or when content changes
  useEffect(() => {
    initializeIframe();
  }, [htmlContent, cssContent, jsContent, height, width]);

  // If no content is provided, show a placeholder
  if (!htmlContent && !cssContent && !jsContent) {
    return (
      <div
        style={{
          width,
          height: height === "auto" ? "200px" : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#666",
          border: "1px solid #ddd",
          borderRadius: "4px",
          ...containerStyle,
        }}
      >
        Custom code widget - No code provided
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height: height === "auto" ? "auto" : height,
        overflow: "hidden",
        border: "1px solid #ddd",
        borderRadius: "4px",
        ...containerStyle,
      }}
    >
      <iframe
        ref={iframeRef}
        title="Custom Code Widget"
        style={{
          width: "100%",
          height: height === "auto" ? "100%" : height,
          border: "none",
          display: "block",
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default CustomCodeWidget;