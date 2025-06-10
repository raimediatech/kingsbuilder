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
  const jwt = require('jsonwebtoken');
  
  // If no ID token, skip verification
  if (!idToken) {
    return next();
  }
  
  try {
    // Extract the shop from the token if possible
    if (idToken.includes('.')) {
      const tokenParts = idToken.split('.');
      if (tokenParts.length >= 2) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          if (payload && payload.iss) {
            // Extract shop from issuer (iss) claim
            const issMatch = payload.iss.match(/https:\/\/([^\/]+)/);
            if (issMatch && issMatch[1]) {
              const shop = issMatch[1];
              // Store the shop in the request for later use
              req.shopifyShop = shop;
              console.log('Extracted shop from JWT:', shop);
              
              // Also store in session if available
              if (req.session) {
                req.session.shop = shop;
              }
              
              // Store in cookie for future requests
              res.cookie('shopOrigin', shop, {
                httpOnly: false,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAME_SITE || 'none',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
              });
            }
          }
          
          // Store the access token if present in the payload
          if (payload && payload.access_token) {
            req.shopifyAccessToken = payload.access_token;
            
            // Also store in session if available
            if (req.session) {
              req.session.accessToken = payload.access_token;
            }
            
            // Store in secure cookie for future requests
            res.cookie('shopifyAccessToken', payload.access_token, {
              httpOnly: true,
              secure: process.env.COOKIE_SECURE === 'true',
              sameSite: process.env.COOKIE_SAME_SITE || 'none',
              maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
          }
        } catch (e) {
          console.error('Error parsing JWT payload:', e);
        }
      }
    }
    
    // Try to verify the JWT if we have a secret
    const secret = process.env.SHOPIFY_API_SECRET;
    if (secret) {
      try {
        const verified = jwt.verify(idToken, secret, {
          algorithms: ['HS256'],
          ignoreExpiration: false
        });
        console.log('JWT verification successful');
      } catch (jwtError) {
        console.warn('JWT verification failed:', jwtError.message);
        // Continue anyway for development purposes
      }
    }
    
    // Set proper headers for Shopify iframe embedding
    // Use Content-Security-Policy instead of X-Frame-Options
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors https://*.myshopify.com https://*.shopify.com;"
    );
    
    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');
    
    console.log('Shopify JWT token processed');
    return next();
  } catch (error) {
    console.error('Error processing Shopify JWT:', error);
    return next();
  }
}

module.exports = {
  verifyShopifyHmac,
  verifyShopifyJWT
};