import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Builder() {
  return (
    <Page>
      <TitleBar title="Page Builder" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Welcome to KingsBuilder
              </Text>
              <Text as="p" variant="bodyMd">
                This is where you'll build and customize your pages. The builder interface will allow you to:
              </Text>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">• Create new pages with drag-and-drop components</Text>
                <Text as="p" variant="bodyMd">• Customize layouts and designs</Text>
                <Text as="p" variant="bodyMd">• Preview your changes in real-time</Text>
                <Text as="p" variant="bodyMd">• Publish pages to your Shopify store</Text>
              </BlockStack>
              <InlineStack gap="300">
                <Button primary>Create New Page</Button>
                <Button>View Templates</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Recent Pages
              </Text>
              <Text as="p" variant="bodyMd">
                You haven't created any pages yet. Click "Create New Page" to get started.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}