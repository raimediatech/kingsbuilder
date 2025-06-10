import { useState, useEffect } from "react";
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
  Banner
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pages from API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/pages?shop=your-shop.myshopify.com');
        // const data = await response.json();
        // setPages(data);
        
        // Using mock data for now
        setPages(MOCK_PAGES);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Failed to load pages. Please try again.');
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

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

  const handleSavePage = async () => {
    try {
      setIsLoading(true);
      
      if (selectedPage) {
        // Update existing page
        try {
          const response = await fetch(`/api/pages/${selectedPage.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content: content || "", handle })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Page updated successfully:', result);
            
            const updatedPages = pages.map(p => 
              p.id === selectedPage.id 
                ? { ...p, title, body: content, handle } 
                : p
            );
            setPages(updatedPages);
            
            setToastMessage(`Page "${title}" has been updated successfully.`);
            setToastError(false);
          } else {
            const errorData = await response.json();
            console.error('Error updating page:', errorData);
            setToastMessage(`Failed to update page: ${errorData.error || 'Unknown error'}`);
            setToastError(true);
          }
        } catch (error) {
          console.error('Error updating page:', error);
          
          // Fallback to local update if API fails
          const updatedPages = pages.map(p => 
            p.id === selectedPage.id 
              ? { ...p, title, body: content, handle } 
              : p
          );
          setPages(updatedPages);
          
          setToastMessage(`Page "${title}" has been updated locally (API unavailable).`);
          setToastError(false);
        }
      } else {
        // Create new page
        try {
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title, 
              content: content || "", 
              handle: handle || title.toLowerCase().replace(/\s+/g, '-') 
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Page created successfully:', result);
            
            const newPage = {
              id: result.page?.id || String(Date.now()),
              title,
              body: content,
              handle: handle || title.toLowerCase().replace(/\s+/g, '-'),
              url: `#${handle || title.toLowerCase().replace(/\s+/g, '-')}`,
            };
            setPages([...pages, newPage]);
            
            setToastMessage(`Page "${title}" has been created successfully.`);
            setToastError(false);
          } else {
            const errorData = await response.json();
            console.error('Error creating page:', errorData);
            setToastMessage(`Failed to create page: ${errorData.error || 'Unknown error'}`);
            setToastError(true);
          }
        } catch (error) {
          console.error('Error creating page:', error);
          
          // Fallback to local creation if API fails
          const newPage = {
            id: String(Date.now()),
            title,
            body: content,
            handle: handle || title.toLowerCase().replace(/\s+/g, '-'),
            url: `#${handle || title.toLowerCase().replace(/\s+/g, '-')}`,
          };
          setPages([...pages, newPage]);
          
          setToastMessage(`Page "${title}" has been created locally (API unavailable).`);
          setToastError(false);
        }
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setShowToast(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving page:', err);
      setToastMessage('Failed to save page. Please try again.');
      setToastError(true);
      setShowToast(true);
      setIsLoading(false);
    }
  };

  const handleSaveBuilderPage = async (pageData) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API
      // await fetch(`/api/pages/${selectedPage.handle}?shop=your-shop.myshopify.com`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pageBuilderData: pageData })
      // });
      
      // Update local state
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
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving page:', err);
      setToastMessage('Failed to save page. Please try again.');
      setToastError(true);
      setShowToast(true);
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (page) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      try {
        setIsLoading(true);
        
        // In a real app, you would call your API
        // await fetch(`/api/pages/${page.handle}?shop=your-shop.myshopify.com`, {
        //   method: 'DELETE'
        // });
        
        const updatedPages = pages.filter(p => p.id !== page.id);
        setPages(updatedPages);
        
        setToastMessage("Page has been deleted successfully.");
        setToastError(false);
        setShowToast(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error deleting page:', err);
        setToastMessage('Failed to delete page. Please try again.');
        setToastError(true);
        setShowToast(true);
        setIsLoading(false);
      }
    }
  };

  const renderPagesList = () => {
    if (isLoading) {
      return <Text as="p">Loading pages...</Text>;
    }
    
    if (error) {
      return (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      );
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
  if (isBuilderMode && selectedPage) {
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

      <Modal
        open={isCreating || isEditing}
        onClose={() => (isCreating ? setIsCreating(false) : setIsEditing(false))}
        title={isCreating ? "Create New Page" : "Edit Page"}
        primaryAction={{
          content: "Save",
          onAction: handleSavePage,
          loading: isLoading
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => (isCreating ? setIsCreating(false) : setIsEditing(false)),
            disabled: isLoading
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
              disabled={isLoading}
            />

            {isCreating && (
              <TextField
                label="URL Handle"
                value={handle}
                onChange={setHandle}
                autoComplete="off"
                helpText="The URL path for this page (e.g., 'about-us')"
                disabled={isLoading}
              />
            )}

            <TextField
              label="Page Content"
              value={content}
              onChange={setContent}
              multiline={5}
              autoComplete="off"
              helpText="Enter HTML content or use the visual editor"
              disabled={isLoading}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}