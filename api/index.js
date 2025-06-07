// Simple Express server for Shopify app
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Handle Shopify app requests
app.get('*', (req, res) => {
  // Check if this is a Shopify request
  const isShopifyRequest = req.query.shop || req.query.host || req.query.hmac;
  
  if (isShopifyRequest) {
    // Shopify app interface
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #202223;
              background-color: #f6f6f7;
            }
            .app-container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #ddd;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2c6ecb;
            }
            .nav {
              display: flex;
              gap: 20px;
            }
            .nav-item {
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
            }
            .nav-item.active {
              background-color: #f1f8ff;
              color: #2c6ecb;
            }
            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 20px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 16px;
              background-color: #2c6ecb;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
            }
            .button:hover {
              background-color: #1a5cb8;
            }
            .page-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .page-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .page-preview {
              height: 160px;
              background-color: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #888;
            }
            .page-info {
              padding: 15px;
            }
            .page-title {
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .page-actions {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-top: 10px;
            }
            .tab-container {
              margin-top: 20px;
            }
            .tabs {
              display: flex;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
            }
            .tab {
              padding: 10px 20px;
              cursor: pointer;
              border-bottom: 2px solid transparent;
            }
            .tab.active {
              border-bottom-color: #2c6ecb;
              color: #2c6ecb;
            }
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              color: #637381;
            }
            .empty-state h3 {
              margin-bottom: 10px;
              color: #202223;
            }
          </style>
        </head>
        <body>
          <div class="app-container">
            <div class="header">
              <div class="logo">KingsBuilder</div>
              <div class="nav">
                <div class="nav-item active">Pages</div>
                <div class="nav-item">Templates</div>
                <div class="nav-item">Settings</div>
              </div>
            </div>
            
            <div class="card">
              <h2>Pages</h2>
              <p>Create and manage custom pages for your Shopify store.</p>
              <button class="button">Create New Page</button>
              
              <div class="tab-container">
                <div class="tabs">
                  <div class="tab active">All Pages</div>
                  <div class="tab">Published</div>
                  <div class="tab">Drafts</div>
                </div>
                
                <div class="empty-state">
                  <h3>No pages yet</h3>
                  <p>Click "Create New Page" to build your first custom page.</p>
                </div>
                
                <div class="page-list" style="display: none;">
                  <div class="page-card">
                    <div class="page-preview">Page Preview</div>
                    <div class="page-info">
                      <h3 class="page-title">Homepage</h3>
                      <p>Last edited: June 7, 2025</p>
                      <div class="page-actions">
                        <button class="button">Edit</button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="page-card">
                    <div class="page-preview">Page Preview</div>
                    <div class="page-info">
                      <h3 class="page-title">About Us</h3>
                      <p>Last edited: June 5, 2025</p>
                      <div class="page-actions">
                        <button class="button">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <h2>Quick Start Guide</h2>
              <p>Follow these steps to create your first custom page:</p>
              <ol>
                <li>Click "Create New Page" to start with a blank canvas or template</li>
                <li>Use the drag-and-drop editor to add and arrange elements</li>
                <li>Customize colors, fonts, and content to match your brand</li>
                <li>Preview your page to see how it will look on different devices</li>
                <li>Publish your page when you're ready to make it live</li>
              </ol>
            </div>
          </div>
          
          <script>
            // Simple interactivity for demo purposes
            document.querySelectorAll('.button').forEach(button => {
              button.addEventListener('click', () => {
                alert('This is a demo interface. The full app functionality will be available soon.');
              });
            });
            
            document.querySelectorAll('.nav-item, .tab').forEach(item => {
              item.addEventListener('click', (e) => {
                // Remove active class from siblings
                e.target.parentElement.querySelectorAll('.active').forEach(el => {
                  el.classList.remove('active');
                });
                // Add active class to clicked item
                e.target.classList.add('active');
              });
            });
          </script>
        </body>
      </html>
    `);
  }
  
  // Regular landing page for non-Shopify requests
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
