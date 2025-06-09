import ProductWidget from './ProductWidget';
import CollectionWidget from './CollectionWidget';
import VideoWidget from './VideoWidget';
import CustomCodeWidget from './CustomCodeWidget';
import FormBuilderWidget from './FormBuilderWidget';
import SocialMediaWidget from './SocialMediaWidget';

// Define widget types
export enum ShopifyWidgetType {
  PRODUCT = 'shopify-product',
  COLLECTION = 'shopify-collection',
  VIDEO = 'video',
  CUSTOM_CODE = 'custom-code',
  FORM_BUILDER = 'form-builder',
  SOCIAL_MEDIA = 'social-media'
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
      type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'textarea' | 'code';
      defaultValue?: any;
      options?: Array<{ label: string; value: any }>;
      language?: string; // For code editor
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
  },
  [ShopifyWidgetType.VIDEO]: {
    type: ShopifyWidgetType.VIDEO,
    name: 'Video',
    description: 'Embed videos from YouTube, Vimeo, or custom sources',
    icon: 'Video',
    category: 'Media',
    component: VideoWidget,
    defaultProps: {
      videoType: 'youtube',
      videoId: '',
      videoUrl: '',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      title: 'Video',
      width: '100%',
      height: '400px'
    },
    editorSettings: {
      fields: [
        {
          name: 'videoType',
          label: 'Video Source',
          type: 'select',
          defaultValue: 'youtube',
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Custom URL', value: 'custom' }
          ]
        },
        {
          name: 'videoId',
          label: 'Video ID (YouTube/Vimeo)',
          type: 'text',
          defaultValue: ''
        },
        {
          name: 'videoUrl',
          label: 'Video URL (Custom)',
          type: 'text',
          defaultValue: ''
        },
        {
          name: 'autoplay',
          label: 'Autoplay',
          type: 'boolean',
          defaultValue: false
        },
        {
          name: 'loop',
          label: 'Loop',
          type: 'boolean',
          defaultValue: false
        },
        {
          name: 'muted',
          label: 'Muted',
          type: 'boolean',
          defaultValue: false
        },
        {
          name: 'controls',
          label: 'Show Controls',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'width',
          label: 'Width',
          type: 'text',
          defaultValue: '100%'
        },
        {
          name: 'height',
          label: 'Height',
          type: 'text',
          defaultValue: '400px'
        }
      ]
    }
  },
  [ShopifyWidgetType.CUSTOM_CODE]: {
    type: ShopifyWidgetType.CUSTOM_CODE,
    name: 'Custom Code',
    description: 'Add custom HTML, CSS, and JavaScript to your page',
    icon: 'Code',
    category: 'Advanced',
    component: CustomCodeWidget,
    defaultProps: {
      htmlContent: '',
      cssContent: '',
      jsContent: '',
      height: 'auto',
      width: '100%'
    },
    editorSettings: {
      fields: [
        {
          name: 'htmlContent',
          label: 'HTML',
          type: 'textarea',
          defaultValue: ''
        },
        {
          name: 'cssContent',
          label: 'CSS',
          type: 'textarea',
          defaultValue: ''
        },
        {
          name: 'jsContent',
          label: 'JavaScript',
          type: 'textarea',
          defaultValue: ''
        },
        {
          name: 'height',
          label: 'Height',
          type: 'text',
          defaultValue: 'auto'
        },
        {
          name: 'width',
          label: 'Width',
          type: 'text',
          defaultValue: '100%'
        }
      ]
    }
  },
  [ShopifyWidgetType.FORM_BUILDER]: {
    type: ShopifyWidgetType.FORM_BUILDER,
    name: 'Form Builder',
    description: 'Create custom forms for your Shopify store',
    icon: 'Form',
    category: 'Interactive',
    component: FormBuilderWidget,
    defaultProps: {
      config: {
        title: 'Contact Form',
        description: 'Please fill out the form below to get in touch with us.',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Name',
            placeholder: 'Your name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'Your email address',
            required: true
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Message',
            placeholder: 'Your message',
            required: true
          }
        ],
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        errorMessage: 'There was an error submitting the form. Please try again.',
        storeInShopify: true
      }
    },
    editorSettings: {
      fields: [
        {
          name: 'config.title',
          label: 'Form Title',
          type: 'text',
          defaultValue: 'Contact Form'
        },
        {
          name: 'config.description',
          label: 'Form Description',
          type: 'textarea',
          defaultValue: 'Please fill out the form below to get in touch with us.'
        },
        {
          name: 'config.submitButtonText',
          label: 'Submit Button Text',
          type: 'text',
          defaultValue: 'Submit'
        },
        {
          name: 'config.successMessage',
          label: 'Success Message',
          type: 'text',
          defaultValue: 'Thank you for your submission!'
        },
        {
          name: 'config.errorMessage',
          label: 'Error Message',
          type: 'text',
          defaultValue: 'There was an error submitting the form. Please try again.'
        },
        {
          name: 'config.storeInShopify',
          label: 'Store Submissions in Shopify',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'config.sendEmail',
          label: 'Send Email Notifications',
          type: 'boolean',
          defaultValue: false
        }
      ]
    }
  },
  [ShopifyWidgetType.SOCIAL_MEDIA]: {
    type: ShopifyWidgetType.SOCIAL_MEDIA,
    name: 'Social Media',
    description: 'Embed social media content from various platforms',
    icon: 'Share',
    category: 'Media',
    component: SocialMediaWidget,
    defaultProps: {
      config: {
        platform: 'facebook',
        contentType: 'post',
        id: '',
        username: '',
        showHeader: true,
        showFooter: true,
        width: '100%',
        height: '500px',
        theme: 'light'
      }
    },
    editorSettings: {
      fields: [
        {
          name: 'config.platform',
          label: 'Platform',
          type: 'select',
          defaultValue: 'facebook',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'TikTok', value: 'tiktok' }
          ]
        },
        {
          name: 'config.contentType',
          label: 'Content Type',
          type: 'select',
          defaultValue: 'post',
          options: [
            { label: 'Profile', value: 'profile' },
            { label: 'Post', value: 'post' },
            { label: 'Feed', value: 'feed' },
            { label: 'Timeline', value: 'timeline' },
            { label: 'Video', value: 'video' },
            { label: 'Page', value: 'page' }
          ]
        },
        {
          name: 'config.id',
          label: 'Content ID',
          type: 'text',
          defaultValue: ''
        },
        {
          name: 'config.username',
          label: 'Username/Handle',
          type: 'text',
          defaultValue: ''
        },
        {
          name: 'config.width',
          label: 'Width',
          type: 'text',
          defaultValue: '100%'
        },
        {
          name: 'config.height',
          label: 'Height',
          type: 'text',
          defaultValue: '500px'
        },
        {
          name: 'config.theme',
          label: 'Theme',
          type: 'select',
          defaultValue: 'light',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' }
          ]
        },
        {
          name: 'config.showHeader',
          label: 'Show Header',
          type: 'boolean',
          defaultValue: true
        },
        {
          name: 'config.showFooter',
          label: 'Show Footer',
          type: 'boolean',
          defaultValue: true
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