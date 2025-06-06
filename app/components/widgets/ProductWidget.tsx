import React, { useState, useEffect } from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  Thumbnail,
  TextStyle,
  Stack,
  Spinner,
  EmptyState,
  Button,
  Modal,
  TextField,
  Select,
  Pagination
} from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';

interface Product {
  id: string;
  title: string;
  handle: string;
  images: { src: string }[];
  variants: { price: string }[];
}

interface ProductWidgetProps {
  shopDomain?: string;
  selectedProductId?: string;
  onProductSelect?: (product: Product) => void;
  displayMode?: 'single' | 'grid' | 'list';
  showPrice?: boolean;
  showTitle?: boolean;
  showImage?: boolean;
  maxProducts?: number;
  collectionId?: string;
}

export function ProductWidget({
  shopDomain,
  selectedProductId,
  onProductSelect,
  displayMode = 'single',
  showPrice = true,
  showTitle = true,
  showImage = true,
  maxProducts = 4,
  collectionId
}: ProductWidgetProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);

  // Fetch products from Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopDomain) {
        setError('Shop domain is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        let url = `/api/shopify/products?limit=${maxProducts}&page=${page}`;
        
        if (collectionId) {
          url += `&collection_id=${collectionId}`;
        }
        
        if (searchValue) {
          url += `&search=${encodeURIComponent(searchValue)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products);
        setHasNextPage(data.products.length === maxProducts);
        
        // If we have a selected product ID, find it in the results
        if (selectedProductId) {
          const product = data.products.find((p: Product) => p.id === selectedProductId);
          if (product) {
            setSelectedProduct(product);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [shopDomain, selectedProductId, collectionId, page, searchValue, maxProducts]);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    if (onProductSelect) {
      onProductSelect(product);
    }
    setModalOpen(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card sectioned>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner accessibilityLabel="Loading products" size="large" />
          <div style={{ marginTop: '1rem' }}>Loading products...</div>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card sectioned>
        <EmptyState
          heading="Failed to load products"
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
  if (products.length === 0) {
    return (
      <Card sectioned>
        <EmptyState
          heading="No products found"
          image="/empty-state-products.svg"
        >
          <p>No products match your criteria.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => setModalOpen(true)}>Select a product</Button>
          </div>
        </EmptyState>
      </Card>
    );
  }

  // Render single product mode
  if (displayMode === 'single') {
    const product = selectedProduct || products[0];
    
    return (
      <>
        <Card sectioned>
          <div style={{ cursor: 'pointer' }} onClick={() => setModalOpen(true)}>
            {showImage && product.images && product.images[0] && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img 
                  src={product.images[0].src} 
                  alt={product.title}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            )}
            
            {showTitle && (
              <TextStyle variation="strong">{product.title}</TextStyle>
            )}
            
            {showPrice && product.variants && product.variants[0] && (
              <div style={{ marginTop: '0.5rem' }}>
                ${product.variants[0].price}
              </div>
            )}
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Button onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}>
                Change Product
              </Button>
            </div>
          </div>
        </Card>
        
        <ProductSelectionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          products={products}
          onSelect={handleProductSelect}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          page={page}
          onPageChange={setPage}
          hasNextPage={hasNextPage}
        />
      </>
    );
  }

  // Render grid or list mode
  return (
    <>
      <Card sectioned>
        <ResourceList
          items={products}
          renderItem={(product: Product) => (
            <ResourceItem
              id={product.id}
              media={
                showImage && product.images && product.images[0] ? (
                  <Thumbnail source={product.images[0].src} alt={product.title} />
                ) : undefined
              }
              onClick={() => handleProductSelect(product)}
            >
              <Stack>
                {showTitle && (
                  <Stack.Item fill>
                    <TextStyle variation="strong">{product.title}</TextStyle>
                  </Stack.Item>
                )}
                
                {showPrice && product.variants && product.variants[0] && (
                  <Stack.Item>
                    ${product.variants[0].price}
                  </Stack.Item>
                )}
              </Stack>
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
      
      <ProductSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        onSelect={handleProductSelect}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        page={page}
        onPageChange={setPage}
        hasNextPage={hasNextPage}
      />
    </>
  );
}

// Product selection modal component
function ProductSelectionModal({
  open,
  onClose,
  products,
  onSelect,
  searchValue,
  onSearchChange,
  page,
  onPageChange,
  hasNextPage
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (product: Product) => void;
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
      title="Select a Product"
      primaryAction={{
        content: 'Cancel',
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <TextField
          label="Search products"
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search by product name"
          autoComplete="off"
        />
        
        <div style={{ marginTop: '1rem' }}>
          <ResourceList
            items={products}
            renderItem={(product: Product) => (
              <ResourceItem
                id={product.id}
                media={
                  product.images && product.images[0] ? (
                    <Thumbnail source={product.images[0].src} alt={product.title} />
                  ) : undefined
                }
                onClick={() => onSelect(product)}
              >
                <Stack>
                  <Stack.Item fill>
                    <TextStyle variation="strong">{product.title}</TextStyle>
                  </Stack.Item>
                  
                  {product.variants && product.variants[0] && (
                    <Stack.Item>
                      ${product.variants[0].price}
                    </Stack.Item>
                  )}
                </Stack>
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

export default ProductWidget;