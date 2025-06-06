import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Tabs,
  Modal,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Banner,
  Toast,
  Icon,
  EmptyState,
  SkeletonBodyText,
  Box,
  LegacyCard,
} from "@shopify/polaris";
import { CodeMajor, FormsMajor, SocialMajor, VideoMajor } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { createWidget, type Widget } from "../utils/widget-utils";

// Mock data for widgets - in a real app, this would come from a database
const mockWidgets: Widget[] = [
  createWidget("custom-code", "Header Script"),
  createWidget("form", "Contact Form"),
  createWidget("social-media", "Instagram Feed"),
  createWidget("video", "Product Video"),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // In a real app, you would fetch widgets from a database
  return json({ widgets: mockWidgets });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "create": {
        const type = formData.get("type") as string;
        const title = formData.get("title") as string;
        
        // In a real app, you would save this to a database
        const widget = createWidget(type, title);
        
        return json({ success: true, widget, error: null });
      }
      
      default:
        return json({ success: false, error: "Invalid action" });
    }
  } catch (error: any) {
    console.error(`Error performing ${action}:`, error);
    return json({ 
      success: false, 
      error: error.message || `Failed to ${action} widget. Please try again.` 
    });
  }
};

export default function AdvancedWidgets() {
  const { widgets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [widgetType, setWidgetType] = useState("custom-code");
  const [widgetTitle, setWidgetTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  
  // Filter widgets by type based on selected tab
  const filteredWidgets = widgets.filter(widget => {
    if (selectedTab === 0) return true;
    if (selectedTab === 1) return widget.type === "custom-code";
    if (selectedTab === 2) return widget.type === "form";
    if (selectedTab === 3) return widget.type === "social-media";
    if (selectedTab === 4) return widget.type === "video";
    return false;
  });
  
  const handleCreateWidget = () => {
    const formData = new FormData();
    formData.append("action", "create");
    formData.append("type", widgetType);
    formData.append("title", widgetTitle);
    
    submit(formData, { method: "post" });
    setShowCreateModal(false);
    setToastMessage(`${widgetTitle} widget created successfully!`);
    setToastError(false);
    setShowToast(true);
  };
  
  const tabs = [
    {
      id: "all",
      content: "All Widgets",
      accessibilityLabel: "All widgets",
      panelID: "all-widgets",
    },
    {
      id: "custom-code",
      content: "Custom Code",
      accessibilityLabel: "Custom code widgets",
      panelID: "custom-code-widgets",
    },
    {
      id: "forms",
      content: "Forms",
      accessibilityLabel: "Form widgets",
      panelID: "form-widgets",
    },
    {
      id: "social",
      content: "Social Media",
      accessibilityLabel: "Social media widgets",
      panelID: "social-media-widgets",
    },
    {
      id: "video",
      content: "Video",
      accessibilityLabel: "Video widgets",
      panelID: "video-widgets",
    },
  ];
  
  const renderWidgetCard = (widget: Widget) => {
    let icon;
    switch (widget.type) {
      case "custom-code":
        icon = <Icon source={CodeMajor} />;
        break;
      case "form":
        icon = <Icon source={FormsMajor} />;
        break;
      case "social-media":
        icon = <Icon source={SocialMajor} />;
        break;
      case "video":
        icon = <Icon source={VideoMajor} />;
        break;
      default:
        icon = null;
    }
    
    return (
      <LegacyCard key={widget.id}>
        <LegacyCard.Section>
          <InlineStack gap="400" align="space-between">
            <InlineStack gap="200">
              {icon}
              <Text variant="headingMd" as="h3">{widget.title}</Text>
            </InlineStack>
            <Button size="slim">Edit</Button>
          </InlineStack>
        </LegacyCard.Section>
        <LegacyCard.Section>
          {widget.type === "custom-code" && (
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Language: {(widget as any).settings.language}</Text>
              <div style={{ background: "#f4f6f8", padding: "10px", borderRadius: "4px" }}>
                <pre style={{ margin: 0, overflow: "auto" }}>
                  <code>{(widget as any).settings.code.substring(0, 100)}...</code>
                </pre>
              </div>
            </BlockStack>
          )}
          
          {widget.type === "form" && (
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Fields: {(widget as any).settings.fields.length}</Text>
              <Text variant="bodyMd" as="p">Submit button: {(widget as any).settings.submitButtonText}</Text>
            </BlockStack>
          )}
          
          {widget.type === "social-media" && (
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Platform: {(widget as any).settings.platform}</Text>
              <Text variant="bodyMd" as="p">Display type: {(widget as any).settings.displayType}</Text>
            </BlockStack>
          )}
          
          {widget.type === "video" && (
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Video type: {(widget as any).settings.videoType}</Text>
              <Text variant="bodyMd" as="p">Autoplay: {(widget as any).settings.autoplay ? 'Yes' : 'No'}</Text>
              <Text variant="bodyMd" as="p">Controls: {(widget as any).settings.controls ? 'Yes' : 'No'}</Text>
            </BlockStack>
          )}
        </LegacyCard.Section>
        <LegacyCard.Section>
          <InlineStack gap="200">
            <Button size="slim">Preview</Button>
            <Button size="slim">Use in Builder</Button>
          </InlineStack>
        </LegacyCard.Section>
      </LegacyCard>
    );
  };
  
  return (
    <Page>
      <TitleBar title="Advanced Widgets" />
      
      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
        />
      )}
      
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Advanced Widgets
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Create and manage advanced widgets for your Shopify store. These widgets can be added to your pages using the page builder.
                  </Text>
                </BlockStack>
                
                <InlineStack gap="200">
                  <Button 
                    primary 
                    onClick={() => {
                      setWidgetType("custom-code");
                      setWidgetTitle("Custom Code");
                      setShowCreateModal(true);
                    }}
                  >
                    Create Custom Code Widget
                  </Button>
                  <Button 
                    onClick={() => {
                      setWidgetType("form");
                      setWidgetTitle("Contact Form");
                      setShowCreateModal(true);
                    }}
                  >
                    Create Form Widget
                  </Button>
                  <Button 
                    onClick={() => {
                      setWidgetType("social-media");
                      setWidgetTitle("Social Media Feed");
                      setShowCreateModal(true);
                    }}
                  >
                    Create Social Media Widget
                  </Button>
                  <Button 
                    onClick={() => {
                      setWidgetType("video");
                      setWidgetTitle("Product Video");
                      setShowCreateModal(true);
                    }}
                  >
                    Create Video Widget
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
        
        <Layout>
          {filteredWidgets.length > 0 ? (
            filteredWidgets.map(widget => (
              <Layout.Section key={widget.id} oneThird>
                {renderWidgetCard(widget)}
              </Layout.Section>
            ))
          ) : (
            <Layout.Section>
              <EmptyState
                heading="No widgets found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create your first widget using the buttons above.</p>
              </EmptyState>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>
      
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create ${
          widgetType === "custom-code" 
            ? "Custom Code" 
            : widgetType === "form" 
              ? "Form" 
              : widgetType === "social-media"
                ? "Social Media"
                : "Video"
        } Widget`}
        primaryAction={{
          content: "Create Widget",
          onAction: handleCreateWidget,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowCreateModal(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Widget Title"
              value={widgetTitle}
              onChange={setWidgetTitle}
              autoComplete="off"
              requiredIndicator
            />
            
            {widgetType === "custom-code" && (
              <Select
                label="Code Type"
                options={[
                  { label: "HTML", value: "html" },
                  { label: "CSS", value: "css" },
                  { label: "JavaScript", value: "javascript" },
                ]}
                value="html"
                onChange={() => {}}
              />
            )}
            
            {widgetType === "form" && (
              <Select
                label="Form Type"
                options={[
                  { label: "Contact Form", value: "contact" },
                  { label: "Newsletter Signup", value: "newsletter" },
                  { label: "Custom Form", value: "custom" },
                ]}
                value="contact"
                onChange={() => {}}
              />
            )}
            
            {widgetType === "social-media" && (
              <Select
                label="Platform"
                options={[
                  { label: "Instagram", value: "instagram" },
                  { label: "Facebook", value: "facebook" },
                  { label: "Twitter", value: "twitter" },
                  { label: "TikTok", value: "tiktok" },
                ]}
                value="instagram"
                onChange={() => {}}
              />
            )}
            
            {widgetType === "video" && (
              <>
                <Select
                  label="Video Type"
                  options={[
                    { label: "YouTube", value: "youtube" },
                    { label: "Vimeo", value: "vimeo" },
                    { label: "Shopify", value: "shopify" },
                    { label: "Custom", value: "custom" },
                  ]}
                  value="youtube"
                  onChange={() => {}}
                />
                <TextField
                  label="Video ID or URL"
                  value=""
                  onChange={() => {}}
                  placeholder="e.g., dQw4w9WgXcQ for YouTube"
                  helpText="For YouTube or Vimeo, enter the video ID. For custom videos, enter the full URL."
                />
                <Checkbox
                  label="Autoplay video"
                  checked={false}
                  onChange={() => {}}
                />
                <Checkbox
                  label="Show video controls"
                  checked={true}
                  onChange={() => {}}
                />
                <Checkbox
                  label="Responsive sizing"
                  checked={true}
                  onChange={() => {}}
                />
              </>
            )}
            
            <Text variant="bodyMd" as="p" color="subdued">
              You can configure more settings after creating the widget.
            </Text>
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}