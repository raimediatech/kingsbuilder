import { LoaderFunction } from "@remix-run/node";
import { CodeMinifier } from "~/utils/code-minifier";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId") || "";
  const shopId = url.searchParams.get("shopId") || "";

  // Generate the tracking script
  const script = `
    // KingsBuilder Analytics Tracking Script
    (function() {
      // Define tracking data types
      function generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      function getSessionId() {
        let sessionId = sessionStorage.getItem('kb_session_id');
        if (!sessionId) {
          sessionId = generateSessionId();
          sessionStorage.setItem('kb_session_id', sessionId);
        }
        return sessionId;
      }

      function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
          return 'mobile';
        } else if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
          return 'tablet';
        }
        return 'desktop';
      }

      function getBrowser() {
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

      function getOS() {
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

      function getScreenSize() {
        return \`\${window.screen.width}x\${window.screen.height}\`;
      }

      function trackPageView() {
        const sessionId = getSessionId();
        const isNewVisitor = !localStorage.getItem('kb_visitor');
        
        if (isNewVisitor) {
          localStorage.setItem('kb_visitor', 'true');
        }
        
        const trackingData = {
          pageId: "${pageId}",
          sessionId,
          shopId: "${shopId}",
          referrer: document.referrer,
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          screenSize: getScreenSize(),
          timestamp: Date.now()
        };
        
        fetch('${url.origin}/api/analytics/track', {
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
            isUnique: !sessionStorage.getItem('kb_page_${pageId}')
          }),
          keepalive: true
        }).catch(error => {
          console.error('Error sending tracking data:', error);
        });
        
        sessionStorage.setItem('kb_page_${pageId}', 'true');
        
        trackEngagement();
      }

      function trackEngagement() {
        let maxScrollDepth = 0;
        let clickCount = 0;
        const startTime = Date.now();
        
        window.addEventListener('scroll', () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrollDepth = (scrollTop / scrollHeight) * 100;
          
          if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
          }
        });
        
        window.addEventListener('click', () => {
          clickCount++;
        });
        
        window.addEventListener('beforeunload', () => {
          const duration = (Date.now() - startTime) / 1000;
          
          fetch('${url.origin}/api/analytics/engagement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pageId: "${pageId}",
              sessionId: getSessionId(),
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

      function trackConversion(data) {
        fetch('${url.origin}/api/analytics/conversion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            pageId: "${pageId}",
            sessionId: getSessionId()
          }),
          keepalive: true
        }).catch(error => {
          console.error('Error sending conversion data:', error);
        });
      }

      function initTracking() {
        trackPageView();
        
        document.querySelectorAll('[data-track-conversion]').forEach(element => {
          element.addEventListener('click', () => {
            const conversionType = element.getAttribute('data-conversion-type') || 'click';
            const conversionValue = parseFloat(element.getAttribute('data-conversion-value') || '0');
            const productId = element.getAttribute('data-product-id');
            const productName = element.getAttribute('data-product-name');
            const buttonId = element.getAttribute('id') || '';
            
            trackConversion({
              conversionType,
              conversionValue,
              productId,
              productName,
              buttonId
            });
          });
        });
        
        document.querySelectorAll('form[data-track-form-submission]').forEach(form => {
          form.addEventListener('submit', () => {
            const formId = form.getAttribute('id') || '';
            
            trackConversion({
              conversionType: 'form_submission',
              formId
            });
          });
        });
        
        document.addEventListener('click', (event) => {
          const target = event.target;
          const addToCartButton = target.closest('[data-add-to-cart]');
          
          if (addToCartButton) {
            const productId = addToCartButton.getAttribute('data-product-id');
            const productName = addToCartButton.getAttribute('data-product-name');
            const price = parseFloat(addToCartButton.getAttribute('data-product-price') || '0');
            const quantity = parseInt(addToCartButton.getAttribute('data-quantity') || '1', 10);
            
            trackConversion({
              conversionType: 'add_to_cart',
              conversionValue: price * quantity,
              productId,
              productName,
              quantity
            });
          }
        });
      }

      // Initialize tracking when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
      } else {
        initTracking();
      }

      // Expose tracking functions globally
      window.KBAnalytics = {
        trackConversion: trackConversion
      };
    })();
  `;

  // Minify the script
  const minifiedScript = await CodeMinifier.minifyJs(script);

  // Return the script with appropriate headers
  return new Response(minifiedScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
};