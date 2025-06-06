import ProductWidget from './ProductWidget';
import CollectionWidget from './CollectionWidget';

// Define widget types
export enum ShopifyWidgetType {
  PRODUCT = 'shopify-product',
  COLLECTION = 'shopify-collection'
}

// Define widget metadata
export interface WidgetMetadata {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: any;
  defaultProps: Record<string, any>;
  editorSettings: {
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image';
      defaultValue?: any;
      options?: Array<{ label: string; value: any }>;
    }>;
  };
}

// Define Shopify widgets
export const ShopifyWidgets: Record<ShopifyWidgetType, WidgetMetadata> = {
  [ShopifyWidgetType.PRODUCT]: {
    type: ShopifyWidgetType.PRODUCT,
    name: 'Shopify Product',
    description: 'Display a product from your Shopify store',
    icon: 'ShoppingBag',
    category: 'Shopify',
    component: ProductWidget,
    defaultProps: {
      displayMode: 'single',
      showPrice: true,
      showTitle: true,
      showImage: true
    },
    editorSettings: {
      fields: [
        {
          name: 'displayMode',
          label: 'Display Mode',
          type: 'select',
          defaultValue: 'single',
          options: [
            { label: 'Single Product', value: 'single' },
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' }
          ]
        },
        {
          name: 'showPrice',
          label: 'Show Price',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'showTitle',
          label: 'Show Title',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'showImage',
          label: 'Show Image',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'maxProducts',
          label: 'Max Products (Grid/List)',
          type: 'number',
          defaultValue: 4
        }
      ]
    }
  },
  [ShopifyWidgetType.COLLECTION]: {
    type: ShopifyWidgetType.COLLECTION,
    name: 'Shopify Collection',
    description: 'Display a collection from your Shopify store',
    icon: 'Collections',
    category: 'Shopify',
    component: CollectionWidget,
    defaultProps: {
      displayMode: 'single',
      showTitle: true,
      showImage: true,
      showProductCount: true
    },
    editorSettings: {
      fields: [
        {
          name: 'displayMode',
          label: 'Display Mode',
          type: 'select',
          defaultValue: 'single',
          options: [
            { label: 'Single Collection', value: 'single' },
            { label: 'Grid', value: 'grid' }
          ]
        },
        {
          name: 'showTitle',
          label: 'Show Title',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'showImage',
          label: 'Show Image',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'showProductCount',
          label: 'Show Product Count',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'maxCollections',
          label: 'Max Collections (Grid)',
          type: 'number',
          defaultValue: 4
        }
      ]
    }
  }
};

// Export all Shopify widgets as an array
export const shopifyWidgetsList = Object.values(ShopifyWidgets);

// Function to register Shopify widgets with the editor
export function registerShopifyWidgets(registerWidget: (widget: WidgetMetadata) => void) {
  shopifyWidgetsList.forEach(widget => {
    registerWidget(widget);
  });
}

export default {
  ShopifyWidgetType,
  ShopifyWidgets,
  shopifyWidgetsList,
  registerShopifyWidgets
};