/**
 * Client-side utility functions for interacting with the Shopify API
 */

// Function to create a new page
export async function createPage(shop: string, accessToken: string, pageData: any) {
  try {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(pageData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create page: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}

// Function to update a page
export async function updatePage(shop: string, accessToken: string, pageId: string, pageData: any) {
  try {
    const response = await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(pageData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update page: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}

// Function to get all pages
export async function getPages(shop: string, accessToken: string) {
  try {
    const response = await fetch('/api/pages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get pages: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting pages:', error);
    throw error;
  }
}

// Function to get a single page
export async function getPage(shop: string, accessToken: string, pageId: string) {
  try {
    const response = await fetch(`/api/pages?id=${pageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get page: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting page:', error);
    throw error;
  }
}

// Function to delete a page
export async function deletePage(shop: string, accessToken: string, pageId: string) {
  try {
    const response = await fetch(`/api/pages/${pageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete page: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
}