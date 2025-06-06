import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Select,
  Button,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    defaultFontFamily: "Inter",
    defaultFontSize: "16px",
    defaultButtonStyle: "rounded",
  });

  const fontOptions = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Open Sans", value: "Open Sans" },
    { label: "Montserrat", value: "Montserrat" },
  ];

  const buttonStyleOptions = [
    { label: "Rounded", value: "rounded" },
    { label: "Square", value: "square" },
    { label: "Pill", value: "pill" },
  ];

  const handleChange = (field: string) => (value: string) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: value,
    });
  };

  return (
    <Page>
      <TitleBar title="KingsBuilder Settings" />
      <Layout>
        <Layout.AnnotatedSection
          title="General Settings"
          description="Configure the default settings for your page builder."
        >
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <Select
                  label="Default Font Family"
                  options={fontOptions}
                  value={generalSettings.defaultFontFamily}
                  onChange={handleChange("defaultFontFamily")}
                />
                <TextField
                  label="Default Font Size"
                  value={generalSettings.defaultFontSize}
                  onChange={handleChange("defaultFontSize")}
                />
                <Select
                  label="Default Button Style"
                  options={buttonStyleOptions}
                  value={generalSettings.defaultButtonStyle}
                  onChange={handleChange("defaultButtonStyle")}
                />
              </FormLayout>
              <Box paddingBlockStart="400">
                <Button primary>Save Settings</Button>
              </Box>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Advanced Settings"
          description="Configure advanced options for your page builder."
        >
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <TextField
                  label="Custom CSS"
                  multiline={4}
                  placeholder="Enter custom CSS to apply to all pages"
                />
                <TextField
                  label="Custom JavaScript"
                  multiline={4}
                  placeholder="Enter custom JavaScript to apply to all pages"
                />
              </FormLayout>
              <Box paddingBlockStart="400">
                <Button primary>Save Advanced Settings</Button>
              </Box>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}