// api/analytics.js - Analytics API for tracking page performance
const express = require('express');
const { AnalyticsModel, PageModel } = require('./database');
const router = express.Router();

// Get shop analytics overview
router.get('/overview', async (req, res) => {
  try {
    const shop = req.query.shop;
    const days = parseInt(req.query.days) || 30;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const [shopStats, allPages] = await Promise.all([
      AnalyticsModel.getShopStats(shop, days),
      PageModel.findByShop(shop)
    ]);
    
    const totalPages = allPages.length;
    const publishedPages = allPages.filter(page => page.status === 'published').length;
    const draftPages = allPages.filter(page => page.status === 'draft').length;
    
    // Generate chart data for the last 30 days
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      chartData.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10 // Mock data
      });
    }
    
    res.json({
      totalViews: shopStats.totalViews,
      totalPages,
      publishedPages,
      draftPages,
      topPages: shopStats.topPages,
      chartData,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed page analytics
router.get('/pages/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const shop = req.query.shop;
    const days = parseInt(req.query.days) || 30;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    const [pageStats, pageInfo] = await Promise.all([
      AnalyticsModel.getPageStats(shop, handle, days),
      PageModel.findOne(shop, handle)
    ]);
    
    if (!pageInfo) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const totalViews = pageStats.totalViews || 0;
    const averageViews = pageStats.dailyViews.length > 0 ? 
      Math.round(totalViews / pageStats.dailyViews.length) : 0;
    
    // Calculate trend (comparing first half vs second half of period)
    const dailyViews = pageStats.dailyViews || [];
    const midPoint = Math.floor(dailyViews.length / 2);
    const firstHalf = dailyViews.slice(0, midPoint);
    const secondHalf = dailyViews.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 ? 
      firstHalf.reduce((sum, stat) => sum + stat.views, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? 
      secondHalf.reduce((sum, stat) => sum + stat.views, 0) / secondHalf.length : 0;
    
    const trend = firstHalfAvg > 0 ? 
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1) : 0;
    
    res.json({
      page: {
        title: pageInfo.title,
        handle: pageInfo.handle,
        status: pageInfo.status,
        createdAt: pageInfo.createdAt,
        publishedAt: pageInfo.publishedAt
      },
      stats: {
        totalViews,
        uniqueViews: pageStats.uniqueViews || 0,
        averageViews,
        bounceRate: pageStats.bounceRate || 0,
        averageTimeOnPage: pageStats.averageTimeOnPage || 0,
        trend: parseFloat(trend),
        period: `${days} days`
      },
      chartData: dailyViews
    });
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record a custom event
router.post('/events', async (req, res) => {
  try {
    const { shop, pageHandle, eventType, eventData } = req.body;
    
    if (!shop || !pageHandle || !eventType) {
      return res.status(400).json({ 
        error: 'Shop, pageHandle, and eventType are required' 
      });
    }
    
    // For now, we'll just record it as a page view with additional data
    await AnalyticsModel.recordPageView(shop, pageHandle, {
      eventType,
      eventData,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversion funnel data
router.get('/funnel', async (req, res) => {
  try {
    const shop = req.query.shop;
    const days = parseInt(req.query.days) || 30;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    // This is a simplified funnel - in a real app you'd track more specific events
    const [allPages, shopStats] = await Promise.all([
      PageModel.findByShop(shop),
      AnalyticsModel.getShopStats(shop, days)
    ]);
    
    const totalViews = shopStats.totalViews || 0;
    const publishedPages = allPages.filter(page => page.status === 'published').length;
    
    // Mock conversion data - in a real app this would come from actual tracking
    const funnelData = [
      { stage: 'Page Views', count: totalViews, percentage: 100 },
      { stage: 'Engaged Users', count: Math.round(totalViews * 0.6), percentage: 60 },
      { stage: 'Button Clicks', count: Math.round(totalViews * 0.3), percentage: 30 },
      { stage: 'Form Submissions', count: Math.round(totalViews * 0.1), percentage: 10 }
    ];
    
    res.json({
      funnel: funnelData,
      period: `${days} days`,
      totalPages: allPages.length,
      publishedPages
    });
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;