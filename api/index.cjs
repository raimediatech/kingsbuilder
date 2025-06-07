// CommonJS version of the API entry point for Vercel
const { createRequestHandler } = require("@remix-run/express");
const express = require("express");
const path = require("path");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Define a route for the root path
app.get("/", (req, res) => {
  // Check if the request is from Shopify (has Shopify-specific query parameters)
  if (req.query.shop || req.query.hmac || req.query.host) {
    // If it's from Shopify, handle it with Remix
    return createRequestHandler({
      build: require("../build")
    })(req, res);
  }
  
  // Otherwise, serve the landing page
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Handle all other routes with Remix
app.all(
  "*",
  createRequestHandler({
    build: require("../build")
  })
);

module.exports = app;
