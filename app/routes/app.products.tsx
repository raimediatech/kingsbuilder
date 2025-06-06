import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Thumbnail,
  BlockStack,
  InlineStack,
  Button,
  Banner,
  SkeletonBodyText,
  EmptyState,
  Modal,
  TextField,
  FormLayout,
  Select,
  Spinner,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchProducts, fetchCollections } from "../utils/shopify-api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const products = await fetchProducts(session, 20);
    const collections = await fetchCollections(session, 20);
    return json({ products, collections, error: null });
  } catch (error) {
    console.error("Error fetching data:", error);
    return json({ 
      products: [], 
      collections: [],
      error: "Failed to fetch products and collections. Please try again later." 
    });
  }
};

export default function Products() {
  const { products, collections, error } = useLoaderData<typeof loader>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgetType, setWidgetType] = useState("product");
  const [widgetTitle, setWidgetTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  const handleWidgetCreate = () => {
    // In a real implementation, this would save the widget configuration
    // and make it available in the page builder
    setShowWidgetModal(false);
    setShowToast(true);
  };
  
  const renderItem = (item: any) => {
    const { id, title, featuredImage, priceRangeV2 } = item;
    const media = (
      <Thumbnail
        source={featuredImage?.url || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png"}
        alt={featuredImage?.altText || title}
      />
    );
    
    const price = priceRangeV2?.minVariantPrice
      ? `${priceRangeV2.minVariantPrice.amount} ${priceRangeV2.minVariantPrice.currencyCode}`
      : "No price";
    
    return (
      <ResourceItem
        id={id}
        media={media}
        accessibilityLabel={`View details for ${title}`}
        onClick={() => {}}
      >
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {title}
        </Text>
        <div>{price}</div>
      </ResourceItem>
    );
  };
  
  return (
    <Page>
      <TitleBar title="Product Widgets" />
      
      {showToast && (
        <Toast
          content="Widget created successfully! You can now use it in the page builder."
          onDismiss={() => setShowToast(false)}
        />
      )}
      
      {error && (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      )}
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Products
              </Text>
              
              <InlineStack gap="200">
                <Button 
                  primary 
                  onClick={() => {
                    setWidgetType("product");
                    setWidgetTitle("Featured Products");
                    setShowWidgetModal(true);
                  }}
                >
                  Create Product Widget
                </Button>
                <Button 
                  onClick={() => {
                    setWidgetType("collection");
                    setWidgetTitle("Featured Collection");
                    setShowWidgetModal(true);
                  }}
                >
                  Create Collection Widget
                </Button>
              </InlineStack>
              
              {products.length > 0 ? (
                <ResourceList
                  resourceName={{ singular: "product", plural: "products" }}
                  items={products}
                  renderItem={renderItem}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  selectable
                />
              ) : !error ? (
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Add products to your store to create product widgets.</p>
                </EmptyState>
              ) : (
                <SkeletonBodyText lines={5} />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Collections
              </Text>
              
              {collections.length > 0 ? (
                <ResourceList
                  resourceName={{ singular: "collection", plural: "collections" }}
                  items={collections}
                  renderItem={(collection) => (
                    <ResourceItem
                      id={collection.id}
                      accessibilityLabel={`View details for ${collection.title}`}
                      onClick={() => {}}
                    >
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {collection.title}
                      </Text>
                    </ResourceItem>
                  )}
                />
              ) : !error ? (
                <EmptyState
                  heading="No collections found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Add collections to your store to create collection widgets.</p>
                </EmptyState>
              ) : (
                <SkeletonBodyText lines={3} />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      
      <Modal
        open={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        title={`Create ${widgetType === "product" ? "Product" : "Collection"} Widget`}
        primaryAction={{
          content: "Create Widget",
          onAction: handleWidgetCreate,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowWidgetModal(false),
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
            />
            
            <Select
              label="Display Style"
              options={[
                { label: "Grid", value: "grid" },
                { label: "Carousel", value: "carousel" },
                { label: "List", value: "list" },
              ]}
              value="grid"
              onChange={() => {}}
            />
            
            {widgetType === "product" ? (
              <Select
                label="Select Products"
                options={[
                  { label: "Selected Products", value: "selected" },
                  { label: "Featured Products", value: "featured" },
                  { label: "Best Selling", value: "best-selling" },
                  { label: "Newest", value: "newest" },
                ]}
                value="selected"
                onChange={() => {}}
                helpText="Choose which products to display in this widget"
              />
            ) : (
              <Select
                label="Select Collection"
                options={collections.map((collection) => ({
                  label: collection.title,
                  value: collection.id,
                }))}
                value={collections.length > 0 ? collections[0].id : ""}
                onChange={() => {}}
                helpText="Choose which collection to display in this widget"
              />
            )}
            
            <TextField
              label="Number of Products to Show"
              type="number"
              value="4"
              onChange={() => {}}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}