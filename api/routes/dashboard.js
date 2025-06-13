// api/routes/dashboard.js - Dashboard routes
const express = require('express');
const router = express.Router();

// Dashboard home page
router.get('/', async (req, res) => {
  try {
    // Get shop from query parameter
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );

    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');

    // Render the dashboard
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; }
            .dashboard-container { max-width: 1200px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; margin-bottom: 20px; }
            .btn { display: inline-block; background: #000; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-right: 10px; }
            .nav { display: flex; margin-bottom: 30px; }
            .nav a { margin-right: 20px; color: #333; text-decoration: none; }
            .nav a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="dashboard-container">
            <h1>KingsBuilder Dashboard</h1>
            <div class="nav">
              <a href="/dashboard?shop=${shop}">Dashboard</a>
              <a href="/pages?shop=${shop}">Pages</a>
              <a href="/templates?shop=${shop}">Templates</a>
              <a href="/settings?shop=${shop}">Settings</a>
              <a href="/help?shop=${shop}">Help</a>
            </div>
            <p>Welcome to the KingsBuilder dashboard. From here you can manage your Shopify pages and access the page builder.</p>
            <a href="/pages/new?shop=${shop}" class="btn">Create New Page</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the dashboard: ${error.message}</p>
    `);
  }
});

module.exports = router;
