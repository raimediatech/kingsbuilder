/**
 * shopify-bridge.js - Bridge between Express API and Shopify Admin API
 * This file handles the connection between the Page Builder and Shopify
 */
const express = require('express');
const router = express.Router();
const shopifyApi = require('./shopify');

// Retrieve session information from cookies or headers
const getSessionInfo = (req) => {
  const shop = req.query.shop || 
               req.cookies?.shopOrigin || 
               req.headers['x-shopify-shop-domain'];
               
  const accessToken = req.cookies?.shopifyAccessToken || 
                     req.headers['x-shopify-access-token'];
  
  return { shop, accessToken };
};

// Get all pages from Shopify
router.get('/pages', async (req, res) => {
  try {
    const { shop, accessToken } = getSessionInfo(req);
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'Shop and access token are required' 
      });
    }
    
    console.log(`Fetching Shopify pages for ${shop}`);
    const result = await shopifyApi.getShopifyPages(shop, accessToken);
    
    res.json({
      success: true,
      pages: result.pages || []
    });
  } catch (error) {
    console.error('Error fetching Shopify pages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pages from Shopify',
      message: error.message 
    });
  }
});

// Get a specific page from Shopify
router.get('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop, accessToken } = getSessionInfo(req);
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'Shop and access token are required' 
      });
    }
    
    console.log(`Fetching Shopify page ${id} for ${shop}`);
    const result = await shopifyApi.getShopifyPageById(shop, accessToken, id);
    
    res.json({
      success: true,
      page: result.page || null
    });
  } catch (error) {
    console.error('Error fetching Shopify page:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch page from Shopify',
      message: error.message 
    });
  }
});

// Create a new page in Shopify
router.post('/pages', async (req, res) => {
  try {
    const { title, handle, content, published } = req.body;
    const { shop, accessToken } = getSessionInfo(req);
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'Shop and access token are required' 
      });
    }
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        message: 'Title is required' 
      });
    }
    
    console.log(`Creating Shopify page for ${shop}`);
    const result = await shopifyApi.createShopifyPage(shop, accessToken, {
      title,
      handle: handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      body_html: content || '<div>New page created with KingsBuilder</div>',
      published: published === true
    });
    
    res.status(201).json({
      success: true,
      page: result.page || null
    });
  } catch (error) {
    console.error('Error creating Shopify page:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create page in Shopify',
      message: error.message 
    });
  }
});

// Update a page in Shopify
router.put('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, handle, content, published } = req.body;
    const { shop, accessToken } = getSessionInfo(req);
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'Shop and access token are required' 
      });
    }
    
    console.log(`Updating Shopify page ${id} for ${shop}`);
    
    // Prepare the update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (handle !== undefined) updateData.handle = handle;
    if (content !== undefined) updateData.body_html = content;
    if (published !== undefined) updateData.published = published;
    
    const result = await shopifyApi.updateShopifyPage(shop, accessToken, id, updateData);
    
    res.json({
      success: true,
      page: result.page || null
    });
  } catch (error) {
    console.error('Error updating Shopify page:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update page in Shopify',
      message: error.message 
    });
  }
});

// Delete a page from Shopify
router.delete('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop, accessToken } = getSessionInfo(req);
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'Shop and access token are required' 
      });
    }
    
    console.log(`Deleting Shopify page ${id} for ${shop}`);
    await shopifyApi.deleteShopifyPage(shop, accessToken, id);
    
    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Shopify page:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete page from Shopify',
      message: error.message 
    });
  }
});

module.exports = router;