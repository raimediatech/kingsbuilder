const axios = require('axios');
// Temporarily comment out to fix startup issue
// const { makeApiRequest } = require('./utils/api-helpers');
// const { getAccessToken } = require('./utils/session');

// Load environment variables
try {
  require('dotenv').config();
  console.log('Environment variables loaded in shopify.js');
} catch (error) {
  console.log('No .env file found in shopify.js, using environment variables from the system');
}

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '128d69fb5441ba3eda3ae4694c71b175';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_API_VERSION = '2023-10';

/**
 * Create a new page in Shopify
 */
async function createShopifyPage(shop, accessToken, pageData) {
  try {
    // If no access token provided, throw error
    if (!accessToken) {
      throw new Error('No access token available for this shop');
    }
    
    const response = await axios({
      method: 'POST',
      url: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/pages.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      data: {
        page: {
          title: pageData.title,
          body_html: pageData.content,
          handle: pageData.handle,
          published: pageData.published
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating Shopify page:', error.message);
    throw error;
  }
}

/**
 * Update an existing page in Shopify
 */
async function updateShopifyPage(shop, accessToken, pageId, pageData) {
  try {
    // If no access token provided, throw error
    if (!accessToken) {
      throw new Error('No access token available for this shop');
    }
    
    const response = await axios({
      method: 'PUT',
      url: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/pages/${pageId}.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      data: {
        page: {
          id: pageId,
          title: pageData.title,
          body_html: pageData.content,
          handle: pageData.handle,
          published: pageData.published
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating Shopify page:', error.message);
    throw error;
  }
}

/**
 * Get a list of pages from Shopify
 */
async function getShopifyPages(shop, accessToken) {
  try {
    // If no access token provided, throw error
    if (!accessToken) {
      throw new Error('No access token available for this shop');
    }
    
    const response = await axios({
      method: 'GET',
      url: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/pages.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Shopify pages:', error.message);
    throw error;
  }
}

/**
 * Get a single page from Shopify by ID
 */
async function getShopifyPageById(shop, accessToken, pageId) {
  try {
    // If no access token provided, throw error
    if (!accessToken) {
      throw new Error('No access token available for this shop');
    }
    
    const response = await axios({
      method: 'GET',
      url: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/pages/${pageId}.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Shopify page:', error.message);
    throw error;
  }
}

/**
 * Delete a page from Shopify
 */
async function deleteShopifyPage(shop, accessToken, pageId) {
  try {
    // If no access token provided, throw error
    if (!accessToken) {
      throw new Error('No access token available for this shop');
    }
    
    const response = await axios({
      method: 'DELETE',
      url: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/pages/${pageId}.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting Shopify page:', error.message);
    throw error;
  }
}

module.exports = {
  createShopifyPage,
  updateShopifyPage,
  getShopifyPages,
  getShopifyPageById,
  deleteShopifyPage
};