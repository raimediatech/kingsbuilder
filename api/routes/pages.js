// api/routes/pages.js - API routes for pages
const express = require('express');
const router = express.Router();
const shopifyApi = require('../shopify');
const { PageModel } = require('../database');
// Temporarily comment out to fix startup issue
// const { getAccessToken } = require('../utils/session');

// Get all pages for a shop
router.get('/', async (req, res) => {
  try {
    const shop = req.query.shop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop parameter is required' });
    }
    
    // Get access token
    const accessToken = req.headers['x-shopify-access-token'] || req.cookies?.shopifyAccessToken;
    
    let pages = [];
    
    // Try to get pages from Shopify
    if (accessToken) {
      try {
        const result = await shopifyApi.getShopifyPages(shop, accessToken);
        if (result && result.pages) {
          pages = result.pages;
          console.log(`Retrieved ${pages.length} pages from Shopify`);
        }
      } catch (error) {
        console.error('Error fetching pages from Shopify:', error.message);
        // Continue to try database
      }
    }
    
    // If no pages from Shopify or no access token, try database
    if (pages.length === 0) {
      try {
        pages = await PageModel.findByShop(shop);
        console.log(`Retrieved ${pages.length} pages from database`);
      } catch (dbError) {
        console.error('Error fetching pages from database:', dbError.message);
      }
    }
    
    return res.json({ success: true, pages });
  } catch (error) {
    console.error('Error in GET /pages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single page by ID
router.get('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const shop = req.query.shop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop parameter is required' });
    }
    
    // Get access token
    const accessToken = req.headers['x-shopify-access-token'] || req.cookies?.shopifyAccessToken;
    
    let page = null;
    
    // Try to get page from Shopify
    if (accessToken) {
      try {
        const result = await shopifyApi.getShopifyPageById(shop, accessToken, pageId);
        if (result && result.page) {
          page = result.page;
          console.log('Retrieved page from Shopify');
        }
      } catch (error) {
        console.error('Error fetching page from Shopify:', error.message);
        // Continue to try database
      }
    }
    
    // If no page from Shopify or no access token, try database
    if (!page) {
      try {
        page = await PageModel.findOne(shop, pageId);
        if (page) {
          console.log('Retrieved page from database');
        }
      } catch (dbError) {
        console.error('Error fetching page from database:', dbError.message);
      }
    }
    
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    return res.json({ success: true, page });
  } catch (error) {
    console.error('Error in GET /pages/:pageId:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new page
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/pages - Request body:', req.body);
    console.log('Headers:', req.headers);
    
    const shop = req.headers['x-shopify-shop-domain'] || req.query.shop || req.cookies?.shopOrigin || 'kingsbuilder.myshopify.com';
    
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop parameter is required' });
    }
    
    console.log('Creating page for shop:', shop);
    
    const { title, content, handle, published = false } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    // Get access token
    const accessToken = req.headers['x-shopify-access-token'] || req.cookies?.shopifyAccessToken;
    console.log('Access token available:', !!accessToken);
    
    let page = null;
    
    // Try to create page in Shopify
    if (accessToken) {
      try {
        const pageData = {
          title,
          content: content || '<p>New page content</p>',
          handle: handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          published
        };
        
        console.log('Creating page in Shopify with data:', pageData);
        
        const result = await shopifyApi.createShopifyPage(shop, accessToken, pageData);
        
        if (result && result.page) {
          page = result.page;
          console.log('Created page in Shopify:', page.id);
          
          // Also save to database for backup
          try {
            await PageModel.create({
              shop,
              id: page.id,
              title: page.title,
              handle: page.handle,
              body_html: page.body_html,
              published: page.published,
              shopifyData: page
            });
          } catch (dbError) {
            console.error('Error saving page to database:', dbError.message);
          }
        }
      } catch (error) {
        console.error('Error creating page in Shopify:', error.message);
        // Continue to try database only
      }
    } else {
      console.log('No access token available, creating page in database only');
    }
    
    // If couldn't create in Shopify or no access token, create in database only
    if (!page) {
      try {
        const pageData = {
          shop,
          title,
          handle: handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          body_html: content || '<p>New page content</p>',
          published,
          status: published ? 'published' : 'draft',
          id: 'local_' + Date.now(), // Generate a local ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Creating page in database with data:', pageData);
        
        page = await PageModel.create(pageData);
        
        console.log('Created page in database only:', page._id);
      } catch (dbError) {
        console.error('Error creating page in database:', dbError.message);
        return res.status(500).json({ success: false, message: 'Failed to create page in database: ' + dbError.message });
      }
    }
    
    if (!page) {
      return res.status(500).json({ success: false, message: 'Failed to create page in Shopify or database' });
    }
    
    return res.json({ success: true, page });
  } catch (error) {
    console.error('Error in POST /pages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update a page
router.put('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const shop = req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop header is required' });
    }
    
    const { title, content, handle, published } = req.body;
    
    // Get access token
    const accessToken = req.headers['x-shopify-access-token'] || req.cookies?.shopifyAccessToken;
    
    let updated = false;
    
    // Try to update page in Shopify
    if (accessToken) {
      try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (handle !== undefined) updateData.handle = handle;
        if (published !== undefined) updateData.published = published;
        
        const result = await shopifyApi.updateShopifyPage(shop, accessToken, pageId, updateData);
        
        if (result && result.page) {
          updated = true;
          console.log('Updated page in Shopify');
          
          // Also update in database for backup
          try {
            const dbUpdateData = {};
            if (title !== undefined) dbUpdateData.title = title;
            if (content !== undefined) dbUpdateData.body_html = content;
            if (handle !== undefined) dbUpdateData.handle = handle;
            if (published !== undefined) {
              dbUpdateData.published = published;
              dbUpdateData.status = published ? 'published' : 'draft';
            }
            
            await PageModel.update(shop, pageId, {
              ...dbUpdateData,
              shopifyData: result.page
            });
          } catch (dbError) {
            console.error('Error updating page in database:', dbError.message);
          }
        }
      } catch (error) {
        console.error('Error updating page in Shopify:', error.message);
        // Continue to try database only
      }
    }
    
    // If couldn't update in Shopify or no access token, update in database only
    if (!updated) {
      try {
        const dbUpdateData = {};
        if (title !== undefined) dbUpdateData.title = title;
        if (content !== undefined) dbUpdateData.body_html = content;
        if (handle !== undefined) dbUpdateData.handle = handle;
        if (published !== undefined) {
          dbUpdateData.published = published;
          dbUpdateData.status = published ? 'published' : 'draft';
        }
        
        updated = await PageModel.update(shop, pageId, dbUpdateData);
        
        if (updated) {
          console.log('Updated page in database only');
        } else {
          return res.status(404).json({ success: false, message: 'Page not found' });
        }
      } catch (dbError) {
        console.error('Error updating page in database:', dbError.message);
        return res.status(500).json({ success: false, message: 'Failed to update page' });
      }
    }
    
    return res.json({ success: true, message: 'Page updated successfully' });
  } catch (error) {
    console.error('Error in PUT /pages/:pageId:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a page
router.delete('/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const shop = req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop header is required' });
    }
    
    // Get access token
    const accessToken = req.headers['x-shopify-access-token'] || req.cookies?.shopifyAccessToken;
    
    let deleted = false;
    
    // Try to delete page in Shopify
    if (accessToken) {
      try {
        await shopifyApi.deleteShopifyPage(shop, accessToken, pageId);
        deleted = true;
        console.log('Deleted page from Shopify');
      } catch (error) {
        console.error('Error deleting page from Shopify:', error.message);
        // Continue to try database
      }
    }
    
    // Always delete from database
    try {
      const dbDeleted = await PageModel.delete(shop, pageId);
      if (dbDeleted) {
        deleted = true;
        console.log('Deleted page from database');
      }
    } catch (dbError) {
      console.error('Error deleting page from database:', dbError.message);
    }
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Page not found or could not be deleted' });
    }
    
    return res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /pages/:pageId:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;