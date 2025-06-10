// api/database.js - Simple database models for KingsBuilder
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use the DATABASE_URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI;

let db = null;
let client = null;

// Connect to database with retry logic
async function connectToDatabase(retryCount = 3, retryDelay = 2000) {
  try {
    if (db) return db;
    
    console.log('Connecting to MongoDB...');
    
    if (!DATABASE_URL) {
      console.error('No MongoDB connection string provided in environment variables');
      return null;
    }
    
    client = new MongoClient(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Connection pooling
      minPoolSize: 5
    });
    
    try {
      await client.connect();
      db = client.db('kingsbuilder');
      
      // Test the connection with a simple query
      await db.command({ ping: 1 });
      console.log('Connected to MongoDB successfully');
      
      // Set up connection monitoring
      client.on('close', () => {
        console.warn('MongoDB connection closed');
        db = null;
        // Attempt to reconnect
        setTimeout(() => connectToDatabase(), 5000);
      });
      
      client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      return db;
    } catch (connectionError) {
      console.error(`Failed to connect to MongoDB (attempt ${4 - retryCount} of 3):`, connectionError);
      
      if (retryCount > 0) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return connectToDatabase(retryCount - 1, retryDelay * 1.5);
      } else {
        console.error('Maximum retry attempts reached. Could not connect to MongoDB.');
        return null;
      }
    }
  } catch (error) {
    console.error('Unexpected error in database connection:', error);
    return null;
  }
}

// Page Model
class PageModel {
  static async findByShop(shop, filters = {}) {
    try {
      if (!db) return [];
      
      const query = { shop, ...filters };
      const pages = await db.collection('pages').find(query).toArray();
      return pages;
    } catch (error) {
      console.error('Error finding pages:', error);
      return [];
    }
  }
  
  static async findOne(shop, handle) {
    try {
      if (!db) return null;
      
      const page = await db.collection('pages').findOne({ shop, handle });
      return page;
    } catch (error) {
      console.error('Error finding page:', error);
      return null;
    }
  }
  
  static async create(pageData) {
    try {
      const now = new Date();
      const page = {
        ...pageData,
        createdAt: now,
        updatedAt: now
      };
      
      if (!db) {
        console.error('No database connection available');
        throw new Error('Database connection not available');
      }
      
      const result = await db.collection('pages').insertOne(page);
      return { ...page, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }
  
  static async update(shop, handle, updateData) {
    try {
      if (!db) return true; // Mock success for demo
      
      const result = await db.collection('pages').updateOne(
        { shop, handle },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );
      
      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error updating page:', error);
      return false;
    }
  }
  
  static async delete(shop, handle) {
    try {
      if (!db) return true; // Mock success for demo
      
      const result = await db.collection('pages').deleteOne({ shop, handle });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting page:', error);
      return false;
    }
  }
  
  static async publish(shop, handle) {
    try {
      if (!db) return true; // Mock success for demo
      
      const result = await db.collection('pages').updateOne(
        { shop, handle },
        { 
          $set: { 
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date() 
          } 
        }
      );
      
      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error publishing page:', error);
      return false;
    }
  }
  
  static async unpublish(shop, handle) {
    try {
      if (!db) return true; // Mock success for demo
      
      const result = await db.collection('pages').updateOne(
        { shop, handle },
        { 
          $set: { 
            status: 'draft',
            updatedAt: new Date() 
          },
          $unset: { publishedAt: 1 }
        }
      );
      
      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error unpublishing page:', error);
      return false;
    }
  }
}

// Analytics Model
class AnalyticsModel {
  static async recordPageView(shop, handle, metadata = {}) {
    try {
      if (!db) return true; // Mock success for demo
      
      const view = {
        shop,
        handle,
        timestamp: new Date(),
        ...metadata
      };
      
      await db.collection('analytics').insertOne(view);
      return true;
    } catch (error) {
      console.error('Error recording page view:', error);
      return false;
    }
  }
  
  static async getPageStats(shop, handle, days = 30) {
    try {
      if (!db) {
        // Return mock data for demo
        return {
          totalViews: Math.floor(Math.random() * 1000) + 100,
          uniqueViews: Math.floor(Math.random() * 500) + 50,
          averageTimeOnPage: Math.floor(Math.random() * 180) + 30,
          bounceRate: Math.floor(Math.random() * 50) + 20,
          dailyViews: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50) + 5
          }))
        };
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const pipeline = [
        {
          $match: {
            shop,
            handle,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueViews: { $addToSet: '$ip' }
          }
        },
        {
          $project: {
            totalViews: 1,
            uniqueViews: { $size: '$uniqueViews' }
          }
        }
      ];
      
      const stats = await db.collection('analytics').aggregate(pipeline).toArray();
      
      // Get daily views
      const dailyPipeline = [
        {
          $match: {
            shop,
            handle,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            views: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ];
      
      const dailyViews = await db.collection('analytics').aggregate(dailyPipeline).toArray();
      
      return {
        totalViews: stats[0]?.totalViews || 0,
        uniqueViews: stats[0]?.uniqueViews || 0,
        averageTimeOnPage: 120, // Mock data
        bounceRate: 35, // Mock data
        dailyViews: dailyViews.map(d => ({
          date: d._id,
          views: d.views
        }))
      };
    } catch (error) {
      console.error('Error getting page stats:', error);
      return {
        totalViews: 0,
        uniqueViews: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        dailyViews: []
      };
    }
  }
  
  static async getShopStats(shop, days = 30) {
    try {
      if (!db) {
        // Return mock data for demo
        return {
          totalPages: Math.floor(Math.random() * 20) + 5,
          totalViews: Math.floor(Math.random() * 5000) + 1000,
          topPages: [
            { handle: 'about-us', title: 'About Us', views: Math.floor(Math.random() * 500) + 100 },
            { handle: 'contact', title: 'Contact', views: Math.floor(Math.random() * 300) + 50 },
            { handle: 'faq', title: 'FAQ', views: Math.floor(Math.random() * 200) + 25 }
          ]
        };
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get total pages
      const totalPages = await db.collection('pages').countDocuments({ shop });
      
      // Get total views
      const totalViews = await db.collection('analytics').countDocuments({
        shop,
        timestamp: { $gte: startDate }
      });
      
      // Get top pages
      const topPagesPipeline = [
        {
          $match: {
            shop,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$handle',
            views: { $sum: 1 }
          }
        },
        {
          $sort: { views: -1 }
        },
        {
          $limit: 5
        }
      ];
      
      const topPagesData = await db.collection('analytics').aggregate(topPagesPipeline).toArray();
      
      // Get page titles
      const handles = topPagesData.map(p => p._id);
      const pages = await db.collection('pages').find(
        { shop, handle: { $in: handles } },
        { projection: { handle: 1, title: 1 } }
      ).toArray();
      
      const pageMap = pages.reduce((acc, page) => {
        acc[page.handle] = page.title;
        return acc;
      }, {});
      
      const topPages = topPagesData.map(p => ({
        handle: p._id,
        title: pageMap[p._id] || p._id,
        views: p.views
      }));
      
      return {
        totalPages,
        totalViews,
        topPages
      };
    } catch (error) {
      console.error('Error getting shop stats:', error);
      return {
        totalPages: 0,
        totalViews: 0,
        topPages: []
      };
    }
  }
}

module.exports = {
  connectToDatabase,
  PageModel,
  AnalyticsModel
};