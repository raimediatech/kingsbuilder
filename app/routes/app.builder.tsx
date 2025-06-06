import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Box,
  InlineStack,
  Modal,
  TextField,
  FormLayout,
  SkeletonBodyText,
  Banner,
  List,
  Link,
  EmptyState,
  Spinner,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit, useNavigation } from "@remix-run/react";
import { fetchPages, createPage, updatePage, deletePage } from "../utils/shopify-api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const pages = await fetchPages(session);
    return json({ pages, error: null });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return json({ 
      pages: [], 
      error: "Failed to fetch pages. Please try again later." 
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "create": {
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const handle = formData.get("handle") as string;
        
        const page = await createPage(session, title, content, handle);
        return json({ success: true, page, error: null });
      }
      
      case "update": {
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        
        const page = await updatePage(session, id, title, content);
        return json({ success: true, page, error: null });
      }
      
      case "delete": {
        const id = formData.get("id") as string;
        await deletePage(session, id);
        return json({ success: true, error: null });
      }
      
      default:
        return json({ success: false, error: "Invalid action" });
    }
  } catch (error: any) {
    console.error(`Error performing ${action}:`, error);
    return json({ 
      success: false, 
      error: error.message || `Failed to ${action} page. Please try again.` 
    });
  }
};

export default function Builder() {
  const { pages, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      setIsCreating(false);
      setIsEditing(false);
      setToastMessage(
        actionData.page 
          ? `Page "${actionData.page.title}" has been ${selectedPage ? "updated" : "created"} successfully.`
          : "Page has been deleted successfully."
      );
      setToastError(false);
      setShowToast(true);
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
      setToastError(true);
      setShowToast(true);
    }
  }, [actionData]);

  const handleCreatePage = () => {
    setTitle("");
    setHandle("");
    setContent("");
    setSelectedPage(null);
    setIsCreating(true);
  };

  const handleEditPage = (page: any) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.body);
    setHandle(page.handle);
    setIsEditing(true);
  };

  const handleSavePage = () => {
    const formData = new FormData();
    
    if (selectedPage) {
      formData.append("action", "update");
      formData.append("id", selectedPage.id);
    } else {
      formData.append("action", "create");
      formData.append("handle", handle);
    }
    
    formData.append("title", title);
    formData.append("content", content);
    
    submit(formData, { method: "post" });
  };

  const handleDeletePage = (page: any) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("id", page.id);
      submit(formData, { method: "post" });
    }
  };

  const renderPagesList = () => {
    if (error) {
      return (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      );
    }

    if (isLoading) {
      return <SkeletonBodyText lines={3} />;
    }

    if (pages.length === 0) {
      return (
        <EmptyState
          heading="No pages created yet"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Create your first page to get started.</p>
        </EmptyState>
      );
    }

    return (
      <List type="bullet">
        {pages.map((page) => (
          <List.Item key={page.id}>
            <InlineStack gap="300" align="space-between">
              <Link url={page.url} external>
                {page.title}
              </Link>
              <InlineStack gap="200">
                <Button size="slim" onClick={() => handleEditPage(page)}>
                  Edit
                </Button>
                <Button size="slim" destructive onClick={() => handleDeletePage(page)}>
                  Delete
                </Button>
              </InlineStack>
            </InlineStack>
          </List.Item>
        ))}
      </List>
    );
  };

  return (
    <Page>
      <TitleBar title="Page Builder" />
      
      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
        />
      )}
      
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
                <Button primary onClick={handleCreatePage}>Create New Page</Button>
                <Button url="/app/templates">View Templates</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Your Shopify Pages
              </Text>
              {renderPagesList()}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      
      <Modal
        open={isCreating || isEditing}
        onClose={() => (isCreating ? setIsCreating(false) : setIsEditing(false))}
        title={isCreating ? "Create New Page" : "Edit Page"}
        primaryAction={{
          content: isLoading ? <Spinner size="small" /> : "Save",
          onAction: handleSavePage,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => (isCreating ? setIsCreating(false) : setIsEditing(false)),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Page Title"
              value={title}
              onChange={setTitle}
              autoComplete="off"
              requiredIndicator
            />
            
            {isCreating && (
              <TextField
                label="URL Handle"
                value={handle}
                onChange={setHandle}
                autoComplete="off"
                helpText="The URL path for this page (e.g., 'about-us')"
              />
            )}
            
            <TextField
              label="Page Content"
              value={content}
              onChange={setContent}
              multiline={5}
              autoComplete="off"
              helpText="Enter HTML content or use the visual editor (coming soon)"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}