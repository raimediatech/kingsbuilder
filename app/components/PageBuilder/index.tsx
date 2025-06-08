import React, { useState } from "react";
import { 
  BlockStack, 
  Button, 
  Card, 
  Icon, 
  InlineStack, 
  Text, 
  TextField, 
  Tabs
} from "@shopify/polaris";
import { 
  TextMajor,
  ImageMajor,
  ButtonMinor,
  SectionMajor,
  DividerMajor,
  DesktopMajor,
  TabletMajor,
  MobileMajor
} from "@shopify/polaris-icons";
import "./PageBuilder.css";

// Simple PageBuilder component
export default function PageBuilder({ initialPage = null, onSave }) {
  const [viewMode, setViewMode] = useState("desktop");
  const [activeTab, setActiveTab] = useState(0);
  
  // Render the toolbar
  const renderToolbar = () => {
    return (
      <div className="page-builder-toolbar">
        <InlineStack gap="200" align="space-between">
          <InlineStack gap="200">
            <Button
              icon={DesktopMajor}
              pressed={viewMode === "desktop"}
              onClick={() => setViewMode("desktop")}
              accessibilityLabel="Desktop view"
            />
            <Button
              icon={TabletMajor}
              pressed={viewMode === "tablet"}
              onClick={() => setViewMode("tablet")}
              accessibilityLabel="Tablet view"
            />
            <Button
              icon={MobileMajor}
              pressed={viewMode === "mobile"}
              onClick={() => setViewMode("mobile")}
              accessibilityLabel="Mobile view"
            />
          </InlineStack>
          
          <InlineStack gap="200">
            <Button primary onClick={() => onSave && onSave({})}>
              Save
            </Button>
          </InlineStack>
        </InlineStack>
      </div>
    );
  };
  
  // Render the widget panel
  const renderWidgetPanel = () => {
    const widgets = [
      { type: "heading", title: "Heading", icon: TextMajor },
      { type: "text", title: "Text", icon: TextMajor },
      { type: "button", title: "Button", icon: ButtonMinor },
      { type: "image", title: "Image", icon: ImageMajor },
      { type: "divider", title: "Divider", icon: DividerMajor },
      { type: "section", title: "Section", icon: SectionMajor },
    ];
    
    return (
      <Card>
        <Card.Section>
          <Text variant="headingMd" as="h2">Widgets</Text>
        </Card.Section>
        <Tabs
          tabs={[
            { id: "basic", content: "Basic" },
            { id: "layout", content: "Layout" }
          ]}
          selected={activeTab}
          onSelect={setActiveTab}
        />
        <Card.Section>
          <BlockStack gap="400">
            {widgets.map((widget) => (
              <div
                key={widget.type}
                className="widget-item"
              >
                <InlineStack gap="200" align="center">
                  <Icon source={widget.icon} color="base" />
                  <Text variant="bodyMd">{widget.title}</Text>
                </InlineStack>
              </div>
            ))}
          </BlockStack>
        </Card.Section>
      </Card>
    );
  };
  
  // Render the properties panel
  const renderPropertiesPanel = () => {
    return (
      <Card>
        <Card.Section>
          <Text variant="headingMd" as="h2">Properties</Text>
          <Text variant="bodyMd" as="p" color="subdued">
            Select an element to edit its properties
          </Text>
        </Card.Section>
        <Card.Section>
          <BlockStack gap="400">
            <TextField
              label="Text"
              value="Sample text"
              onChange={() => {}}
            />
            <TextField
              label="Color"
              value="#000000"
              onChange={() => {}}
              type="color"
            />
            <TextField
              label="Font Size"
              value="16px"
              onChange={() => {}}
            />
          </BlockStack>
        </Card.Section>
      </Card>
    );
  };
  
  // Render the editor
  const renderEditor = () => {
    return (
      <div className={`page-builder-editor ${viewMode}`}>
        <div className="editor-content">
          <div className="placeholder-content">
            <Text variant="headingLg" as="h2" alignment="center">
              Drag and drop widgets here to build your page
            </Text>
            <Text variant="bodyMd" as="p" alignment="center">
              Select widgets from the left panel and customize their properties in the right panel
            </Text>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="page-builder" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {renderToolbar()}
      
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: "300px", overflowY: "auto", backgroundColor: "#ffffff", borderRight: "1px solid #e1e3e5", padding: "16px" }}>
          {renderWidgetPanel()}
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {renderEditor()}
        </div>
        
        <div style={{ width: "300px", overflowY: "auto", backgroundColor: "#ffffff", borderLeft: "1px solid #e1e3e5", padding: "16px" }}>
          {renderPropertiesPanel()}
        </div>
      </div>
    </div>
  );
}
