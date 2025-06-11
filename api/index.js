const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// Load environment variables
try {
  require('dotenv').config();
  console.log('Environment variables loaded in API index');
} catch (error) {
  console.log('No .env file found in API index, using environment variables from the system');
}

// Import database connection - but don't connect immediately
const { connectToDatabase } = require('./database');

// Schedule database connection for later to avoid blocking server startup
setTimeout(() => {
  connectToDatabase()
    .then(db => {
      if (db) {
        console.log('Database connected successfully');
      } else {
        console.log('Using mock data since database connection failed');
      }
    })
    .catch(err => {
      console.error('Failed to connect to database:', err);
      console.log('Continuing with mock data');
    });
}, 2000);

// Import Shopify authentication middleware - with try/catch
let verifyShopifyHmac, verifyShopifyJWT;
try {
  const auth = require('./middleware/shopify-auth');
  verifyShopifyHmac = auth.verifyShopifyHmac;
  verifyShopifyJWT = auth.verifyShopifyJWT;
} catch (error) {
  console.error('Error loading Shopify auth middleware:', error);
  // Provide fallback middleware
  verifyShopifyHmac = (req, res, next) => next();
  verifyShopifyJWT = (req, res, next) => next();
}

// Import Shopify API utilities - with try/catch
let shopifyApi;
try {
  shopifyApi = require('./shopify');
} catch (error) {
  console.error('Error loading Shopify API utilities:', error);
  // Provide fallback API utilities
  shopifyApi = {
    createShopifyPage: () => Promise.resolve({ page: { id: '123', title: 'Mock Page' }}),
    updateShopifyPage: () => Promise.resolve({ page: { id: '123', title: 'Updated Mock Page' }}),
    getShopifyPages: () => Promise.resolve({ pages: [] }),
    getShopifyPageById: () => Promise.resolve({ page: { id: '123', title: 'Mock Page' }}),
    deleteShopifyPage: () => Promise.resolve({})
  };
}

// Configure CORS - Allow all origins in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token', 'X-Shopify-Shop-Domain']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || 'kings-builder-session-secret'));

// Apply Shopify authentication middleware
app.use(verifyShopifyHmac);
app.use(verifyShopifyJWT);

// Custom auth middleware that checks for access tokens
let verifyShopifyAuth;
try {
  const authUtils = require('./utils/shopify-auth');
  verifyShopifyAuth = authUtils.verifyShopifyAuth;
  app.use(verifyShopifyAuth);
  console.log('Shopify auth utilities loaded successfully');
} catch (error) {
  console.error('Error loading Shopify auth utilities:', error);
  verifyShopifyAuth = (req, res, next) => next();
}

// Configure cookies
app.use((req, res, next) => {
  res.cookie('shopify_app_session', '', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'none'
  });
  next();
});

// Add security headers middleware for Shopify iframe embedding
app.use((req, res, next) => {
  // Set security headers for Shopify iframe embedding
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
  );
  
  // Allow scripts to run in iframe
  res.setHeader("X-Frame-Options", "ALLOW-FROM https://*.myshopify.com https://*.shopify.com");
  
  // Remove sandbox restrictions that are blocking scripts
  
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    shopifyApiKey: process.env.SHOPIFY_API_KEY ? 'configured' : 'missing',
    shopifyApiSecret: process.env.SHOPIFY_API_SECRET ? 'configured' : 'missing'
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Root route - serve index.html if it exists, otherwise show API status
app.get('/', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;

  if (shop) {
    // If we have a shop parameter, go to dashboard
    res.redirect('/dashboard?shop=' + shop);
  } else {
    // Otherwise go to landing page
    res.redirect('/landing');
  }
});

// This is a fallback for the old builder route
app.get('/builder-old/:pageId', (req, res) => {
  res.redirect(`/builder/${req.params.pageId}?shop=${req.query.shop || ''}`);
});

// Export for Vercel
module.exports = app;






// Landing page route
app.get('/landing', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KingsBuilder - Premium Shopify Page Builder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0A0A0A;
      color: #FFFFFF;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
    .hero-content {
      max-width: 800px;
    }
    .hero-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .hero-subtitle {
      font-size: 24px;
      color: #AAAAAA;
      margin-bottom: 40px;
    }
    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background-color: #222222;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .button:hover {
      background-color: #333333;
      transform: translateY(-5px);
    }
    .button-outline {
      background-color: transparent;
      border: 2px solid #FFFFFF;
    }
    .button-outline:hover {
      background-color: #FFFFFF;
      color: #000000;
    }
    @media (max-width: 768px) {
      .hero-title {
        font-size: 36px;
      }
      .hero-subtitle {
        font-size: 18px;
      }
      .cta-buttons {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">KingsBuilder</h1>
      <p class="hero-subtitle">Welcome to KingsBuilder - The Ultimate Page Builder for Shopify. Create beautiful, customized pages for your Shopify store without writing any code.</p>
      <div class="cta-buttons">
        <a href="https://apps.shopify.com/kingsbuilder" class="button">Open in Shopify</a>
        <a href="/install" class="button button-outline">Get Started</a>
      </div>
    </div>
  </section>
</body>
</html>`);
});


// App route for Shopify admin
app.get('/app', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;
  
  if (shop) {
    // Redirect to dashboard with shop parameter
    res.redirect('/dashboard?shop=' + shop);
  } else {
    // If no shop parameter, redirect to install
    res.redirect('/install');
  }
});
