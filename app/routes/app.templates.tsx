import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

// Mock template data - in a real app, this would come from your database
const templates = [
  {
    id: "1",
    name: "Product Landing Page",
    description: "A high-converting product landing page template",
    thumbnail: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-image.png",
  },
  {
    id: "2",
    name: "Collection Showcase",
    description: "Display your product collections with style",
    thumbnail: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-image.png",
  },
  {
    id: "3",
    name: "About Us",
    description: "Tell your brand story with this customizable template",
    thumbnail: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-image.png",
  },
];

export default function Templates() {
  return (
    <Page>
      <TitleBar title="Page Templates" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Available Templates
              </Text>
              <Text as="p" variant="bodyMd">
                Choose a template to get started quickly. All templates can be fully customized in the builder.
              </Text>
              <ResourceList
                resourceName={{ singular: "template", plural: "templates" }}
                items={templates}
                renderItem={(item) => {
                  const { id, name, description, thumbnail } = item;
                  return (
                    <ResourceItem
                      id={id}
                      accessibilityLabel={`View details for ${name}`}
                      name={name}
                      media={<Thumbnail source={thumbnail} alt={name} />}
                      onClick={() => {}}
                    >
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {name}
                      </Text>
                      <div style={{ margin: "0.5rem 0" }}>
                        <Text variant="bodyMd" as="p">
                          {description}
                        </Text>
                      </div>
                      <Button size="slim">Use Template</Button>
                    </ResourceItem>
                  );
                }}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}