// api/routes/app.js - Embedded app route
const express = require('express');
const router = express.Router();
const { verifyShopifyJWT } = require('../middleware/shopify-auth');

// Debug endpoint to check if app route is working
router.get('/debug', (req, res) => {
  res.json({
    message: 'App route is working',
    timestamp: new Date().toISOString(),
    query: req.query,
    cookies: req.cookies,
    headers: req.headers
  });
});

// Apply Shopify JWT verification middleware
router.use(verifyShopifyJWT);

// Main app route - handles the embedded app view
router.get('/', async (req, res) => {
  try {
    console.log('App route accessed with query params:', req.query);
    console.log('Request headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    // Get shop from various possible sources with better logging
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    console.log('Identified shop:', shop);
    
    // Get access token from various possible sources
    const accessToken = req.headers['x-shopify-access-token'] || req.shopifyAccessToken || req.cookies?.shopifyAccessToken;
    console.log('Access token available:', !!accessToken);
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    // Render the embedded app HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
          <script src="https://unpkg.com/@shopify/app-bridge-utils@3"></script>
          <script>
            var actions = window.shopify?.actions || { Navigation: { create: () => {} } };
          </script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            
            .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .app-title { margin: 0; font-size: 24px; font-weight: 600; color: #111827; }
            
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
            .card-title { margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #111827; }
            
            .app-button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; text-decoration: none; }
            .app-button:hover { background: #4f46e5; }
            
            .button-group { display: flex; gap: 10px; margin-top: 20px; }
            
            .loading { display: flex; justify-content: center; align-items: center; height: 100px; }
            .loading-spinner { border: 4px solid #f3f3f3; border-top: 4px solid #6366f1; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
          
          <script>
            // Store shop info
            window.shopOrigin = '${shop || ''}';
            window.shopifyToken = '${accessToken || ''}';
            
            // Initialize Shopify App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = '${shop || ''}';
              
              if (shop) {
                const config = {
                  apiKey: apiKey,
                  host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                  forceRedirect: true
                };
                
                try {
                  const app = window.shopify.createApp(config);
                  
                  // Set up app navigation
                  const nav = actions.Navigation.create(app);
                  
                  // Create the navigation structure
                  nav.set({
                    items: [
                      {
                        destination: '/app',
                        label: 'Dashboard',
                        selected: true
                      },
                      {
                        destination: '/app/pages',
                        label: 'Pages'
                      },
                      {
                        destination: '/app/templates',
                        label: 'Templates'
                      },
                      {
                        destination: '/app/settings',
                        label: 'Settings'
                      }
                    ]
                  });
                  
                  console.log('App Bridge initialized with navigation');
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              } else {
                console.warn('No shop origin found, cannot initialize App Bridge');
              }
            });
            
            // Function to navigate to dashboard
            function goToDashboard() {
              window.location.href = '/dashboard?shop=' + window.shopOrigin;
            }
            
            // Function to create a new page
            async function createNewPage() {
              try {
                const title = prompt('Enter a title for your new page:');
                
                if (!title) {
                  return;
                }
                
                // Show loading state
                document.getElementById('create-button').disabled = true;
                document.getElementById('create-button').textContent = 'Creating...';
                
                const response = await fetch('/api/pages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Shop-Domain': window.shopOrigin
                  },
                  body: JSON.stringify({
                    title: title,
                    content: '<p>Start building your page content here.</p>'
                  })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  // Redirect to the builder for the new page
                  window.location.href = '/builder/' + result.page.id + '?shop=' + window.shopOrigin;
                } else {
                  alert('Error creating page: ' + (result.message || 'Unknown error'));
                  document.getElementById('create-button').disabled = false;
                  document.getElementById('create-button').textContent = 'Create New Page';
                }
              } catch (error) {
                console.error('Error creating page:', error);
                alert('Failed to create page. Please try again.');
                document.getElementById('create-button').disabled = false;
                document.getElementById('create-button').textContent = 'Create New Page';
              }
            }
            
            // Load pages on startup
            async function loadPages() {
              try {
                const response = await fetch('/api/pages?shop=' + window.shopOrigin);
                const result = await response.json();
                
                const pagesContainer = document.getElementById('pages-container');
                pagesContainer.innerHTML = '';
                
                if (result.success && result.pages && result.pages.length > 0) {
                  result.pages.forEach(page => {
                    const pageCard = document.createElement('div');
                    pageCard.className = 'app-card';
                    pageCard.innerHTML = \`
                      <h3 class="card-title">\${page.title}</h3>
                      <p>\${page.body_html ? page.body_html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' : 'No content'}</p>
                      <div class="button-group">
                        <a href="/builder/\${page.id}?shop=\${window.shopOrigin}" class="app-button">Edit Page</a>
                      </div>
                    \`;
                    pagesContainer.appendChild(pageCard);
                  });
                } else {
                  pagesContainer.innerHTML = '<div class="app-card"><p>No pages found. Create your first page to get started.</p></div>';
                }
              } catch (error) {
                console.error('Error loading pages:', error);
                document.getElementById('pages-container').innerHTML = '<div class="app-card"><p>Error loading pages. Please refresh to try again.</p></div>';
              }
            }
            
            // Initialize app
            window.onload = function() {
              loadPages();
            };
          </script>
        </head>
        <body>
          <div class="app-container">
            <div class="app-header">
              <h1 class="app-title">KingsBuilder</h1>
              <div class="button-group">
                <button id="create-button" class="app-button" onclick="createNewPage()">Create New Page</button>
                <button class="app-button" onclick="goToDashboard()">Go to Dashboard</button>
              </div>
            </div>
            
            <div class="app-card">
              <h2 class="card-title">Welcome to KingsBuilder</h2>
              <p>Build beautiful custom pages for your Shopify store without coding. Create, edit, and publish pages with our easy-to-use drag-and-drop builder.</p>
            </div>
            
            <h2 class="app-title">Your Pages</h2>
            <div id="pages-container" class="loading">
              <div class="loading-spinner"></div>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in app route:', error);
    res.status(500).send('An error occurred. Please try again.');
  }
});

// Pages route
router.get('/pages', async (req, res) => {
  try {
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Pages</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
          <script src="https://unpkg.com/@shopify/app-bridge-utils@3"></script>
          <script>
            var actions = window.shopify?.actions || { Navigation: { create: () => {} } };
          </script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
          </style>
          
          <script>
            // Initialize App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = '${shop || ''}';
              
              if (shop) {
                const config = {
                  apiKey: apiKey,
                  host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                  forceRedirect: true
                };
                
                try {
                  const app = window.shopify.createApp(config);
                  
                  // Set up app navigation
                  const nav = actions.Navigation.create(app);
                  
                  // Create the navigation structure
                  nav.set({
                    items: [
                      {
                        destination: '/app',
                        label: 'Dashboard'
                      },
                      {
                        destination: '/app/pages',
                        label: 'Pages',
                        selected: true
                      },
                      {
                        destination: '/app/templates',
                        label: 'Templates'
                      },
                      {
                        destination: '/app/settings',
                        label: 'Settings'
                      }
                    ]
                  });
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              }
            });
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">Pages</h1>
            <div class="app-card">
              <p>Manage your custom pages here. This section will show all the pages you've created with KingsBuilder.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in pages route:', error);
    res.status(500).send('An error occurred. Please try again.');
  }
});

// Templates route
router.get('/templates', async (req, res) => {
  try {
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Templates</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
          <script src="https://unpkg.com/@shopify/app-bridge-utils@3"></script>
          <script>
            var actions = window.shopify?.actions || { Navigation: { create: () => {} } };
          </script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
          </style>
          
          <script>
            // Initialize App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = '${shop || ''}';
              
              if (shop) {
                const config = {
                  apiKey: apiKey,
                  host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                  forceRedirect: true
                };
                
                try {
                  const app = window.shopify.createApp(config);
                  
                  // Set up app navigation
                  const nav = actions.Navigation.create(app);
                  
                  // Create the navigation structure
                  nav.set({
                    items: [
                      {
                        destination: '/app',
                        label: 'Dashboard'
                      },
                      {
                        destination: '/app/pages',
                        label: 'Pages'
                      },
                      {
                        destination: '/app/templates',
                        label: 'Templates',
                        selected: true
                      },
                      {
                        destination: '/app/settings',
                        label: 'Settings'
                      }
                    ]
                  });
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              }
            });
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">Templates</h1>
            <div class="app-card">
              <p>Browse and select from pre-designed templates to quickly create beautiful pages.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in templates route:', error);
    res.status(500).send('An error occurred. Please try again.');
  }
});

// Settings route
router.get('/settings', async (req, res) => {
  try {
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Settings</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
          <script src="https://unpkg.com/@shopify/app-bridge-utils@3"></script>
          <script>
            var actions = window.shopify?.actions || { Navigation: { create: () => {} } };
          </script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
          </style>
          
          <script>
            // Initialize App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = '${shop || ''}';
              
              if (shop) {
                const config = {
                  apiKey: apiKey,
                  host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                  forceRedirect: true
                };
                
                try {
                  const app = window.shopify.createApp(config);
                  
                  // Set up app navigation
                  const nav = actions.Navigation.create(app);
                  
                  // Create the navigation structure
                  nav.set({
                    items: [
                      {
                        destination: '/app',
                        label: 'Dashboard'
                      },
                      {
                        destination: '/app/pages',
                        label: 'Pages'
                      },
                      {
                        destination: '/app/templates',
                        label: 'Templates'
                      },
                      {
                        destination: '/app/settings',
                        label: 'Settings',
                        selected: true
                      }
                    ]
                  });
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              }
            });
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">Settings</h1>
            <div class="app-card">
              <p>Configure your KingsBuilder settings and preferences here.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in settings route:', error);
    res.status(500).send('An error occurred. Please try again.');
  }
});

module.exports = router;