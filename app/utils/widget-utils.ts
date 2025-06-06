/**
 * Utility functions and types for widget management
 */

export interface WidgetBase {
  id: string;
  type: string;
  title: string;
  settings: Record<string, any>;
}

export interface ProductWidgetSettings {
  displayStyle: 'grid' | 'carousel' | 'list';
  productSource: 'selected' | 'featured' | 'best-selling' | 'newest';
  productIds?: string[];
  collectionId?: string;
  count: number;
}

export interface ProductWidget extends WidgetBase {
  type: 'product';
  settings: ProductWidgetSettings;
}

export interface CollectionWidgetSettings {
  displayStyle: 'grid' | 'carousel' | 'list';
  collectionId: string;
  count: number;
}

export interface CollectionWidget extends WidgetBase {
  type: 'collection';
  settings: CollectionWidgetSettings;
}

export interface CustomCodeWidgetSettings {
  code: string;
  language: 'html' | 'css' | 'javascript';
  executeOnLoad: boolean;
}

export interface CustomCodeWidget extends WidgetBase {
  type: 'custom-code';
  settings: CustomCodeWidgetSettings;
}

export interface FormFieldBase {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface TextFieldSettings {
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
}

export interface TextField extends FormFieldBase {
  type: 'text';
  settings: TextFieldSettings;
}

export interface EmailFieldSettings {
  defaultValue?: string;
}

export interface EmailField extends FormFieldBase {
  type: 'email';
  settings: EmailFieldSettings;
}

export interface SelectFieldSettings {
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

export interface SelectField extends FormFieldBase {
  type: 'select';
  settings: SelectFieldSettings;
}

export interface CheckboxFieldSettings {
  defaultChecked?: boolean;
}

export interface CheckboxField extends FormFieldBase {
  type: 'checkbox';
  settings: CheckboxFieldSettings;
}

export type FormField = TextField | EmailField | SelectField | CheckboxField;

export interface FormWidgetSettings {
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
  emailNotification?: {
    enabled: boolean;
    recipientEmail?: string;
    subject?: string;
  };
  redirectAfterSubmit?: {
    enabled: boolean;
    url?: string;
  };
}

export interface FormWidget extends WidgetBase {
  type: 'form';
  settings: FormWidgetSettings;
}

export interface SocialMediaWidgetSettings {
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  displayType: 'feed' | 'post' | 'profile';
  url: string;
  count?: number;
}

export interface SocialMediaWidget extends WidgetBase {
  type: 'social-media';
  settings: SocialMediaWidgetSettings;
}

export interface VideoWidgetSettings {
  videoType: 'youtube' | 'vimeo' | 'shopify' | 'custom';
  videoId?: string;
  videoUrl?: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  responsive: boolean;
  width?: number;
  height?: number;
  startTime?: number;
  endTime?: number;
  thumbnailUrl?: string;
}

export interface VideoWidget extends WidgetBase {
  type: 'video';
  settings: VideoWidgetSettings;
}

export type Widget = ProductWidget | CollectionWidget | CustomCodeWidget | FormWidget | SocialMediaWidget | VideoWidget;

/**
 * Generate a unique ID for a widget
 * @returns A unique string ID
 */
export function generateWidgetId(): string {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new widget with default settings
 * @param type The type of widget to create
 * @param title The title of the widget
 * @returns A new widget object
 */
export function createWidget(type: string, title: string): Widget {
  const baseWidget = {
    id: generateWidgetId(),
    title,
  };

  switch (type) {
    case 'product':
      return {
        ...baseWidget,
        type: 'product',
        settings: {
          displayStyle: 'grid',
          productSource: 'featured',
          count: 4,
        },
      } as ProductWidget;

    case 'collection':
      return {
        ...baseWidget,
        type: 'collection',
        settings: {
          displayStyle: 'grid',
          collectionId: '',
          count: 4,
        },
      } as CollectionWidget;

    case 'custom-code':
      return {
        ...baseWidget,
        type: 'custom-code',
        settings: {
          code: '<!-- Add your custom code here -->',
          language: 'html',
          executeOnLoad: true,
        },
      } as CustomCodeWidget;

    case 'form':
      return {
        ...baseWidget,
        type: 'form',
        settings: {
          fields: [
            {
              id: `field_${Date.now()}_1`,
              type: 'text',
              label: 'Name',
              required: true,
              placeholder: 'Enter your name',
              settings: {},
            },
            {
              id: `field_${Date.now()}_2`,
              type: 'email',
              label: 'Email',
              required: true,
              placeholder: 'Enter your email',
              settings: {},
            },
          ],
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          emailNotification: {
            enabled: false,
          },
          redirectAfterSubmit: {
            enabled: false,
          },
        },
      } as FormWidget;

    case 'social-media':
      return {
        ...baseWidget,
        type: 'social-media',
        settings: {
          platform: 'instagram',
          displayType: 'feed',
          url: '',
          count: 4,
        },
      } as SocialMediaWidget;
      
    case 'video':
      return {
        ...baseWidget,
        type: 'video',
        settings: {
          videoType: 'youtube',
          videoId: '',
          autoplay: false,
          loop: false,
          muted: true,
          controls: true,
          responsive: true,
        },
      } as VideoWidget;

    default:
      throw new Error(`Unknown widget type: ${type}`);
  }
}

/**
 * Generate HTML preview for a widget
 * @param widget The widget to generate a preview for
 * @returns HTML string preview
 */
export function generateWidgetPreview(widget: Widget): string {
  switch (widget.type) {
    case 'product':
      return `
        <div class="widget-preview product-widget">
          <h3>${widget.title}</h3>
          <div class="product-grid">
            ${Array(widget.settings.count).fill(0).map(() => `
              <div class="product-item">
                <div class="product-image"></div>
                <div class="product-title">Product Title</div>
                <div class="product-price">$19.99</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'collection':
      return `
        <div class="widget-preview collection-widget">
          <h3>${widget.title}</h3>
          <div class="collection-grid">
            ${Array(widget.settings.count).fill(0).map(() => `
              <div class="product-item">
                <div class="product-image"></div>
                <div class="product-title">Product Title</div>
                <div class="product-price">$19.99</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'custom-code':
      return `
        <div class="widget-preview custom-code-widget">
          <h3>${widget.title}</h3>
          <div class="code-preview">
            <pre>${widget.settings.code}</pre>
          </div>
        </div>
      `;

    case 'form':
      return `
        <div class="widget-preview form-widget">
          <h3>${widget.title}</h3>
          <div class="form-preview">
            ${widget.settings.fields.map(field => `
              <div class="form-field">
                <label>${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type === 'email' ? 'email' : 'text'}" placeholder="${field.placeholder || ''}">
              </div>
            `).join('')}
            <button>${widget.settings.submitButtonText}</button>
          </div>
        </div>
      `;

    case 'social-media':
      return `
        <div class="widget-preview social-media-widget">
          <h3>${widget.title}</h3>
          <div class="social-media-preview">
            <div class="platform-icon ${widget.settings.platform}"></div>
            <div class="social-feed">
              ${Array(widget.settings.count || 4).fill(0).map(() => `
                <div class="social-post"></div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      
    case 'video':
      return `
        <div class="widget-preview video-widget">
          <h3>${widget.title}</h3>
          <div class="video-preview">
            <div class="video-placeholder">
              <div class="video-play-button"></div>
              <div class="video-type-label">${widget.settings.videoType.toUpperCase()}</div>
            </div>
          </div>
        </div>
      `;

    default:
      return `<div class="widget-preview">Unknown widget type: ${widget.type}</div>`;
  }
}