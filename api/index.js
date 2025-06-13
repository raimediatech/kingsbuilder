const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found, using environment variables from the system');
}

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token', 'X-Shopify-Shop-Domain']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || 'kings-builder-session-secret'));

// Add security headers middleware for Shopify iframe embedding
app.use((req, res, next) => {
  // Set security headers for Shopify iframe embedding
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
  );
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import dashboard routes
try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/dashboard', dashboardRoutes);
  console.log('Dashboard routes registered successfully');
} catch (error) {
  console.error('Error loading dashboard routes:', error);
}

// Import pages routes
try {
  const pagesRoutes = require('./routes/pages');
  app.use('/pages', pagesRoutes);
  app.use('/api/pages', pagesRoutes); // For backward compatibility
  console.log('Pages routes registered successfully');
} catch (error) {
  console.error('Error loading pages routes:', error);
}

// Import templates routes
try {
  const templatesRoutes = require('./routes/templates');
  app.use('/templates', templatesRoutes);
  console.log('Templates routes registered successfully');
} catch (error) {
  console.error('Error loading templates routes:', error);
}

// Import settings routes
try {
  const settingsRoutes = require('./routes/settings');
  app.use('/settings', settingsRoutes);
  console.log('Settings routes registered successfully');
} catch (error) {
  console.error('Error loading settings routes:', error);
}

// Import help routes
try {
  const helpRoutes = require('./routes/help');
  app.use('/help', helpRoutes);
  console.log('Help routes registered successfully');
} catch (error) {
  console.error('Error loading help routes:', error);
}

// Root route - redirect to dashboard or landing
app.get('/', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;

  if (shop) {
    // If we have a shop parameter, go to dashboard
    res.redirect('/dashboard?shop=' + shop);
  } else {
    // Otherwise show a simple landing page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f6f6f7; text-align: center; }
            .container { max-width: 800px; margin: 100px auto; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; margin-bottom: 20px; }
            .btn { display: inline-block; background: #000; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>KingsBuilder</h1>
            <p>The Ultimate Page Builder for Shopify</p>
            <a href="/install" class="btn">Get Started</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Export for Vercel
module.exports = app;

