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
    // THIS IS THE CRITICAL FIX - allow-scripts permission and proper frame-ancestors
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
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
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge - Using the official CDN with proper version -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge-utils/3.5.1/app-bridge-utils.js"></script>
          
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
            
            .section-tabs {
              display: flex;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .tab {
              padding: 12px 16px;
              margin-right: 8px;
              cursor: pointer;
              font-weight: 500;
              color: #6b7280;
              border-bottom: 2px solid transparent;
              text-decoration: none;
            }
            .tab:hover {
              color: #111827;
            }
            .tab.active {
              color: #4f46e5;
              border-bottom-color: #4f46e5;
            }
          </style>
          
          <script>
            // Store shop info
            window.shopOrigin = "${shop || ''}";
            window.shopifyToken = "${accessToken || ''}";
            
            // Initialize Shopify App Bridge - FIXED VERSION
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = "${shop || ''}";
              
              if (shop) {
                try {
                  // Using AppBridge correctly from window.shopify namespace
                  if (window.shopify && window.shopify.createApp) {
                    // New Shopify API
                    const app = window.shopify.createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (shopify namespace)');
                  } 
                  // Try the newer AppBridge 3.x approach
                  else if (window.AppBridge) {
                    const app = window.AppBridge.createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (AppBridge namespace)');
                  }
                  // Try classic @shopify namespace
                  else if (window['@shopify/app-bridge']) {
                    const app = window['@shopify/app-bridge'].createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (@shopify namespace)');
                  }
                  else {
                    console.error('App Bridge not found on window. Available globals:', Object.keys(window));
                  }
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              } else {
                console.warn('No shop origin found, cannot initialize App Bridge');
              }
            });
            
            // Function to create a new page (using a proper modal, not a browser prompt)
            function createNewPage() {
              // Show loading state
              document.getElementById('create-button').disabled = true;
              document.getElementById('create-button').textContent = 'Loading...';
              
              // Create a proper form modal
              const modalContainer = document.createElement('div');
              modalContainer.className = 'modal-container';
              modalContainer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
              
              const modalContent = document.createElement('div');
              modalContent.className = 'modal-content';
              modalContent.style.cssText = 'background:white;padding:24px;border-radius:8px;width:90%;max-width:500px;';
              
              modalContent.innerHTML = '<h2 style="margin-top:0;font-size:20px;font-weight:600;">Create New Page</h2>' +
                '<p>Enter the details for your new page:</p>' +
                '<div style="margin-bottom:16px;">' +
                '<label for="page-title" style="display:block;margin-bottom:6px;font-weight:500;">Page Title</label>' +
                '<input id="page-title" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;" placeholder="Enter page title">' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<label for="page-handle" style="display:block;margin-bottom:6px;font-weight:500;">Page Handle (URL)</label>' +
                '<input id="page-handle" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;" placeholder="page-handle">' +
                '<small style="color:#6b7280;font-size:12px;">Leave empty to generate from title</small>' +
                '</div>' +
                '<div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">' +
                '<button id="cancel-button" style="padding:8px 16px;background:none;border:1px solid #ddd;border-radius:4px;cursor:pointer;">Cancel</button>' +
                '<button id="submit-button" style="padding:8px 16px;background:#4f46e5;color:white;border:none;border-radius:4px;cursor:pointer;">Create Page</button>' +
                '</div>';
              
              modalContainer.appendChild(modalContent);
              document.body.appendChild(modalContainer);
              
              // Set focus to the title input
              setTimeout(() => {
                document.getElementById('page-title').focus();
              }, 100);
              
              // Handle title input to generate handle
              document.getElementById('page-title').addEventListener('input', function(e) {
                const title = e.target.value;
                const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                document.getElementById('page-handle').placeholder = handle || 'page-handle';
              });
              
              // Handle form submission
              document.getElementById('submit-button').addEventListener('click', async function() {
                const title = document.getElementById('page-title').value.trim();
                let handle = document.getElementById('page-handle').value.trim();
                
                if (!title) {
                  alert('Please enter a page title');
                  return;
                }
                
                // Generate handle from title if not provided
                if (!handle) {
                  handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                }
                
                // Show loading state
                document.getElementById('submit-button').textContent = 'Creating...';
                document.getElementById('submit-button').disabled = true;
                
                try {
                  const response = await fetch('/api/pages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Shopify-Shop-Domain': window.shopOrigin
                    },
                    body: JSON.stringify({
                      title: title,
                      handle: handle,
                      content: '<p>Start building your page content here.</p>'
                    })
                  });
                  
                  const result = await response.json();
                  console.log('Create page result:', result);
                  
                  if (result.success) {
                    // Remove the modal
                    document.body.removeChild(modalContainer);
                    
                    // Reset the create button
                    document.getElementById('create-button').disabled = false;
                    document.getElementById('create-button').textContent = 'Create New Page';
                    
                    // Show success message
                    alert('Page created successfully!');
                    
                    // Reload pages
                    loadPages();
                  } else {
                    alert('Error creating page: ' + (result.message || 'Unknown error'));
                    document.getElementById('submit-button').disabled = false;
                    document.getElementById('submit-button').textContent = 'Create Page';
                  }
                } catch (error) {
                  console.error('Error creating page:', error);
                  alert('Failed to create page. Please try again.');
                  document.getElementById('submit-button').disabled = false;
                  document.getElementById('submit-button').textContent = 'Create Page';
                }
              });
              
              // Handle cancel button
              document.getElementById('cancel-button').addEventListener('click', function() {
                document.body.removeChild(modalContainer);
                document.getElementById('create-button').disabled = false;
                document.getElementById('create-button').textContent = 'Create New Page';
              });
            }
            
            // Load pages on startup
            async function loadPages() {
              try {
                const shopOrigin = window.shopOrigin || '';
                console.log('Loading pages for shop:', shopOrigin);
                
                if (!shopOrigin) {
                  console.error('No shop origin found, cannot load pages');
                  alert('Error: No shop specified. Please reload the app from Shopify admin.');
                  return;
                }
                
                // Get the pages container element
                const pagesContainer = document.getElementById('pages-container');
                if (!pagesContainer) {
                  console.error('Pages container not found in DOM');
                  return;
                }
                
                // Show loading state
                pagesContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
                
                try {
                  // Fetch pages from API with shop in query string
                  console.log('Fetching pages from:', '/api/pages?shop=' + encodeURIComponent(shopOrigin));
                  const response = await fetch('/api/pages?shop=' + encodeURIComponent(shopOrigin));
                  console.log('API Response status:', response.status);
                  
                  // Parse the JSON response
                  const result = await response.json();
                  console.log('API Response data:', result);
                  
                  // Clear loading state
                  pagesContainer.innerHTML = '';
                  
                  // Check if the response is successful and has pages
                  if (result && result.success && result.pages) {
                    if (result.pages.length > 0) {
                      // Display each page
                      result.pages.forEach(page => {
                        const pageCard = document.createElement('div');
                        pageCard.className = 'app-card';
                        pageCard.innerHTML = '<h3 class="card-title">' + (page.title || 'Untitled Page') + '</h3>' +
                          '<p>' + (page.body_html ? page.body_html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' : 'No content') + '</p>' +
                          '<div class="button-group">' +
                          '<a href="/builder/' + page.id + '?shop=' + shopOrigin + '" class="app-button">Edit Page</a>' +
                          '</div>';
                        pagesContainer.appendChild(pageCard);
                      });
                    } else {
                      // No pages found
                      pagesContainer.innerHTML = '<div class="app-card"><p>No pages found in your Shopify store. Create your first page to get started.</p></div>';
                    }
                  } else if (result && !result.success) {
                    // API returned an error
                    pagesContainer.innerHTML = '<div class="app-card"><p>Error loading pages: ' + (result.message || 'Unknown error') + '</p></div>';
                  } else {
                    // Unexpected response format
                    pagesContainer.innerHTML = '<div class="app-card"><p>Unexpected response from server. Please refresh to try again.</p></div>';
                  }
                } catch (error) {
                  console.error('Fetch error:', error);
                  pagesContainer.innerHTML = '<div class="app-card"><p>Error connecting to server. Please refresh to try again.</p></div>';
                }
              } catch (error) {
                console.error('Error loading pages:', error);
                // Show error message
                const pagesContainer = document.getElementById('pages-container');
                if (pagesContainer) {
                  pagesContainer.innerHTML = '<div class="app-card"><p>Error loading pages: ' + (error.message || 'Unknown error') + '</p><p>Please refresh to try again.</p></div>';
                }
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
              </div>
            </div>
            
            <div class="section-tabs">
              <a href="/app?shop=${shop}" class="tab active">Dashboard</a>
              <a href="/app/pages?shop=${shop}" class="tab">Pages</a>
              <a href="/app/templates?shop=${shop}" class="tab">Templates</a>
              <a href="/app/analytics?shop=${shop}" class="tab">Analytics</a>
              <a href="/app/settings?shop=${shop}" class="tab">Settings</a>
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Pages</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge-utils/3.5.1/app-bridge-utils.js"></script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
            
            .section-tabs {
              display: flex;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .tab {
              padding: 12px 16px;
              margin-right: 8px;
              cursor: pointer;
              font-weight: 500;
              color: #6b7280;
              border-bottom: 2px solid transparent;
              text-decoration: none;
            }
            .tab:hover {
              color: #111827;
            }
            .tab.active {
              color: #4f46e5;
              border-bottom-color: #4f46e5;
            }
            .app-button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; text-decoration: none; }
          </style>
          
          <script>
            // Initialize App Bridge - FIXED VERSION
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = "${shop || ''}";
              
              if (shop) {
                try {
                  // Try all possible ways to initialize App Bridge
                  if (window.shopify && window.shopify.createApp) {
                    const app = window.shopify.createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (shopify namespace)');
                  } 
                  else if (window.AppBridge) {
                    const app = window.AppBridge.createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (AppBridge namespace)');
                  }
                  else if (window['@shopify/app-bridge']) {
                    const app = window['@shopify/app-bridge'].createApp({
                      apiKey: apiKey,
                      host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0]),
                      forceRedirect: true
                    });
                    window.app = app;
                    console.log('App Bridge initialized (@shopify namespace)');
                  }
                  else {
                    console.error('App Bridge not found on window. Available globals:', Object.keys(window));
                  }
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              } else {
                console.warn('No shop origin found, cannot initialize App Bridge');
              }
            });

            // Load pages on startup
            async function loadPages() {
              try {
                const shopOrigin = "${shop || ''}";
                
                // Get the pages container element
                const pagesContainer = document.getElementById('pages-container');
                
                // Show loading state
                pagesContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
                
                try {
                  // Fetch pages from API
                  const response = await fetch('/api/pages?shop=' + encodeURIComponent(shopOrigin));
                  const result = await response.json();
                  
                  // Clear loading state
                  pagesContainer.innerHTML = '';
                  
                  // Check if the response is successful and has pages
                  if (result && result.success && result.pages) {
                    if (result.pages.length > 0) {
                      // Display each page
                      result.pages.forEach(page => {
                        const pageCard = document.createElement('div');
                        pageCard.className = 'app-card';
                        pageCard.style.marginBottom = '20px';
                        pageCard.innerHTML = '<h3>' + (page.title || 'Untitled Page') + '</h3>' +
                          '<p>' + (page.body_html ? page.body_html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' : 'No content') + '</p>' +
                          '<a href="/builder/' + page.id + '?shop=' + shopOrigin + '" class="app-button">Edit Page</a>';
                        pagesContainer.appendChild(pageCard);
                      });
                    } else {
                      // No pages found
                      pagesContainer.innerHTML = '<div class="app-card"><p>No pages found. Create your first page to get started.</p></div>';
                    }
                  } else {
                    // API returned an error
                    pagesContainer.innerHTML = '<div class="app-card"><p>Error loading pages. Please try again.</p></div>';
                  }
                } catch (error) {
                  console.error('Fetch error:', error);
                  pagesContainer.innerHTML = '<div class="app-card"><p>Error connecting to server. Please try again.</p></div>';
                }
              } catch (error) {
                console.error('Error loading pages:', error);
              }
            }
            
            window.onload = function() {
              loadPages();
            };
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">KingsBuilder</h1>
            
            <div class="section-tabs">
              <a href="/app?shop=${shop}" class="tab">Dashboard</a>
              <a href="/app/pages?shop=${shop}" class="tab active">Pages</a>
              <a href="/app/templates?shop=${shop}" class="tab">Templates</a>
              <a href="/app/settings?shop=${shop}" class="tab">Settings</a>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 class="app-title" style="margin:0;">Your Shopify Pages</h2>
              <button onclick="window.location.href='/app?shop=${shop}'" class="app-button">Back to Dashboard</button>
            </div>
            
            <div id="pages-container">
              <div class="loading"><div class="loading-spinner"></div></div>
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Templates</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge-utils/3.5.1/app-bridge-utils.js"></script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
            
            .section-tabs {
              display: flex;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .tab {
              padding: 12px 16px;
              margin-right: 8px;
              cursor: pointer;
              font-weight: 500;
              color: #6b7280;
              border-bottom: 2px solid transparent;
              text-decoration: none;
            }
            .tab:hover {
              color: #111827;
            }
            .tab.active {
              color: #4f46e5;
              border-bottom-color: #4f46e5;
            }
            .app-button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; text-decoration: none; }
          </style>
          
          <script>
            // Initialize App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = "${shop || ''}";
              
              if (shop && window.AppBridge) {
                try {
                  const app = window.AppBridge.createApp({
                    apiKey: apiKey,
                    host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0])
                  });
                  window.app = app;
                  console.log('App Bridge initialized');
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              }
            });
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">KingsBuilder</h1>
            
            <div class="section-tabs">
              <a href="/app?shop=${shop}" class="tab">Dashboard</a>
              <a href="/app/pages?shop=${shop}" class="tab">Pages</a>
              <a href="/app/templates?shop=${shop}" class="tab active">Templates</a>
              <a href="/app/settings?shop=${shop}" class="tab">Settings</a>
            </div>
            
            <div class="app-card">
              <h2 class="app-title">Page Templates</h2>
              <p>Browse and select from pre-designed templates to quickly create beautiful pages.</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <div style="height: 150px; background: #f4f4f8; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6b7280;">Template Preview</span>
                  </div>
                  <div style="padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">Landing Page</h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">A high-converting landing page template.</p>
                    <button class="app-button" style="width: 100%;">Use Template</button>
                  </div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <div style="height: 150px; background: #f4f4f8; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6b7280;">Template Preview</span>
                  </div>
                  <div style="padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">About Us</h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Tell your brand story with this template.</p>
                    <button class="app-button" style="width: 100%;">Use Template</button>
                  </div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <div style="height: 150px; background: #f4f4f8; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6b7280;">Template Preview</span>
                  </div>
                  <div style="padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">FAQ Page</h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Answer common customer questions.</p>
                    <button class="app-button" style="width: 100%;">Use Template</button>
                  </div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <div style="height: 150px; background: #f4f4f8; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6b7280;">Template Preview</span>
                  </div>
                  <div style="padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">Contact Page</h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Help customers get in touch with you.</p>
                    <button class="app-button" style="width: 100%;">Use Template</button>
                  </div>
                </div>
              </div>
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://unpkg.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Settings</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge-utils/3.5.1/app-bridge-utils.js"></script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .app-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827; }
            .app-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
            
            .section-tabs {
              display: flex;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .tab {
              padding: 12px 16px;
              margin-right: 8px;
              cursor: pointer;
              font-weight: 500;
              color: #6b7280;
              border-bottom: 2px solid transparent;
              text-decoration: none;
            }
            .tab:hover {
              color: #111827;
            }
            .tab.active {
              color: #4f46e5;
              border-bottom-color: #4f46e5;
            }
            .app-button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; text-decoration: none; }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
            .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          </style>
          
          <script>
            // Initialize App Bridge
            document.addEventListener('DOMContentLoaded', function() {
              const apiKey = "128d69fb5441ba3eda3ae4694c71b175";
              const shop = "${shop || ''}";
              
              if (shop && window.AppBridge) {
                try {
                  const app = window.AppBridge.createApp({
                    apiKey: apiKey,
                    host: window.btoa('admin.shopify.com/store/' + shop.split('.')[0])
                  });
                  window.app = app;
                  console.log('App Bridge initialized');
                } catch (error) {
                  console.error('Error initializing App Bridge:', error);
                }
              }
            });
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1 class="app-title">KingsBuilder</h1>
            
            <div class="section-tabs">
              <a href="/app?shop=${shop}" class="tab">Dashboard</a>
              <a href="/app/pages?shop=${shop}" class="tab">Pages</a>
              <a href="/app/templates?shop=${shop}" class="tab">Templates</a>
              <a href="/app/settings?shop=${shop}" class="tab active">Settings</a>
            </div>
            
            <div class="app-card">
              <h2 class="app-title">App Settings</h2>
              
              <div class="form-group">
                <label for="default-theme">Default Page Theme</label>
                <select id="default-theme">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="brand-color">Brand Color</label>
                <input type="color" id="brand-color" value="#6366f1">
              </div>
              
              <div class="form-group">
                <label for="custom-css">Custom CSS</label>
                <textarea id="custom-css" style="width: 100%; height: 150px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;"></textarea>
                <p style="margin-top: 8px; font-size: 14px; color: #6b7280;">Add custom CSS to be applied to all your pages.</p>
              </div>
              
              <div style="margin-top: 30px;">
                <button class="app-button">Save Settings</button>
              </div>
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