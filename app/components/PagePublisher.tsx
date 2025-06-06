import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  TextField,
  FormLayout,
  Checkbox,
  Banner,
  Stack,
  TextContainer,
  Spinner
} from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';

interface PageData {
  title: string;
  handle?: string;
  content: string;
  isPublished?: boolean;
  templateSuffix?: string;
}

interface PagePublisherProps {
  pageData: PageData;
  onSuccess?: (publishedPage: any) => void;
  onError?: (error: Error) => void;
}

export function PagePublisher({ pageData, onSuccess, onError }: PagePublisherProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(pageData.title || '');
  const [handle, setHandle] = useState(pageData.handle || '');
  const [isPublished, setIsPublished] = useState(pageData.isPublished !== false);
  const [templateSuffix, setTemplateSuffix] = useState(pageData.templateSuffix || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare page data
      const publishData = {
        title,
        handle: handle || undefined,
        content: pageData.content,
        isPublished,
        templateSuffix: templateSuffix || undefined
      };
      
      // Send request to publish page
      const response = await fetch('/api/pages/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish page');
      }
      
      const result = await response.json();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result.page);
      }
      
      setIsSubmitting(false);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
      
      // Call error callback
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  return (
    <>
      <Button primary onClick={() => setIsModalOpen(true)}>
        Publish to Shopify
      </Button>
      
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Page to Shopify"
        primaryAction={{
          content: 'Publish',
          onAction: handlePublish,
          loading: isSubmitting,
          disabled: isSubmitting
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsModalOpen(false),
            disabled: isSubmitting
          }
        ]}
      >
        <Modal.Section>
          {error && (
            <Banner status="critical" title="Error">
              {error}
            </Banner>
          )}
          
          <FormLayout>
            <TextField
              label="Page Title"
              value={title}
              onChange={setTitle}
              autoComplete="off"
              requiredIndicator
              disabled={isSubmitting}
            />
            
            <TextField
              label="URL Handle"
              value={handle}
              onChange={setHandle}
              autoComplete="off"
              helpText="Leave blank to auto-generate from title"
              disabled={isSubmitting}
            />
            
            <TextField
              label="Template Suffix"
              value={templateSuffix}
              onChange={setTemplateSuffix}
              autoComplete="off"
              helpText="Optional template suffix (e.g., 'kingsbuilder')"
              disabled={isSubmitting}
            />
            
            <Checkbox
              label="Publish page immediately"
              checked={isPublished}
              onChange={setIsPublished}
              disabled={isSubmitting}
            />
          </FormLayout>
          
          {isSubmitting && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Stack vertical spacing="tight">
                <Spinner size="large" />
                <TextContainer>
                  <p>Publishing page to Shopify...</p>
                </TextContainer>
              </Stack>
            </div>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
}

export default PagePublisher;