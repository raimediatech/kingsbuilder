// api/index.js
const express = require('express');
const { createRequestHandler } = require('@remix-run/express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Check if build exists
const buildPath = path.join(__dirname, '../build');
const hasBuild = fs.existsSync(buildPath);

// Handle all requests
app.all('*', (req, res, next) => {
  // If build exists, use Remix
  if (hasBuild) {
    try {
      return createRequestHandler({
        build: require('../build'),
        mode: process.env.NODE_ENV
      })(req, res, next);
    } catch (error) {
      console.error('Error loading Remix build:', error);
    }
  }
  
  // Check if this is a Shopify request
  const isShopifyRequest = req.query.shop || req.query.host || req.query.hmac;
  
  if (isShopifyRequest) {
    // Redirect to Shopify auth
    const shopifyAuthUrl = `https://admin.shopify.com/store/kingsbuilder/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY || 'your_api_key'}&scope=${encodeURIComponent(process.env.SCOPES || 'write_products,read_products')}&redirect_uri=${encodeURIComponent(process.env.SHOPIFY_APP_URL || 'https://kingsbuilder-git-main-ajay-rais-projects.vercel.app')}/auth/callback`;
    
    return res.redirect(shopifyAuthUrl);
  }
  
  // For non-Shopify requests, serve the landing page
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
