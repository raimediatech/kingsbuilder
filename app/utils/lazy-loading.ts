/**
 * Utility functions for lazy loading components and resources
 */

/**
 * Intersection Observer options
 */
export interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Default Intersection Observer options
 */
export const defaultIntersectionOptions: IntersectionOptions = {
  root: null,
  rootMargin: '100px',
  threshold: 0.1,
};

/**
 * Create an Intersection Observer to lazy load elements
 * @param callback Function to call when element is intersecting
 * @param options Intersection Observer options
 * @returns Intersection Observer instance
 */
export function createLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  options: IntersectionOptions = {}
): IntersectionObserver {
  // Only run in browser environment
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Return a dummy observer for SSR
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    } as IntersectionObserver;
  }
  
  const opts = { ...defaultIntersectionOptions, ...options };
  return new IntersectionObserver(callback, opts);
}

/**
 * Lazy load images on a page
 * @param selector CSS selector for images to lazy load
 * @param options Intersection Observer options
 */
export function lazyLoadImages(selector = 'img[data-src]', options: IntersectionOptions = {}): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const observer = createLazyLoadObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        const sizes = img.getAttribute('data-sizes');
        
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        if (sizes) img.sizes = sizes;
        
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        img.removeAttribute('data-sizes');
        
        observer.unobserve(img);
      }
    });
  }, options);
  
  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });
}

/**
 * Lazy load background images on a page
 * @param selector CSS selector for elements with background images to lazy load
 * @param options Intersection Observer options
 */
export function lazyLoadBackgroundImages(selector = '[data-background]', options: IntersectionOptions = {}): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const observer = createLazyLoadObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const background = element.getAttribute('data-background');
        
        if (background) {
          element.style.backgroundImage = `url(${background})`;
          element.removeAttribute('data-background');
        }
        
        observer.unobserve(element);
      }
    });
  }, options);
  
  document.querySelectorAll(selector).forEach(element => {
    observer.observe(element);
  });
}

/**
 * Lazy load iframes on a page
 * @param selector CSS selector for iframes to lazy load
 * @param options Intersection Observer options
 */
export function lazyLoadIframes(selector = 'iframe[data-src]', options: IntersectionOptions = {}): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const observer = createLazyLoadObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target as HTMLIFrameElement;
        const src = iframe.getAttribute('data-src');
        
        if (src) {
          iframe.src = src;
          iframe.removeAttribute('data-src');
        }
        
        observer.unobserve(iframe);
      }
    });
  }, options);
  
  document.querySelectorAll(selector).forEach(iframe => {
    observer.observe(iframe);
  });
}

/**
 * Initialize all lazy loading on a page
 */
export function initLazyLoading(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      lazyLoadImages();
      lazyLoadBackgroundImages();
      lazyLoadIframes();
    });
  } else {
    lazyLoadImages();
    lazyLoadBackgroundImages();
    lazyLoadIframes();
  }
}

/**
 * Generate HTML for a lazy-loaded image
 * @param src The image source URL
 * @param alt Alt text for the image
 * @param width Image width
 * @param height Image height
 * @param className Optional CSS class
 * @returns HTML string for the lazy-loaded image
 */
export function lazyImageHtml(src: string, alt: string, width?: number, height?: number, className?: string): string {
  if (!src) return '';
  
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
  const classAttr = className ? ` class="${className}"` : '';
  const widthAttr = width ? ` width="${width}"` : '';
  const heightAttr = height ? ` height="${height}"` : '';
  
  return `
    <img 
      src="${placeholder}" 
      data-src="${src}" 
      alt="${alt}"${widthAttr}${heightAttr}${classAttr}
      loading="lazy" 
    />
  `;
}