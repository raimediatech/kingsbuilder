// Export all widgets
export { default as ProductWidget } from './ProductWidget';
export { default as CollectionWidget } from './CollectionWidget';
export { default as VideoWidget } from './VideoWidget';
export { default as CustomCodeWidget } from './CustomCodeWidget';
export { default as FormBuilderWidget } from './FormBuilderWidget';
export { default as SocialMediaWidget } from './SocialMediaWidget';

// Export widget registry
export { 
  default as ShopifyWidgetRegistry,
  ShopifyWidgetType,
  ShopifyWidgets,
  shopifyWidgetsList,
  registerShopifyWidgets,
  type WidgetMetadata
} from './ShopifyWidgetRegistry';