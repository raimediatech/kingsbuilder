// server.js - Simple Express server for Shopify app
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = require('./api/index.js');

// Add security headers middleware
app.use((req, res, next) => {
  // Set security headers for Shopify iframe embedding
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' https://cdn.shopify.com;"
  );
  
  // Allow scripts to run in iframe
  res.setHeader("X-Frame-Options", "ALLOW-FROM https://*.myshopify.com https://*.shopify.com");
  
  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`KingsBuilder Shopify app listening on port ${port}`);
  console.log(`App URL: ${process.env.SHOPIFY_APP_URL || 'http://localhost:' + port}`);
});