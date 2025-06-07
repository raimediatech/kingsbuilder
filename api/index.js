// api/index.js - CommonJS version for Vercel
const { createRequestHandler } = require("@remix-run/express");
const express = require("express");
const path = require("path");

// Create Express app
const app = express();

// Serve public files
app.use(express.static(path.join(__dirname, "..", "public")));

// Handle all requests with Remix
app.all("*", (req, res, next) => {
  // This is a fallback in case the build files aren't available yet
  try {
    const build = require("../build");
    return createRequestHandler({
      build,
      mode: process.env.NODE_ENV
    })(req, res, next);
  } catch (error) {
    console.error("Error loading Remix build:", error);
    res.status(500).send(`
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>KingsBuilder</h1>
            <p>The app is currently being deployed. Please check back in a few minutes.</p>
            <p>If this message persists, please contact support.</p>
          </div>
        </body>
      </html>
    `);
  }
});

module.exports = app;
