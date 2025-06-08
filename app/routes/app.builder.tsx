import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  InlineStack,
  Modal,
  TextField,
  FormLayout,
  List,
  Link,
  EmptyState,
  Toast,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import PageBuilder from "../components/PageBuilder";

// Mock data for demo purposes
const MOCK_PAGES = [
  { id: "1", title: "Home Page", body: "<h1>Home Page</h1>", url: "#", handle: "home" },
  { id: "2", title: "About Us", body: "<h1>About Us</h1>", url: "#", handle: "about-us" },
  { id: "3", title: "Contact", body: "<h1>Contact Us</h1>", url: "#", handle: "contact" },
];

export default function Builder() {
  const [pages, setPages] = useState(MOCK_PAGES);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const handleCreatePage = () => {
    setTitle("");
    setHandle("");
    setContent("");
    setSelectedPage(null);
    setIsCreating(true);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.body);
    setHandle(page.handle);
    setIsEditing(true);
  };

  const handleOpenPageBuilder = (page) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.body);
    setHandle(page.handle);
    setIsBuilderMode(true);
  };

  const handleSavePage = () => {
    if (selectedPage) {
      // Update existing page
      const updatedPages = pages.map(p => 
        p.id === selectedPage.id 
          ? { ...p, title, body: content, handle } 
          : p
      );
      setPages(updatedPages);
    } else {
      // Create new page
      const newPage = {
        id: String(Date.now()),
        title,
        body: content,
        handle,
        url: `#${handle}`,
      };
      setPages([...pages, newPage]);
    }
    
    setToastMessage(`Page "${title}" has been ${selectedPage ? "updated" : "created"} successfully.`);
    setToastError(false);
    setShowToast(true);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleSaveBuilderPage = (pageData) => {
    // In a real app, you would convert pageData to HTML
    const updatedPages = pages.map(p => 
      p.id === selectedPage.id 
        ? { ...p, pageBuilderData: pageData } 
        : p
    );
    setPages(updatedPages);
    
    setToastMessage(`Page "${selectedPage.title}" has been updated successfully.`);
    setToastError(false);
    setShowToast(true);
    setIsBuilderMode(false);
  };

  const handleDeletePage = (page) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      const updatedPages = pages.filter(p => p.id !== page.id);
      setPages(updatedPages);
      
      setToastMessage("Page has been deleted successfully.");
      setToastError(false);
      setShowToast(true);
    }
  };

  const handleCreatePage = () => {
    setTitle("");
    setHandle("");
    setContent("");
    setSelectedPage(null);
    setIsCreating(true);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.body);
    setHandle(page.handle);
    setIsEditing(true);
  };

  const handleOpenPageBuilder = (page) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.body);
    setHandle(page.handle);
    setIsBuilderMode(true);
  };

  const handleSavePage = () => {
    if (selectedPage) {
      // Update existing page
      const updatedPages = pages.map(p => 
        p.id === selectedPage.id 
          ? { ...p, title, body: content, handle } 
          : p
      );
      setPages(updatedPages);
    } else {
      // Create new page
      const newPage = {
        id: String(Date.now()),
        title,
        body: content,
        handle,
        url: `#${handle}`,
      };
      setPages([...pages, newPage]);
    }
    
    setToastMessage(`Page "${title}" has been ${selectedPage ? "updated" : "created"} successfully.`);
    setToastError(false);
    setShowToast(true);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleSaveBuilderPage = (pageData) => {
    // In a real app, you would convert pageData to HTML
    const updatedPages = pages.map(p => 
      p.id === selectedPage.id 
        ? { ...p, pageBuilderData: pageData } 
        : p
    );
    setPages(updatedPages);
    
    setToastMessage(`Page "${selectedPage.title}" has been updated successfully.`);
    setToastError(false);
    setShowToast(true);
    setIsBuilderMode(false);
  };

  const handleDeletePage = (page) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      const updatedPages = pages.filter(p => p.id !== page.id);
      setPages(updatedPages);
      
      setToastMessage("Page has been deleted successfully.");
      setToastError(false);
      setShowToast(true);
    }
  };

  const renderPagesList = () => {
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
                <Button size="slim" onClick={() => handleOpenPageBuilder(page)}>
                  Page Builder
                </Button>
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

  // If in builder mode, show the page builder interface
  if (isBuilderMode) {
    return (
      <Frame>
        <Page fullWidth>
          <TitleBar
            title={`Editing: ${selectedPage.title}`}
            primaryAction={{
              content: "Exit Builder",
              onAction: () => setIsBuilderMode(false),
            }}
          />
          
          {showToast && (
            <Toast
              content={toastMessage}
              error={toastError}
              onDismiss={() => setShowToast(false)}
            />
          )}
          
          <div style={{ height: "calc(100vh - 56px)" }}>
            <PageBuilder 
              initialPage={{
                id: selectedPage.id,
                title: selectedPage.title,
                content: selectedPage.pageBuilderData || []
              }}
              onSave={handleSaveBuilderPage}
            />
          </div>
        </Page>
      </Frame>
    );
  }

  // Default view - page list and creation
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

  // Default view - page list and creation
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
                This is where you'll build and customize your pages.
              </Text>
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
          content: "Save",
          onAction: handleSavePage,
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
              helpText="Enter HTML content or use the visual editor"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
