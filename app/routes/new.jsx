// app/routes/new.jsx
import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  FormLayout,
  TextField,
  Select,
  PageActions
} from "@shopify/polaris";

export const loader = async () => {
  return json({
    templates: [
      { label: "Blank", value: "blank" },
      { label: "Product Page", value: "product" },
      { label: "About Us", value: "about" },
      { label: "Contact", value: "contact" }
    ]
  });
};

export default function NewPage() {
  const navigate = useNavigate();

  return (
    <Page
      title="Create New Page"
      backAction={{ content: "Pages", onAction: () => navigate("/") }}
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Page Details</Text>
            
            <FormLayout>
              <TextField
                label="Page Title"
                autoComplete="off"
                placeholder="e.g. About Us, Contact, etc."
              />
              
              <TextField
                label="URL Handle"
                autoComplete="off"
                placeholder="e.g. about-us, contact, etc."
                helpText="This will be used in the URL of your page."
              />
              
              <Select
                label="Template"
                options={[
                  { label: "Blank", value: "blank" },
                  { label: "Product Page", value: "product" },
                  { label: "About Us", value: "about" },
                  { label: "Contact", value: "contact" }
                ]}
                helpText="Choose a template to start with or select 'Blank' for a clean slate."
              />
            </FormLayout>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">SEO Settings</Text>
            
            <FormLayout>
              <TextField
                label="Meta Title"
                autoComplete="off"
                placeholder="Page title for search engines"
                helpText="Appears in browser tabs and search results."
              />
              
              <TextField
                label="Meta Description"
                autoComplete="off"
                placeholder="Brief description of this page"
                multiline={3}
                helpText="Appears in search engine results."
              />
            </FormLayout>
          </BlockStack>
        </Card>
        
        <PageActions
          primaryAction={{
            content: "Create Page",
            onAction: () => {
              alert("This would create a new page and open the editor. Full functionality coming soon!");
              navigate("/");
            }
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => navigate("/")
            }
          ]}
        />
      </BlockStack>
    </Page>
  );
}
