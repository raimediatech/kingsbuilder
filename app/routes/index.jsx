// app/routes/index.jsx
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  EmptyState
} from "@shopify/polaris";

export const loader = async () => {
  return json({
    pages: []
  });
};

export default function Index() {
  const { pages } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="KingsBuilder">
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="500">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Pages</Text>
              <Text as="p" variant="bodyMd">Create and manage custom pages for your Shopify store.</Text>
            </BlockStack>
            
            <Box>
              <Button primary onClick={() => navigate("/new")}>Create New Page</Button>
            </Box>
            
            {pages.length === 0 ? (
              <EmptyState
                heading="No pages yet"
                action={{content: 'Create page', onAction: () => navigate("/new")}}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create your first page to start building your store.</p>
              </EmptyState>
            ) : (
              <div>
                {/* Page list would go here */}
                <Text as="p" variant="bodyMd">Your pages will appear here.</Text>
              </div>
            )}
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Quick Start Guide</Text>
            <Text as="p" variant="bodyMd">Follow these steps to create your first custom page:</Text>
            
            <List type="number">
              <List.Item>Click "Create New Page" to start with a blank canvas or template</List.Item>
              <List.Item>Use the drag-and-drop editor to add and arrange elements</List.Item>
              <List.Item>Customize colors, fonts, and content to match your brand</List.Item>
              <List.Item>Preview your page to see how it will look on different devices</List.Item>
              <List.Item>Publish your page when you're ready to make it live</List.Item>
            </List>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
