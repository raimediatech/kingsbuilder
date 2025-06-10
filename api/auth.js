// api/auth.js - Shopify OAuth flow
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES || 'write_products,write_content,read_content,write_themes,read_themes';
const REDIRECT_URI = process.env.SHOPIFY_APP_URL ? `${process.env.SHOPIFY_APP_URL}/api/auth/callback` : 'https://kingsbuilder.vercel.app/api/auth/callback';

// Start OAuth flow
router.get('/', (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-shop.myshopify.com to the URL.');
  }
  
  // Generate a nonce for security
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Store nonce in cookie for verification
  res.cookie('shopify_nonce', nonce, { 
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'none'
  });
  
  // Construct the authorization URL
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${nonce}`;
  
  console.log('Redirecting to Shopify OAuth:', authUrl);
  res.redirect(authUrl);
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const { shop, code, state } = req.query;
  const storedNonce = req.cookies.shopify_nonce;
  
  console.log('OAuth callback received:', { shop, code: code ? 'present' : 'missing', state });
  
  // Validate the request
  if (!shop || !code) {
    return res.status(400).send('Missing required parameters');
  }
  
  // Verify the state/nonce if available
  if (state && storedNonce && state !== storedNonce) {
    return res.status(403).send('Security check failed. Invalid state parameter.');
  }
  
  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios({
      method: 'POST',
      url: `https://${shop}/admin/oauth/access_token`,
      data: {
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      throw new Error('No access token received from Shopify');
    }
    
    console.log('Access token obtained successfully');
    
    // Store the access token in a secure cookie
    res.cookie('shopifyAccessToken', access_token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Store the shop in a cookie
    res.cookie('shopOrigin', shop, {
      httpOnly: false, // Needs to be accessible from JavaScript
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Redirect to the app
    res.redirect(`/dashboard?shop=${shop}`);
  } catch (error) {
    console.error('Error exchanging code for access token:', error.message);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

module.exports = router;