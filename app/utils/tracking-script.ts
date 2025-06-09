/**
 * Client-side tracking script for visitor analytics and conversion tracking
 * This script is injected into Shopify pages to collect data
 */

// Define tracking data types
interface TrackingData {
  pageId: string;
  sessionId: string;
  shopId: string;
  referrer: string;
  path: string;
  userAgent: string;
  screenSize: string;
  timestamp: number;
}

interface ConversionData {
  pageId: string;
  sessionId: string;
  conversionType: string;
  conversionValue?: number;
  currency?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  formId?: string;
  buttonId?: string;
  customEventName?: string;
  metadata?: Record<string, any>;
}

// Generate a unique session ID
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('kb_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('kb_session_id', sessionId);
  }
  return sessionId;
}

// Detect device type
function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile';
  } else if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

// Detect browser
function getBrowser(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }
  return 'Unknown';
}

// Detect operating system
function getOS(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Windows') > -1) {
    return 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    return 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    return 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    return 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || /iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  }
  return 'Unknown';
}

// Get screen size
function getScreenSize(): string {
  return \`\${window.screen.width}x\${window.screen.height}\`;
}

// Track page view
function trackPageView(pageId: string, shopId: string): void {
  const sessionId = getSessionId();
  const isNewVisitor = !localStorage.getItem('kb_visitor');
  
  // Mark as returning visitor
  if (isNewVisitor) {
    localStorage.setItem('kb_visitor', 'true');
  }
  
  // Prepare tracking data
  const trackingData: TrackingData = {
    pageId,
    sessionId,
    shopId,
    referrer: document.referrer,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    screenSize: getScreenSize(),
    timestamp: Date.now()
  };
  
  // Send tracking data to API
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'pageview',
      data: trackingData,
      deviceType: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      language: navigator.language,
      isNewVisitor,
      isUnique: !sessionStorage.getItem('kb_page_' + pageId)
    }),
    keepalive: true
  }).catch(error => {
    console.error('Error sending tracking data:', error);
  });
  
  // Mark page as viewed in this session
  sessionStorage.setItem('kb_page_' + pageId, 'true');
  
  // Track scroll depth and engagement
  trackEngagement(pageId, sessionId);
}

// Track user engagement (scroll depth, time on page, clicks)
function trackEngagement(pageId: string, sessionId: string): void {
  let maxScrollDepth = 0;
  let clickCount = 0;
  const startTime = Date.now();
  
  // Track scroll depth
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollDepth = (scrollTop / scrollHeight) * 100;
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
    }
  });
  
  // Track clicks
  window.addEventListener('click', () => {
    clickCount++;
  });
  
  // Send engagement data before page unload
  window.addEventListener('beforeunload', () => {
    const duration = (Date.now() - startTime) / 1000; // in seconds
    
    fetch('/api/analytics/engagement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageId,
        sessionId,
        duration,
        scrollDepth: maxScrollDepth,
        clickCount
      }),
      keepalive: true
    }).catch(error => {
      console.error('Error sending engagement data:', error);
    });
  });
}

// Track conversion
function trackConversion(data: ConversionData): void {
  fetch('/api/analytics/conversion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    keepalive: true
  }).catch(error => {
    console.error('Error sending conversion data:', error);
  });
}

// Initialize tracking
function initTracking(pageId: string, shopId: string): void {
  // Track page view
  trackPageView(pageId, shopId);
  
  // Add conversion tracking to buttons with data-track-conversion attribute
  document.querySelectorAll('[data-track-conversion]').forEach(element => {
    element.addEventListener('click', () => {
      const conversionType = element.getAttribute('data-conversion-type') || 'click';
      const conversionValue = parseFloat(element.getAttribute('data-conversion-value') || '0');
      const productId = element.getAttribute('data-product-id');
      const productName = element.getAttribute('data-product-name');
      const buttonId = element.getAttribute('id') || '';
      
      trackConversion({
        pageId,
        sessionId: getSessionId(),
        conversionType,
        conversionValue,
        productId,
        productName,
        buttonId
      });
    });
  });
  
  // Add conversion tracking to forms with data-track-form-submission attribute
  document.querySelectorAll('form[data-track-form-submission]').forEach(form => {
    form.addEventListener('submit', () => {
      const formId = form.getAttribute('id') || '';
      
      trackConversion({
        pageId,
        sessionId: getSessionId(),
        conversionType: 'form_submission',
        formId
      });
    });
  });
  
  // Track add to cart events
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const addToCartButton = target.closest('[data-add-to-cart]');
    
    if (addToCartButton) {
      const productId = addToCartButton.getAttribute('data-product-id');
      const productName = addToCartButton.getAttribute('data-product-name');
      const price = parseFloat(addToCartButton.getAttribute('data-product-price') || '0');
      const quantity = parseInt(addToCartButton.getAttribute('data-quantity') || '1', 10);
      
      trackConversion({
        pageId,
        sessionId: getSessionId(),
        conversionType: 'add_to_cart',
        conversionValue: price * quantity,
        productId,
        productName,
        quantity
      });
    }
  });
}

// Export tracking functions
export {
  initTracking,
  trackPageView,
  trackConversion,
  getSessionId
};