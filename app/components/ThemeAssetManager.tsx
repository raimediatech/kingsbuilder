import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Text,
  TextField,
  Select,
  Spinner,
  Modal,
  LegacyStack,
  EmptyState,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Badge,
  ButtonGroup,
  Box,
  Banner,
} from "@shopify/polaris";
import { useSubmit, useLoaderData } from "@remix-run/react";

interface ThemeAsset {
  key: string;
  value?: string;
  attachment?: string;
  contentType?: string;
  size?: number;
  updatedAt?: string;
}

interface Theme {
  id: string;
  name: string;
  role: string;
}

export default function ThemeAssetManager({ pageId }: { pageId: string }) {
  const submit = useSubmit();
  const { themes = [], assets = [] } = useLoaderData<{
    themes: Theme[];
    assets: ThemeAsset[];
  }>();

  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [themeAssets, setThemeAssets] = useState<ThemeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ThemeAsset | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetContent, setAssetContent] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  // Load theme assets when theme is selected
  useEffect(() => {
    if (selectedTheme) {
      loadThemeAssets();
    }
  }, [selectedTheme]);

  // Filter assets based on search
  const filteredAssets = themeAssets.filter((asset) =>
    asset.key.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Load theme assets
  const loadThemeAssets = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "getThemeAssets");
      formData.append("themeId", selectedTheme);

      submit(formData, { method: "post" });
      
      // This would normally be set by the loader after redirect
      // For demo purposes, we're setting it directly
      setThemeAssets(assets || []);
    } catch (err) {
      setError("Failed to load theme assets");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // View asset content
  const viewAsset = async (asset: ThemeAsset) => {
    setSelectedAsset(asset);
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("action", "getThemeAsset");
      formData.append("themeId", selectedTheme);
      formData.append("key", asset.key);

      submit(formData, { method: "post" });
      
      // This would normally be set by the loader after redirect
      // For demo purposes, we're setting it directly
      setAssetContent(asset.value || "");
      setAssetModalOpen(true);
    } catch (err) {
      setError("Failed to load asset content");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save asset changes
  const saveAssetChanges = async () => {
    if (!selectedAsset) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "updateThemeAsset");
      formData.append("themeId", selectedTheme);
      formData.append("key", selectedAsset.key);
      formData.append("value", assetContent);
      formData.append("pageId", pageId);

      submit(formData, { method: "post" });
      
      // Close modal after saving
      setAssetModalOpen(false);
      
      // Refresh asset list
      loadThemeAssets();
    } catch (err) {
      setError("Failed to save asset changes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete asset
  const deleteAsset = async (asset: ThemeAsset) => {
    if (!confirm(`Are you sure you want to delete ${asset.key}?`)) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "deleteThemeAsset");
      formData.append("themeId", selectedTheme);
      formData.append("key", asset.key);

      submit(formData, { method: "post" });
      
      // Refresh asset list
      loadThemeAssets();
    } catch (err) {
      setError("Failed to delete asset");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get file type from asset key
  const getFileType = (key: string) => {
    const extension = key.split(".").pop()?.toLowerCase();
    
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
      return "image";
    } else if (["js", "json"].includes(extension || "")) {
      return "javascript";
    } else if (["css", "scss", "less"].includes(extension || "")) {
      return "css";
    } else if (["html", "liquid"].includes(extension || "")) {
      return "html";
    }
    
    return "text";
  };

  // Get thumbnail for asset
  const getAssetThumbnail = (asset: ThemeAsset) => {
    const fileType = getFileType(asset.key);
    
    if (fileType === "image") {
      return <Thumbnail source={`data:image/png;base64,${asset.attachment}`} alt={asset.key} />;
    }
    
    return <Thumbnail source="" alt={asset.key} />;
  };

  return (
    <Card>
      <Card.Section>
        <Text variant="headingMd" as="h2">
          Theme Asset Management
        </Text>
      </Card.Section>

      {error && (
        <Card.Section>
          <Banner status="critical" onDismiss={() => setError("")}>
            {error}
          </Banner>
        </Card.Section>
      )}

      <Card.Section>
        <LegacyStack vertical>
          <Select
            label="Select Theme"
            options={themes.map((theme) => ({
              label: `${theme.name} ${theme.role === "main" ? "(Live)" : ""}`,
              value: theme.id,
            }))}
            onChange={setSelectedTheme}
            value={selectedTheme}
          />
          
          {selectedTheme && (
            <TextField
              label="Search Assets"
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search by filename..."
              clearButton
              onClearButtonClick={() => setSearchValue("")}
            />
          )}
        </LegacyStack>
      </Card.Section>

      <Card.Section>
        {isLoading ? (
          <Box padding="4">
            <LegacyStack distribution="center">
              <Spinner accessibilityLabel="Loading theme assets" size="large" />
            </LegacyStack>
          </Box>
        ) : !selectedTheme ? (
          <EmptyState
            heading="Select a theme to manage assets"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Choose a theme from the dropdown above to view and manage its assets.</p>
          </EmptyState>
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            heading="No assets found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>No assets match your search criteria.</p>
          </EmptyState>
        ) : (
          <ResourceList
            resourceName={{ singular: "asset", plural: "assets" }}
            items={filteredAssets}
            renderItem={(asset) => (
              <ResourceItem
                id={asset.key}
                onClick={() => viewAsset(asset)}
                media={getAssetThumbnail(asset)}
                accessibilityLabel={`View details for ${asset.key}`}
              >
                <LegacyStack>
                  <LegacyStack.Item fill>
                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                      {asset.key}
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                      {asset.size ? `${(asset.size / 1024).toFixed(2)} KB` : ""}
                      {asset.updatedAt ? ` • Updated: ${new Date(asset.updatedAt).toLocaleDateString()}` : ""}
                    </Text>
                  </LegacyStack.Item>
                  <LegacyStack.Item>
                    <Badge status={getFileType(asset.key) === "image" ? "success" : "info"}>
                      {getFileType(asset.key)}
                    </Badge>
                  </LegacyStack.Item>
                </LegacyStack>
              </ResourceItem>
            )}
          />
        )}
      </Card.Section>

      <Modal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        title={selectedAsset?.key || "Asset Editor"}
        primaryAction={{
          content: "Save",
          onAction: saveAssetChanges,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Delete",
            destructive: true,
            onAction: () => {
              setAssetModalOpen(false);
              if (selectedAsset) deleteAsset(selectedAsset);
            },
          },
        ]}
      >
        <Modal.Section>
          {getFileType(selectedAsset?.key || "") === "image" ? (
            <Box padding="4">
              <img
                src={`data:image/png;base64,${selectedAsset?.attachment}`}
                alt={selectedAsset?.key}
                style={{ maxWidth: "100%", maxHeight: "400px" }}
              />
            </Box>
          ) : (
            <TextField
              label="Asset Content"
              value={assetContent}
              onChange={setAssetContent}
              multiline={4}
              autoComplete="off"
              monospaced
            />
          )}
        </Modal.Section>
      </Modal>
    </Card>
  );
}