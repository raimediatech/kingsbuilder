// api/routes/app.js - Embedded app route
const express = require('express');
const router = express.Router();
const { verifyShopifyJWT } = require('../shopify-auth');

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
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; }
            .app-container { max-width: 1200px; margin: 0 auto; }
            .app-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .app-button { background: #5c6ac4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
          </style>
          
          <script>
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
            
            async function loadPages() {
              const pagesContainer = document.getElementById('pages-container');
              pagesContainer.innerHTML = '<p>Loading pages...</p>';
              
              try {
                const response = await fetch('/api/pages?shop=${shop}');
                const result = await response.json();
                
                if (result.success && result.pages && result.pages.length > 0) {
                  pagesContainer.innerHTML = '';
                  result.pages.forEach(page => {
                    const pageCard = document.createElement('div');
                    pageCard.className = 'app-card';
                    pageCard.innerHTML = '<h3>' + page.title + '</h3>' +
                      '<p>' + (page.body_html ? page.body_html.substring(0, 100) + '...' : 'No content') + '</p>' +
                      '<a href="/builder/' + page.id + '?shop=${shop}" class="app-button">Edit Page</a>';
                    pagesContainer.appendChild(pageCard);
                  });
                } else {
                  pagesContainer.innerHTML = '<div class="app-card"><p>No pages found. Create your first page to get started.</p></div>';
                }
              } catch (error) {
                console.error('Error loading pages:', error);
                pagesContainer.innerHTML = '<div class="app-card"><p>Error loading pages. Please try again.</p></div>';
              }
            }
            
            window.onload = function() {
              loadPages();
            };
          </script>
        </head>
        <body>
          <div class="app-container">
            <h1>KingsBuilder</h1>
            
            <div class="app-card">
              <h2>Welcome to KingsBuilder</h2>
              <p>Build beautiful custom pages for your Shopify store without coding.</p>
              <button onclick="window.location.href='/app/pages?shop=${shop}'">View All Pages</button>
              <button onclick="window.location.href='/app/templates?shop=${shop}'">Templates</button>
            </div>
            
            <h2>Your Pages</h2>
            <div id="pages-container"></div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in app route:', error);
    res.status(500).send('An error occurred: ' + error.message);
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Pages</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; }
            .app-container { max-width: 1200px; margin: 0 auto; }
            .app-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="app-container">
            <h1>KingsBuilder - Pages</h1>
            
            <div class="app-card">
              <h2>Your Pages</h2>
              <p>Manage your custom pages here.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in pages route:', error);
    res.status(500).send('An error occurred: ' + error.message);
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Templates</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; }
            .app-container { max-width: 1200px; margin: 0 auto; }
            .app-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="app-container">
            <h1>KingsBuilder - Templates</h1>
            
            <div class="app-card">
              <h2>Templates</h2>
              <p>Browse pre-designed templates.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in templates route:', error);
    res.status(500).send('An error occurred: ' + error.message);
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
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com;"
    );
    
    // Modern way to allow embedding in iframes
    res.removeHeader('X-Frame-Options');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Settings</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Shopify App Bridge -->
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge/3.7.7/app-bridge.js"></script>
          
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; }
            .app-container { max-width: 1200px; margin: 0 auto; }
            .app-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="app-container">
            <h1>KingsBuilder - Settings</h1>
            
            <div class="app-card">
              <h2>Settings</h2>
              <p>Configure your app settings here.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in settings route:', error);
    res.status(500).send('An error occurred: ' + error.message);
  }
});

module.exports = router;