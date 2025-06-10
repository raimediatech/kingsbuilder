import React, { useState, useEffect, useRef } from "react";
import { 
  BlockStack, 
  Button, 
  Card, 
  Icon, 
  InlineStack, 
  Text, 
  TextField, 
  Tabs,
  Toast
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
  const [pageElements, setPageElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const dropZoneRef = useRef(null);
  
  // Initialize with any existing content
  useEffect(() => {
    if (initialPage && initialPage.content && Array.isArray(initialPage.content)) {
      setPageElements(initialPage.content);
    }
  }, [initialPage]);

  // Handle drag start
  const handleDragStart = (e, widget) => {
    e.dataTransfer.setData("widget", JSON.stringify(widget));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("drag-over");
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("drag-over");
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("drag-over");
    }
    
    try {
      const widgetData = JSON.parse(e.dataTransfer.getData("widget"));
      if (widgetData) {
        const newElement = {
          id: `element-${Date.now()}`,
          type: widgetData.type,
          content: getDefaultContent(widgetData.type),
          settings: getDefaultSettings(widgetData.type)
        };
        
        setPageElements([...pageElements, newElement]);
        setToastMessage(`Added ${widgetData.title} element`);
        setToastError(false);
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error dropping element:", error);
      setToastMessage("Error adding element");
      setToastError(true);
      setShowToast(true);
    }
  };

  // Get default content based on element type
  const getDefaultContent = (type) => {
    switch (type) {
      case "heading":
        return "New Heading";
      case "text":
        return "Add your text here";
      case "button":
        return "Click Me";
      case "image":
        return "https://via.placeholder.com/400x200";
      case "divider":
        return null;
      case "section":
        return [];
      default:
        return "";
    }
  };

  // Get default settings based on element type
  const getDefaultSettings = (type) => {
    const commonSettings = {
      marginTop: "0",
      marginBottom: "20px",
      marginLeft: "0",
      marginRight: "0",
      paddingTop: "0",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      backgroundColor: "transparent",
      textColor: "#000000"
    };
    
    switch (type) {
      case "heading":
        return {
          ...commonSettings,
          level: "h2",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "left"
        };
      case "text":
        return {
          ...commonSettings,
          fontSize: "16px",
          fontWeight: "normal",
          textAlign: "left"
        };
      case "button":
        return {
          ...commonSettings,
          buttonStyle: "primary",
          buttonSize: "medium",
          buttonRadius: "4px",
          buttonColor: "#2c6ecb",
          buttonTextColor: "#ffffff",
          buttonLink: "#"
        };
      case "image":
        return {
          ...commonSettings,
          altText: "Image",
          width: "100%",
          height: "auto",
          borderRadius: "0"
        };
      case "divider":
        return {
          ...commonSettings,
          dividerStyle: "solid",
          dividerColor: "#e1e3e5",
          dividerThickness: "1px"
        };
      case "section":
        return {
          ...commonSettings,
          width: "100%",
          maxWidth: "1200px",
          minHeight: "100px"
        };
      default:
        return commonSettings;
    }
  };

  // Handle element selection
  const handleElementSelect = (element) => {
    setSelectedElement(element);
  };

  // Handle element deletion
  const handleElementDelete = (elementId) => {
    setPageElements(pageElements.filter(el => el.id !== elementId));
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
    setToastMessage("Element deleted");
    setToastError(false);
    setShowToast(true);
  };

  // Handle element update
  const handleElementUpdate = (elementId, field, value) => {
    const updatedElements = pageElements.map(el => {
      if (el.id === elementId) {
        if (field.startsWith("settings.")) {
          const settingField = field.replace("settings.", "");
          return {
            ...el,
            settings: {
              ...el.settings,
              [settingField]: value
            }
          };
        } else {
          return {
            ...el,
            [field]: value
          };
        }
      }
      return el;
    });
    
    setPageElements(updatedElements);
    
    // Update selected element if it's the one being edited
    if (selectedElement && selectedElement.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      setSelectedElement(updatedElement);
    }
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({
        content: pageElements,
        settings: {
          viewMode
        }
      });
    }
    setToastMessage("Page saved successfully");
    setToastError(false);
    setShowToast(true);
  };
  
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
            <Button primary onClick={handleSave}>
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
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
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
    if (!selectedElement) {
      return (
        <Card>
          <Card.Section>
            <Text variant="headingMd" as="h2">Properties</Text>
            <Text variant="bodyMd" as="p" color="subdued">
              Select an element to edit its properties
            </Text>
          </Card.Section>
        </Card>
      );
    }
    
    return (
      <Card>
        <Card.Section>
          <Text variant="headingMd" as="h2">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
          </Text>
        </Card.Section>
        <Card.Section>
          <BlockStack gap="400">
            {selectedElement.type === "heading" || selectedElement.type === "text" ? (
              <TextField
                label="Content"
                value={selectedElement.content || ""}
                onChange={(value) => handleElementUpdate(selectedElement.id, "content", value)}
                multiline={selectedElement.type === "text" ? 4 : 1}
              />
            ) : null}
            
            {selectedElement.type === "button" ? (
              <>
                <TextField
                  label="Button Text"
                  value={selectedElement.content || ""}
                  onChange={(value) => handleElementUpdate(selectedElement.id, "content", value)}
                />
                <TextField
                  label="Link URL"
                  value={selectedElement.settings?.buttonLink || "#"}
                  onChange={(value) => handleElementUpdate(selectedElement.id, "settings.buttonLink", value)}
                />
              </>
            ) : null}
            
            {selectedElement.type === "image" ? (
              <>
                <TextField
                  label="Image URL"
                  value={selectedElement.content || ""}
                  onChange={(value) => handleElementUpdate(selectedElement.id, "content", value)}
                />
                <TextField
                  label="Alt Text"
                  value={selectedElement.settings?.altText || ""}
                  onChange={(value) => handleElementUpdate(selectedElement.id, "settings.altText", value)}
                />
              </>
            ) : null}
            
            <TextField
              label="Background Color"
              value={selectedElement.settings?.backgroundColor || "transparent"}
              onChange={(value) => handleElementUpdate(selectedElement.id, "settings.backgroundColor", value)}
              type="color"
            />
            
            {selectedElement.type !== "image" && selectedElement.type !== "divider" ? (
              <TextField
                label="Text Color"
                value={selectedElement.settings?.textColor || "#000000"}
                onChange={(value) => handleElementUpdate(selectedElement.id, "settings.textColor", value)}
                type="color"
              />
            ) : null}
            
            <Button destructive onClick={() => handleElementDelete(selectedElement.id)}>
              Delete Element
            </Button>
          </BlockStack>
        </Card.Section>
      </Card>
    );
  };
  
  // Render a single element
  const renderElement = (element) => {
    const isSelected = selectedElement && selectedElement.id === element.id;
    const elementStyle = {
      backgroundColor: element.settings?.backgroundColor || "transparent",
      color: element.settings?.textColor || "#000000",
      marginTop: element.settings?.marginTop || "0",
      marginBottom: element.settings?.marginBottom || "20px",
      marginLeft: element.settings?.marginLeft || "0",
      marginRight: element.settings?.marginRight || "0",
      paddingTop: element.settings?.paddingTop || "0",
      paddingBottom: element.settings?.paddingBottom || "0",
      paddingLeft: element.settings?.paddingLeft || "0",
      paddingRight: element.settings?.paddingRight || "0",
      border: isSelected ? "2px solid #2c6ecb" : "2px solid transparent",
      borderRadius: "4px",
      cursor: "pointer",
      position: "relative"
    };
    
    switch (element.type) {
      case "heading":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={elementStyle}
            onClick={() => handleElementSelect(element)}
          >
            <h2 style={{ 
              fontSize: element.settings?.fontSize || "24px",
              fontWeight: element.settings?.fontWeight || "bold",
              textAlign: element.settings?.textAlign || "left",
              margin: 0
            }}>
              {element.content}
            </h2>
          </div>
        );
      
      case "text":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={elementStyle}
            onClick={() => handleElementSelect(element)}
          >
            <p style={{ 
              fontSize: element.settings?.fontSize || "16px",
              fontWeight: element.settings?.fontWeight || "normal",
              textAlign: element.settings?.textAlign || "left",
              margin: 0
            }}>
              {element.content}
            </p>
          </div>
        );
      
      case "button":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={elementStyle}
            onClick={() => handleElementSelect(element)}
          >
            <button style={{
              backgroundColor: element.settings?.buttonColor || "#2c6ecb",
              color: element.settings?.buttonTextColor || "#ffffff",
              border: "none",
              borderRadius: element.settings?.buttonRadius || "4px",
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer"
            }}>
              {element.content}
            </button>
          </div>
        );
      
      case "image":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={elementStyle}
            onClick={() => handleElementSelect(element)}
          >
            <img 
              src={element.content || "https://via.placeholder.com/400x200"} 
              alt={element.settings?.altText || "Image"} 
              style={{
                width: element.settings?.width || "100%",
                height: element.settings?.height || "auto",
                borderRadius: element.settings?.borderRadius || "0"
              }}
            />
          </div>
        );
      
      case "divider":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={elementStyle}
            onClick={() => handleElementSelect(element)}
          >
            <hr style={{
              border: "none",
              borderTop: `${element.settings?.dividerThickness || "1px"} ${element.settings?.dividerStyle || "solid"} ${element.settings?.dividerColor || "#e1e3e5"}`,
              margin: "10px 0"
            }} />
          </div>
        );
      
      case "section":
        return (
          <div 
            key={element.id} 
            className="builder-element" 
            style={{
              ...elementStyle,
              width: element.settings?.width || "100%",
              maxWidth: element.settings?.maxWidth || "1200px",
              minHeight: element.settings?.minHeight || "100px",
              margin: "0 auto 20px"
            }}
            onClick={() => handleElementSelect(element)}
          >
            <div style={{ padding: "20px" }}>
              {element.content && Array.isArray(element.content) && element.content.length > 0 ? (
                element.content.map(childElement => renderElement(childElement))
              ) : (
                <Text variant="bodyMd" as="p" alignment="center" color="subdued">
                  Empty Section - Drag elements here
                </Text>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Render the editor
  const renderEditor = () => {
    return (
      <div className={`page-builder-editor ${viewMode}`}>
        <div 
          className="editor-content"
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {pageElements.length > 0 ? (
            pageElements.map(element => renderElement(element))
          ) : (
            <div className="placeholder-content">
              <Text variant="headingLg" as="h2" alignment="center">
                Drag and drop widgets here to build your page
              </Text>
              <Text variant="bodyMd" as="p" alignment="center">
                Select widgets from the left panel and customize their properties in the right panel
              </Text>
            </div>
          )}
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
      
      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
