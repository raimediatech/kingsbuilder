// api/pages.js - API for page management with database
const express = require('express');
const { PageModel, AnalyticsModel } = require('./database');
const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  try {
    const shop = req.query.shop;
    const status = req.query.status;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const filters = {};
    if (status) {
      filters.status = status;
    }
    
    const pages = await PageModel.findByShop(shop, filters);
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific page
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const page = await PageModel.findOne(shop, handle);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Record page view for analytics
    await AnalyticsModel.recordPageView(shop, handle, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new page
router.post('/', async (req, res) => {
  try {
    const { title, handle, template, shop, content, metaDescription, metaTitle } = req.body;
    
    if (!title || !handle || !shop) {
      return res.status(400).json({ error: 'Title, handle, and shop are required' });
    }
    
    // Check if handle already exists for this shop
    const existingPage = await PageModel.findOne(shop, handle);
    
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this handle already exists' });
    }
    
    const newPage = {
      title,
      handle,
      template: template || 'blank',
      shop,
      content: content || {},
      status: 'draft',
      metaDescription: metaDescription || '',
      metaTitle: metaTitle || title,
      settings: {
        seoEnabled: true,
        commentsEnabled: false,
        socialSharingEnabled: true
      }
    };
    
    const createdPage = await PageModel.create(newPage);
    res.status(201).json(createdPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a page
router.put('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const updateData = { ...req.body };
    delete updateData.shop; // Don't allow shop to be changed
    delete updateData.handle; // Don't allow handle to be changed
    delete updateData._id; // Don't allow _id to be changed
    
    const success = await PageModel.update(shop, handle, updateData);
    
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const updatedPage = await PageModel.findOne(shop, handle);
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a page
router.delete('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const success = await PageModel.delete(shop, handle);
    
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish a page
router.post('/:handle/publish', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const success = await PageModel.publish(shop, handle);
    
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const publishedPage = await PageModel.findOne(shop, handle);
    res.json(publishedPage);
  } catch (error) {
    console.error('Error publishing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unpublish a page
router.post('/:handle/unpublish', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const success = await PageModel.unpublish(shop, handle);
    
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const unpublishedPage = await PageModel.findOne(shop, handle);
    res.json(unpublishedPage);
  } catch (error) {
    console.error('Error unpublishing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get page analytics
router.get('/:handle/analytics', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    const days = parseInt(req.query.days) || 30;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const stats = await AnalyticsModel.getPageStats(shop, handle, days);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;