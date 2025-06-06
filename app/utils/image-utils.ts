/**
 * Utility functions for image optimization and handling
 */

/**
 * Image format options
 */
export type ImageFormat = 'original' | 'webp' | 'jpeg' | 'png';

/**
 * Image quality options (1-100)
 */
export type ImageQuality = number;

/**
 * Image resize mode
 */
export type ImageResizeMode = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: ImageQuality;
  resizeMode?: ImageResizeMode;
  blur?: number;
  grayscale?: boolean;
}

/**
 * Default image optimization options
 */
export const defaultImageOptions: ImageOptimizationOptions = {
  format: 'webp',
  quality: 80,
  resizeMode: 'cover',
};

/**
 * Generate an optimized image URL for Shopify CDN
 * @param originalUrl The original image URL
 * @param options Optimization options
 * @returns Optimized image URL
 */
export function optimizeShopifyImage(originalUrl: string, options: ImageOptimizationOptions = {}): string {
  if (!originalUrl) return '';
  
  // If not a Shopify CDN URL, return the original
  if (!originalUrl.includes('cdn.shopify.com')) {
    return originalUrl;
  }
  
  // Merge with default options
  const opts = { ...defaultImageOptions, ...options };
  
  // Parse the URL
  const url = new URL(originalUrl);
  const pathParts = url.pathname.split('.');
  const extension = pathParts.pop();
  const basePath = pathParts.join('.');
  
  // Build the query parameters
  const params: string[] = [];
  
  if (opts.width) params.push(`width=${opts.width}`);
  if (opts.height) params.push(`height=${opts.height}`);
  if (opts.format && opts.format !== 'original') params.push(`format=${opts.format}`);
  if (opts.quality) params.push(`quality=${opts.quality}`);
  if (opts.resizeMode) params.push(`crop=${opts.resizeMode}`);
  if (opts.blur) params.push(`blur=${opts.blur}`);
  if (opts.grayscale) params.push(`grayscale=true`);
  
  // Construct the new URL
  const newPath = `${basePath}_${params.join('_')}.${opts.format === 'original' ? extension : opts.format}`;
  url.pathname = newPath;
  
  return url.toString();
}

/**
 * Generate responsive image srcset
 * @param originalUrl The original image URL
 * @param widths Array of widths to generate
 * @param options Additional optimization options
 * @returns srcset string
 */
export function generateSrcSet(originalUrl: string, widths: number[] = [320, 640, 960, 1280, 1920], options: ImageOptimizationOptions = {}): string {
  if (!originalUrl) return '';
  
  return widths
    .map(width => {
      const url = optimizeShopifyImage(originalUrl, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Calculate the aspect ratio of an image
 * @param width Image width
 * @param height Image height
 * @returns Aspect ratio as a string (e.g., "16/9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Generate a placeholder color for an image
 * This is a simple implementation - in a real app, you might want to extract the dominant color
 * @returns A CSS color value
 */
export function generatePlaceholderColor(): string {
  const colors = [
    '#f4f6f8', // Light gray
    '#eef0f3', // Lighter gray
    '#e6e9ed', // Even lighter gray
    '#f9fafb', // Almost white
    '#f5f7fa', // Very light blue
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Check if an image URL is valid
 * @param url The image URL to check
 * @returns Boolean indicating if the URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Generate HTML for a responsive image
 * @param src The image source URL
 * @param alt Alt text for the image
 * @param options Additional options
 * @returns HTML string for the image
 */
export function responsiveImageHtml(src: string, alt: string, options: ImageOptimizationOptions & { className?: string } = {}): string {
  if (!src) return '';
  
  const srcset = generateSrcSet(src, [320, 640, 960, 1280, 1920], options);
  const optimizedSrc = optimizeShopifyImage(src, options);
  const className = options.className || '';
  
  return `
    <img 
      src="${optimizedSrc}" 
      srcset="${srcset}" 
      sizes="(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px" 
      alt="${alt}" 
      loading="lazy" 
      class="${className}"
    />
  `;
}