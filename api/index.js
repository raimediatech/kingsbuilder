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

// Import database connection
const { connectToDatabase } = require('./database');

// Connect to database on startup
connectToDatabase()
  .then(db => {
    console.log('Database connected successfully on startup');
  })
  .catch(err => {
    console.error('Failed to connect to database on startup:', err);
  });

// Import Shopify authentication middleware
const { verifyShopifyHmac, verifyShopifyJWT } = require('./middleware/shopify-auth');

// Import Shopify API utilities
const shopifyApi = require('./shopify');

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
  // Check if this is a Shopify request
  const shop = req.query.shop;
  const host = req.query.host;
  
  if (shop || host) {
    // This is a Shopify request, handle it with the API
    return res.send(`
      <html>
        <head>
          <title>KingsBuilder API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .card { background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>KingsBuilder API</h1>
          <div class="card">
            <h2>Status: <span class="success">Running</span></h2>
            <p>The KingsBuilder API is running correctly.</p>
            <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            <p>Shopify API Key: ${process.env.SHOPIFY_API_KEY ? '<span class="success">Configured</span>' : '<span class="error">Missing</span>'}</p>
            <p>Shopify API Secret: ${process.env.SHOPIFY_API_SECRET ? '<span class="success">Configured</span>' : '<span class="error">Missing</span>'}</p>
            <p>Shop: ${shop || 'Not specified'}</p>
            <p>Host: ${host || 'Not specified'}</p>
          </div>
          <div class="card">
            <h2>Available Endpoints</h2>
            <ul>
              <li><a href="/api/health">/api/health</a> - Health check endpoint</li>
              <li><a href="/api/pages">/api/pages</a> - Get all pages</li>
              <li><a href="/editor">/editor</a> - Page Builder Editor</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  }
  
  // Not a Shopify request, try to serve the index.html file
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.get('/api/analytics', (req, res) => {
  res.json({
    totalViews: 2847,
    uniqueVisitors: 1923,
    bounceRate: 34.2,
    avgTimeOnPage: 145,
    topPages: [
      { title: 'Home Page', handle: 'home', views: 1234 },
      { title: 'About Us', handle: 'about', views: 892 },
      { title: 'Contact', handle: 'contact', views: 456 }
    ]
  });
});

app.get('/api/pages', async (req, res) => {
  try {
    // Get shop from query parameter, header, or cookie
    const shop = req.query.shop || req.headers['x-shopify-shop-domain'] || (req.cookies && req.cookies.shopOrigin);
    // Get access token from admin API
    const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const pageId = req.query.id;
    
    console.log('GET /api/pages request:');
    console.log('- Shop:', shop);
    
    if (!shop) {
      return res.status(400).json({ 
        success: false,
        message: 'Shop parameter is required' 
      });
    }
    
    if (pageId) {
      // Get a single page
      console.log(`Getting page ${pageId} from Shopify...`);
      console.log('Shop:', shop);
      
      const result = await shopifyApi.getShopifyPageById(shop, accessToken, pageId);
      return res.json({
        success: true,
        page: result.page
      });
    } else {
      // Get all pages
      console.log('Getting all pages from Shopify...');
      
      const result = await shopifyApi.getShopifyPages(shop, accessToken);
      return res.json({
        success: true,
        pages: result.pages || []
      });
    }
  } catch (error) {
    console.error('Error getting pages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pages',
      error: error.message 
    });
  }
});

app.get('/api/templates', (req, res) => {
  res.json([
    { id: 'landing', name: 'Landing Page', description: 'Perfect for product launches', category: 'Marketing' },
    { id: 'about', name: 'About Us', description: 'Tell your brand story', category: 'Company' },
    { id: 'contact', name: 'Contact Page', description: 'Get in touch form', category: 'Support' }
  ]);
});

// POST endpoint for creating pages
app.post('/api/pages', async (req, res) => {
  try {
    const { title, handle, template, content } = req.body;
    const shop = req.headers['x-shopify-shop-domain'] || req.query.shop || 'kingsbuilder.myshopify.com';
    const accessToken = req.headers['x-shopify-access-token'];
    
    if (!title || !handle) {
      return res.status(400).json({ error: 'Title and handle are required' });
    }
    
    console.log('Creating page...');
    console.log('Shop:', shop);
    console.log('Title:', title);
    console.log('Handle:', handle);
    
    // If no access token, try to get it from the database or session
    if (!accessToken) {
      console.log('No access token provided, attempting to create page in Shopify anyway');
      // In a real app, you would try to get the access token from a database or session
      // For now, we'll continue and let the Shopify API handle the error
    }
    
    // If we have an access token, create the page in Shopify
    const result = await shopifyApi.createShopifyPage(shop, accessToken, {
      title,
      handle,
      content: content || `<div>This is a page created with KingsBuilder</div>`,
      published: false
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Page created successfully in Shopify',
      page: result.page 
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create page',
      error: error.message 
    });
  }
});

// PUT endpoint for updating pages
app.put('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, handle, content, published } = req.body;
    const shop = req.headers['x-shopify-shop-domain'];
    const accessToken = req.headers['x-shopify-access-token'];
    
    if (!shop || !accessToken) {
      return res.status(401).json({ error: 'Shop domain and access token are required' });
    }
    
    console.log(`Updating page ${id} in Shopify...`);
    console.log('Shop:', shop);
    console.log('Content length:', content ? content.length : 0);
    
    // Update the page in Shopify
    const result = await shopifyApi.updateShopifyPage(shop, accessToken, id, {
      title: title || 'Updated Page',
      handle: handle || `updated-page-${id}`,
      content: content || '',
      published: published === true
    });
    
    res.json({ 
      success: true, 
      message: 'Page updated successfully in Shopify',
      page: result.page 
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update page',
      error: error.message 
    });
  }
});

// DELETE endpoint for deleting pages
app.delete('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shop = req.headers['x-shopify-shop-domain'];
    const accessToken = req.headers['x-shopify-access-token'];
    
    if (!shop || !accessToken) {
      return res.status(401).json({ error: 'Shop domain and access token are required' });
    }
    
    console.log(`Deleting page ${id} from Shopify...`);
    console.log('Shop:', shop);
    
    // Delete the page from Shopify
    await shopifyApi.deleteShopifyPage(shop, accessToken, id);
    
    res.json({ 
      success: true, 
      message: `Page ${id} deleted successfully from Shopify` 
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete page',
      error: error.message 
    });
  }
});

// Import routers
const builderRouter = require('./builder_simple');
const pagesRouter = require('./routes/pages');
const dashboardRouter = require('./routes/dashboard');
const authRouter = require('./auth');
const appRouter = require('./routes/app');

// Use routers
app.use('/api/auth', authRouter);
app.use('/builder', builderRouter);
app.use('/api/pages', pagesRouter);
app.use('/dashboard', dashboardRouter);
app.use('/app', appRouter);

// Redirect root to install or dashboard
app.get('/', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;
  
  if (shop) {
    // If we have a shop parameter, go to dashboard
    res.redirect('/dashboard?shop=' + shop);
  } else {
    // Otherwise go to install page
    res.redirect('/install');
  }
});

// This is a fallback for the old builder route
app.get('/builder-old/:pageId', (req, res) => {
  res.redirect(`/builder/${req.params.pageId}?shop=${req.query.shop || ''}`);
});

// Export for Vercel
module.exports = app;