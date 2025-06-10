const crypto = require('crypto');

// Load environment variables
try {
  require('dotenv').config();
  console.log('Environment variables loaded in shopify-auth middleware');
} catch (error) {
  console.log('No .env file found in shopify-auth middleware, using environment variables from the system');
}

/**
 * Middleware to verify Shopify HMAC signatures
 * This helps ensure requests are coming from Shopify
 */
function verifyShopifyHmac(req, res, next) {
  const hmac = req.query.hmac;
  const shop = req.query.shop;
  
  // If no HMAC or shop, skip verification (for non-Shopify requests)
  if (!hmac || !shop) {
    return next();
  }
  
  try {
    // Get the Shopify API secret
    const secret = process.env.SHOPIFY_API_SECRET;
    
    if (!secret) {
      console.warn('SHOPIFY_API_SECRET not set, skipping HMAC verification');
      return next();
    }
    
    // Create a new object with all query parameters except hmac
    const queryParams = { ...req.query };
    delete queryParams.hmac;
    
    // Sort the parameters alphabetically
    const sortedParams = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    
    // Calculate the HMAC
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(sortedParams)
      .digest('hex');
    
    // Compare the calculated HMAC with the one from the request
    if (calculatedHmac === hmac) {
      // HMAC is valid, proceed
      console.log('Shopify HMAC verification passed');
      return next();
    } else {
      // HMAC is invalid
      console.error('Shopify HMAC verification failed');
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }
  } catch (error) {
    console.error('Error verifying Shopify HMAC:', error);
    return next();
  }
}

/**
 * Middleware to verify Shopify JWT tokens
 */
function verifyShopifyJWT(req, res, next) {
  const idToken = req.query.id_token;
  
  // If no ID token, skip verification
  if (!idToken) {
    return next();
  }
  
  try {
    // For now, just log the token and proceed
    // In a production app, you would verify the JWT signature
    console.log('Shopify JWT token received');
    return next();
  } catch (error) {
    console.error('Error verifying Shopify JWT:', error);
    return next();
  }
}

module.exports = {
  verifyShopifyHmac,
  verifyShopifyJWT
};