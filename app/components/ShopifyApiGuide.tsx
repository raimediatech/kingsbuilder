import React from 'react';
import {
  Card,
  TextContainer,
  List,
  Link,
  Heading,
  Button,
  Banner,
  Stack,
  Icon
} from '@shopify/polaris';
import { ExternalMinor } from '@shopify/polaris-icons';

interface ShopifyApiGuideProps {
  onClose?: () => void;
}

export function ShopifyApiGuide({ onClose }: ShopifyApiGuideProps) {
  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <TextContainer>
          <Heading>Getting Shopify API Credentials</Heading>
          <p>
            To use the Shopify integration features, you'll need to set up API credentials
            from your Shopify Partner account. Follow these steps to get started:
          </p>
        </TextContainer>

        <Banner
          title="Requirements"
          status="info"
        >
          <p>You'll need a Shopify Partner account and a development store to complete these steps.</p>
        </Banner>

        <TextContainer>
          <Heading element="h3">Step 1: Create a Shopify Partner Account</Heading>
          <p>
            If you don't already have a Shopify Partner account, you'll need to create one:
          </p>
          <List type="number">
            <List.Item>
              Go to <Link url="https://partners.shopify.com" external>partners.shopify.com</Link>
            </List.Item>
            <List.Item>Click "Join now" and follow the registration process</List.Item>
            <List.Item>Complete your account setup</List.Item>
          </List>
        </TextContainer>

        <TextContainer>
          <Heading element="h3">Step 2: Create a Development Store</Heading>
          <p>
            You'll need a development store to test your integration:
          </p>
          <List type="number">
            <List.Item>Log in to your Shopify Partner account</List.Item>
            <List.Item>Go to "Stores" in the left sidebar</List.Item>
            <List.Item>Click "Add store"</List.Item>
            <List.Item>Select "Development store" and follow the prompts</List.Item>
          </List>
        </TextContainer>

        <TextContainer>
          <Heading element="h3">Step 3: Create a Custom App</Heading>
          <p>
            Now you'll create a custom app to get your API credentials:
          </p>
          <List type="number">
            <List.Item>Log in to your development store admin</List.Item>
            <List.Item>Go to "Apps" in the left sidebar</List.Item>
            <List.Item>Click "Develop apps" at the top right</List.Item>
            <List.Item>Click "Create an app"</List.Item>
            <List.Item>Enter a name for your app (e.g., "KingsBuilder Integration")</List.Item>
            <List.Item>Click "Create app"</List.Item>
          </List>
        </TextContainer>

        <TextContainer>
          <Heading element="h3">Step 4: Configure API Scopes</Heading>
          <p>
            Set up the permissions your app will need:
          </p>
          <List type="number">
            <List.Item>In your app settings, click "Configuration"</List.Item>
            <List.Item>Click "Admin API integration" section</List.Item>
            <List.Item>
              Select the following scopes:
              <List>
                <List.Item>read_products, write_products</List.Item>
                <List.Item>read_content, write_content</List.Item>
                <List.Item>read_themes, write_themes</List.Item>
              </List>
            </List.Item>
            <List.Item>Click "Save"</List.Item>
          </List>
        </TextContainer>

        <TextContainer>
          <Heading element="h3">Step 5: Get Your API Credentials</Heading>
          <p>
            Now you can get your API credentials:
          </p>
          <List type="number">
            <List.Item>In your app settings, click "API credentials"</List.Item>
            <List.Item>You'll see your API key and API secret key</List.Item>
            <List.Item>Copy these values and keep them secure</List.Item>
          </List>
        </TextContainer>

        <TextContainer>
          <Heading element="h3">Step 6: Configure KingsBuilder</Heading>
          <p>
            Finally, add your credentials to KingsBuilder:
          </p>
          <List type="number">
            <List.Item>Go to the KingsBuilder settings</List.Item>
            <List.Item>Navigate to the "Shopify Integration" section</List.Item>
            <List.Item>Enter your API key, API secret, and store domain</List.Item>
            <List.Item>Click "Save"</List.Item>
          </List>
        </TextContainer>

        <Stack distribution="trailing">
          <Button primary onClick={onClose}>
            Got it
          </Button>
          <Button external url="https://shopify.dev/docs/apps/auth/oauth">
            <Stack alignment="center" spacing="tight">
              <span>Shopify API Documentation</span>
              <Icon source={ExternalMinor} />
            </Stack>
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export default ShopifyApiGuide;