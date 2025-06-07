// Simple Express server that serves static files
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Redirect all requests to the landing page
app.get('*', (req, res) => {
  // If this is a Shopify request, show a message about connecting to Shopify
  if (req.query.shop || req.query.hmac || req.query.host) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 800px;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: #2c6ecb;
              margin-bottom: 20px;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2c6ecb;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
              margin-top: 20px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #1a5cb8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>KingsBuilder</h1>
            <p>Welcome to KingsBuilder for Shopify!</p>
            <p>Your app is now connected to Shopify. You can start building beautiful pages for your store.</p>
            <p>To access all features, please use the local development version of the app.</p>
            <a href="/" class="button">Return to Home</a>
          </div>
        </body>
      </html>
    `);
  }
  
  // Otherwise serve the landing page
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
