import React, { useState, useEffect } from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  InlineStack,
  VerticalStack,
  Spinner,
  EmptyState,
  Button,
  Modal,
  TextField,
  Pagination
} from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image?: { src: string };
  products_count: number;
}

interface CollectionWidgetProps {
  shopDomain?: string;
  selectedCollectionId?: string;
  onCollectionSelect?: (collection: Collection) => void;
  displayMode?: 'single' | 'grid';
  showTitle?: boolean;
  showImage?: boolean;
  showProductCount?: boolean;
  maxCollections?: number;
}

export function CollectionWidget({
  shopDomain,
  selectedCollectionId,
  onCollectionSelect,
  displayMode = 'single',
  showTitle = true,
  showImage = true,
  showProductCount = true,
  maxCollections = 4
}: CollectionWidgetProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);

  // Fetch collections from Shopify
  useEffect(() => {
    const fetchCollections = async () => {
      if (!shopDomain) {
        setError('Shop domain is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        let url = `/api/shopify/collections?limit=${maxCollections}&page=${page}`;
        
        if (searchValue) {
          url += `&search=${encodeURIComponent(searchValue)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const data = await response.json();
        setCollections(data.collections);
        setHasNextPage(data.collections.length === maxCollections);
        
        // If we have a selected collection ID, find it in the results
        if (selectedCollectionId) {
          const collection = data.collections.find((c: Collection) => c.id === selectedCollectionId);
          if (collection) {
            setSelectedCollection(collection);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [shopDomain, selectedCollectionId, page, searchValue, maxCollections]);

  // Handle collection selection
  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection);
    if (onCollectionSelect) {
      onCollectionSelect(collection);
    }
    setModalOpen(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card sectioned>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner accessibilityLabel="Loading collections" size="large" />
          <div style={{ marginTop: '1rem' }}>Loading collections...</div>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card sectioned>
        <EmptyState
          heading="Failed to load collections"
          image="/empty-state-error.svg"
        >
          <p>{error}</p>
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </EmptyState>
      </Card>
    );
  }

  // Render empty state
  if (collections.length === 0) {
    return (
      <Card sectioned>
        <EmptyState
          heading="No collections found"
          image="/empty-state-collections.svg"
        >
          <p>No collections match your criteria.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => setModalOpen(true)}>Select a collection</Button>
          </div>
        </EmptyState>
      </Card>
    );
  }

  // Render single collection mode
  if (displayMode === 'single') {
    const collection = selectedCollection || collections[0];
    
    return (
      <>
        <Card sectioned>
          <div style={{ cursor: 'pointer' }} onClick={() => setModalOpen(true)}>
            {showImage && collection.image && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img 
                  src={collection.image.src} 
                  alt={collection.title}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            )}
            
            {showTitle && (
              <Text variant="bodyMd" fontWeight="bold">{collection.title}</Text>
            )}
            
            {showProductCount && (
              <div style={{ marginTop: '0.5rem' }}>
                {collection.products_count} products
              </div>
            )}
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Button onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}>
                Change Collection
              </Button>
            </div>
          </div>
        </Card>
        
        <CollectionSelectionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          collections={collections}
          onSelect={handleCollectionSelect}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          page={page}
          onPageChange={setPage}
          hasNextPage={hasNextPage}
        />
      </>
    );
  }

  // Render grid mode
  return (
    <>
      <Card sectioned>
        <ResourceList
          items={collections}
          renderItem={(collection: Collection) => (
            <ResourceItem
              id={collection.id}
              media={
                showImage && collection.image ? (
                  <Thumbnail source={collection.image.src} alt={collection.title} />
                ) : undefined
              }
              onClick={() => handleCollectionSelect(collection)}
            >
              <InlineStack gap="200">
                {showTitle && (
                  <InlineStack.Item fill>
                    <Text variant="bodyMd" fontWeight="bold">{collection.title}</Text>
                  </InlineStack.Item>
                )}
                
                {showProductCount && (
                  <InlineStack.Item>
                    {collection.products_count} products
                  </InlineStack.Item>
                )}
              </InlineStack>
            </ResourceItem>
          )}
        />
        
        <div style={{ marginTop: '1rem' }}>
          <Pagination
            hasPrevious={page > 1}
            onPrevious={() => setPage(page - 1)}
            hasNext={hasNextPage}
            onNext={() => setPage(page + 1)}
          />
        </div>
      </Card>
      
      <CollectionSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        collections={collections}
        onSelect={handleCollectionSelect}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        page={page}
        onPageChange={setPage}
        hasNextPage={hasNextPage}
      />
    </>
  );
}

// Collection selection modal component
function CollectionSelectionModal({
  open,
  onClose,
  collections,
  onSelect,
  searchValue,
  onSearchChange,
  page,
  onPageChange,
  hasNextPage
}: {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  onSelect: (collection: Collection) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select a Collection"
      primaryAction={{
        content: 'Cancel',
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <TextField
          label="Search collections"
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search by collection name"
          autoComplete="off"
        />
        
        <div style={{ marginTop: '1rem' }}>
          <ResourceList
            items={collections}
            renderItem={(collection: Collection) => (
              <ResourceItem
                id={collection.id}
                media={
                  collection.image ? (
                    <Thumbnail source={collection.image.src} alt={collection.title} />
                  ) : undefined
                }
                onClick={() => onSelect(collection)}
              >
                <InlineStack gap="200">
                  <InlineStack.Item fill>
                    <Text variant="bodyMd" fontWeight="bold">{collection.title}</Text>
                  </InlineStack.Item>
                  
                  <InlineStack.Item>
                    {collection.products_count} products
                  </InlineStack.Item>
                </InlineStack>
              </ResourceItem>
            )}
          />
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <Pagination
            hasPrevious={page > 1}
            onPrevious={() => onPageChange(page - 1)}
            hasNext={hasNextPage}
            onNext={() => onPageChange(page + 1)}
          />
        </div>
      </Modal.Section>
    </Modal>
  );
}

export default CollectionWidget;