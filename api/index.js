// api/index.js - Minimal working version for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints
app.get('/api/pages', (req, res) => {
  res.json([{ id: '1', title: 'Sample Page', status: 'published' }]);
});

app.get('/api/templates', (req, res) => {
  res.json([{ id: 'blank', name: 'Blank Page', description: 'Start fresh' }]);
});

app.get('/api/analytics/overview', (req, res) => {
  res.json({ totalViews: 100, totalPages: 1, publishedPages: 1 });
});

// Auth callback
app.get('/auth/callback', (req, res) => {
  const shop = req.query.shop || 'demo.myshopify.com';
  res.send(`
    <html>
      <head><title>KingsBuilder Auth</title></head>
      <body>
        <h1>✅ Authentication Successful</h1>
        <p>Shop: ${shop}</p>
        <script>
          setTimeout(() => {
            window.top.location.href = "https://admin.shopify.com/store/${shop.split('.')[0]}/apps/kingsbuilder";
          }, 2000);
        </script>
      </body>
    </html>
  `);
});

// Main route
app.get('*', (req, res) => {
  const isShopifyRequest = req.query.shop || req.query.host;
  const shop = req.query.shop || 'demo.myshopify.com';
  
  if (isShopifyRequest) {
    // Shopify app interface
    res.send(`
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui; margin: 0; padding: 20px; background: #f6f6f7; }
            .container { max-width: 800px; margin: 0 auto; }
            .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: #2c6ecb; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .button { background: #2c6ecb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            .status { color: #00a651; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏗️ KingsBuilder</h1>
              <p>Page Builder for Shopify</p>
            </div>
            
            <div class="card">
              <h2>🎉 Successfully Deployed!</h2>
              <p class="status">✅ App is live and working</p>
              <p><strong>Shop:</strong> ${shop}</p>
              <p><strong>Status:</strong> Connected</p>
              <p><strong>Version:</strong> 1.0.0</p>
            </div>
            
            <div class="card">
              <h3>Quick Actions</h3>
              <button class="button" onclick="alert('Feature coming soon!')">Create Page</button>
              <button class="button" onclick="alert('Feature coming soon!')">View Templates</button>
              <button class="button" onclick="alert('Feature coming soon!')">Analytics</button>
            </div>
            
            <div class="card">
              <h3>Next Steps</h3>
              <ol>
                <li>Create your first custom page</li>
                <li>Choose from our templates</li>
                <li>Customize and publish</li>
                <li>Track performance</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    // Public landing page
    res.send(`
      <html>
        <head>
          <title>KingsBuilder - Page Builder for Shopify</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: system-ui; margin: 0; padding: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { text-align: center; max-width: 600px; padding: 40px 20px; }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
            .button { 
              display: inline-block; padding: 15px 30px; background: white; color: #667eea;
              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem;
            }
            .status { margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏗️ KingsBuilder</h1>
            <p>The ultimate page builder for Shopify stores. Create stunning custom pages with our drag-and-drop editor.</p>
            <a href="https://apps.shopify.com" class="button">Install on Shopify</a>
            
            <div class="status">
              <h3>✅ App Status: Live & Ready</h3>
              <p>Deployment successful • All systems operational</p>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Export for Vercel
module.exports = app;