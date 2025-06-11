/**
 * shopify-auth.js - Utilities for Shopify authentication
 * Handles getting and storing authentication tokens for Shopify API access
 */

const cookieParser = require('cookie-parser');

// Environment variables
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-10';
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CUSTOM_APP_API_KEY || '128d69fb5441ba3eda3ae4694c71b175';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CUSTOM_APP_SECRET;
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

// In-memory token storage for development
const tokenStore = new Map();

/**
 * Gets the access token for a shop from various sources
 * 
 * @param {Object} req - Express request object
 * @returns {Object} Object containing shop and accessToken
 */
function getShopifyAuth(req) {
  // Get shop from various possible sources
  const shop = req.query.shop || 
               req.headers['x-shopify-shop-domain'] || 
               req.cookies?.shopOrigin || 
               req.cookies?.shopify_domain;
  
  // Try to get from headers or cookies first
  let accessToken = req.headers['x-shopify-access-token'] || 
                   req.cookies?.shopifyAccessToken || 
                   req.cookies?.shopify_token;
  
  // If not found, try to get from our token store
  if (!accessToken && shop) {
    accessToken = tokenStore.get(shop);
  }
  
  // If still not found, try environment variables as fallback
  if (!accessToken) {
    accessToken = SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  }
  
  return { shop, accessToken };
}

/**
 * Stores an access token for a shop
 * 
 * @param {string} shop - Shopify shop domain
 * @param {string} accessToken - Shopify access token
 */
function storeShopifyToken(shop, accessToken) {
  if (shop && accessToken) {
    tokenStore.set(shop, accessToken);
    console.log(`Stored access token for shop: ${shop}`);
  }
}

/**
 * Express middleware to extract and verify Shopify authentication
 */
function verifyShopifyAuth(req, res, next) {
  const { shop, accessToken } = getShopifyAuth(req);
  
  if (shop) {
    // Attach to request object for later use
    req.shopifyShop = shop;
    req.shopifyAccessToken = accessToken;
    
    // Also set cookies for browser storage
    res.cookie('shopOrigin', shop, { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    if (accessToken) {
      res.cookie('shopifyAccessToken', accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
  }
  
  next();
}

module.exports = {
  getShopifyAuth,
  storeShopifyToken,
  verifyShopifyAuth,
  SHOPIFY_API_VERSION,
  SHOPIFY_API_KEY
};