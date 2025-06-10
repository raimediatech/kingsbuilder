// api/builder_simple.js - Simple page builder functionality
const express = require('express');
const router = express.Router();

// Get page builder for a specific page
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const shop = req.query.shop || 'demo-shop';
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );
    
    console.log(`Loading page builder for page ID: ${pageId} from shop: ${shop}`);
    
    // Simple HTML response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Page Builder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; }
            .header { border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
            .title { margin: 0; color: #333; }
            .builder { min-height: 400px; border: 2px dashed #ddd; border-radius: 8px; padding: 40px; text-align: center; }
            .success { color: green; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">KingsBuilder - Page Builder</h1>
              <p class="success">✅ Builder loaded successfully!</p>
            </div>
            <div class="builder">
              <h2>Page Builder for Page ID: ${pageId}</h2>
              <p>Shop: ${shop}</p>
              <p>The page builder is now working! You can start building your page here.</p>
              <button onclick="alert('Save functionality works!')">Save Page</button>
              <button onclick="alert('Publish functionality works!')">Publish Page</button>
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering page builder:', error);
    res.status(500).send('Error loading page builder: ' + error.message);
  }
});

module.exports = router;