// Enhanced Shopify Auth Module

// Load environment variables
require('dotenv').config();
console.log('Environment variables loaded in shopify-auth middleware');

/**
 * Verify Shopify JWT token in Authorization header
 * This is a placeholder implementation - in a real app, you would
 * properly verify the JWT signature
 */
function verifyShopifyJWT(req, res, next) {
  try {
    // In embedded apps, Shopify includes the shop in the query
    // and sends a JWT that can be used to verify the request
    const shop = req.query.shop;
    
    if (shop) {
      // Store the shop name for use in the route handlers
      req.shopifyShop = shop;
      
      // In a production app, you would verify the JWT here
      // For now, we're just passing through
      
      return next();
    }
    
    // If no shop query parameter, check for session or cookies
    if (req.session?.shop || req.cookies?.shopOrigin) {
      req.shopifyShop = req.session?.shop || req.cookies?.shopOrigin;
      return next();
    }
    
    // If this is a direct API request with shop in header
    if (req.headers['x-shopify-shop-domain']) {
      req.shopifyShop = req.headers['x-shopify-shop-domain'];
      return next();
    }
    
    // If JWT verification fails, redirect to Shopify auth
    // This is a fallback for development
    // For now, let the request through with a warning
    console.warn('No shop found in request. JWT verification skipped.');
    return next();
    
  } catch (error) {
    console.error('Error verifying Shopify JWT:', error);
    return next();
  }
}

module.exports = {
  verifyShopifyJWT
};