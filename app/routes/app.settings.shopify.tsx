import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Stack,
  Text,
  Spinner,
  Frame,
  Toast
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { json } from '@remix-run/node';
import { useLoaderData, useActionData, useSubmit } from '@remix-run/react';
import ShopifyApiGuide from '../components/ShopifyApiGuide';

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  // Fetch current Shopify API settings
  const settings = {
    apiKey: process.env.SHOPIFY_API_KEY || '',
    apiSecret: '••••••••••••••••', // Never expose the actual secret
    shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || '',
    scopes: process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_themes,write_themes,read_content,write_content'
  };
  
  return json({ settings });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const apiKey = formData.get('apiKey');
  const apiSecret = formData.get('apiSecret');
  const shopDomain = formData.get('shopDomain');
  const scopes = formData.get('scopes');
  
  // In a real implementation, you would save these settings to a secure storage
  // For this example, we'll just return success
  
  return json({ 
    success: true, 
    message: 'Shopify API settings updated successfully' 
  });
};

export default function ShopifySettings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);
  
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [apiSecret, setApiSecret] = useState('');
  const [shopDomain, setShopDomain] = useState(settings.shopDomain);
  const [scopes, setScopes] = useState(settings.scopes);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  
  // Show toast when action completes
  useEffect(() => {
    if (actionData?.success) {
      setToastMessage(actionData.message);
      setToastError(false);
      setToastActive(true);
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
      setToastError(true);
      setToastActive(true);
    }
  }, [actionData]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('apiKey', apiKey);
    formData.append('apiSecret', apiSecret || settings.apiSecret);
    formData.append('shopDomain', shopDomain);
    formData.append('scopes', scopes);
    
    submit(formData, { method: 'post' });
    setIsLoading(false);
  };
  
  const handleTestConnection = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/shopify/shop');
      
      if (response.ok) {
        const data = await response.json();
        setToastMessage('Connection successful! Connected to shop: ' + data.shop.name);
        setToastError(false);
        setToastActive(true);
      } else {
        const error = await response.json();
        setToastMessage('Connection failed: ' + (error.error || 'Unknown error'));
        setToastError(true);
        setToastActive(true);
      }
    } catch (error) {
      setToastMessage('Connection failed: ' + error.message);
      setToastError(true);
      setToastActive(true);
    }
    
    setIsLoading(false);
  };
  
  return (
    <Frame>
      <Page
        title="Shopify API Settings"
        backAction={{ content: 'Settings', url: '/app/settings' }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section>
                <Text variant="headingMd">API Credentials</Text>
                <Text variant="bodyMd" color="subdued">
                  Configure your Shopify API credentials to enable integration features.
                </Text>
              </Card.Section>
              
              <Card.Section>
                <Banner
                  title="Need Shopify API credentials?"
                  status="info"
                  action={{ content: 'View Guide', onAction: () => setShowGuide(true) }}
                >
                  <p>
                    You'll need to create a custom app in your Shopify Partner account
                    to get API credentials. Click "View Guide" for step-by-step instructions.
                  </p>
                </Banner>
              </Card.Section>
              
              <Card.Section>
                <form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      label="API Key"
                      value={apiKey}
                      onChange={setApiKey}
                      autoComplete="off"
                      helpText="Your Shopify API key from your custom app"
                      disabled={isLoading}
                    />
                    
                    <TextField
                      label="API Secret"
                      value={apiSecret}
                      onChange={setApiSecret}
                      autoComplete="off"
                      type="password"
                      helpText="Your Shopify API secret from your custom app. Leave blank to keep existing secret."
                      disabled={isLoading}
                    />
                    
                    <TextField
                      label="Shop Domain"
                      value={shopDomain}
                      onChange={setShopDomain}
                      autoComplete="off"
                      helpText="Your Shopify store domain (e.g., your-store.myshopify.com)"
                      disabled={isLoading}
                    />
                    
                    <TextField
                      label="API Scopes"
                      value={scopes}
                      onChange={setScopes}
                      autoComplete="off"
                      helpText="Comma-separated list of API scopes required for integration"
                      disabled={isLoading}
                    />
                    
                    <Stack distribution="trailing">
                      <Button onClick={handleTestConnection} disabled={isLoading}>
                        Test Connection
                      </Button>
                      <Button primary submit disabled={isLoading}>
                        {isLoading ? <Spinner accessibilityLabel="Saving" size="small" /> : 'Save'}
                      </Button>
                    </Stack>
                  </FormLayout>
                </form>
              </Card.Section>
            </Card>
          </Layout.Section>
          
          {showGuide && (
            <Layout.Section>
              <ShopifyApiGuide onClose={() => setShowGuide(false)} />
            </Layout.Section>
          )}
        </Layout>
        
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}
      </Page>
    </Frame>
  );
}