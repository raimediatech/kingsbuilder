import shopify from "../shopify.server";

/**
 * Utility functions for interacting with the Shopify API
 */

/**
 * Fetch products from the Shopify store
 * @param session The authenticated session
 * @param limit The number of products to fetch (default: 10)
 * @returns Array of products
 */
export async function fetchProducts(session: any, limit = 10) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    query {
      products(first: ${limit}) {
        nodes {
          id
          title
          description
          featuredImage {
            url
            altText
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          handle
        }
      }
    }
  `);

  const responseJson = await response.json();
  return responseJson.data.products.nodes;
}

/**
 * Fetch collections from the Shopify store
 * @param session The authenticated session
 * @param limit The number of collections to fetch (default: 10)
 * @returns Array of collections
 */
export async function fetchCollections(session: any, limit = 10) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    query {
      collections(first: ${limit}) {
        nodes {
          id
          title
          description
          image {
            url
            altText
          }
          handle
        }
      }
    }
  `);

  const responseJson = await response.json();
  return responseJson.data.collections.nodes;
}

/**
 * Create a new page in the Shopify store
 * @param session The authenticated session
 * @param title The page title
 * @param content The page content (HTML)
 * @param handle The page handle (URL slug)
 * @returns The created page
 */
export async function createPage(session: any, title: string, content: string, handle?: string) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    mutation {
      pageCreate(input: {
        title: "${title}",
        body: "${content.replace(/"/g, '\\"')}"
        ${handle ? `, handle: "${handle}"` : ''}
      }) {
        page {
          id
          title
          body
          handle
          url
        }
        userErrors {
          field
          message
        }
      }
    }
  `);

  const responseJson = await response.json();
  
  if (responseJson.data.pageCreate.userErrors.length > 0) {
    throw new Error(responseJson.data.pageCreate.userErrors[0].message);
  }
  
  return responseJson.data.pageCreate.page;
}

/**
 * Update an existing page in the Shopify store
 * @param session The authenticated session
 * @param id The page ID
 * @param title The page title
 * @param content The page content (HTML)
 * @returns The updated page
 */
export async function updatePage(session: any, id: string, title: string, content: string) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    mutation {
      pageUpdate(input: {
        id: "${id}",
        title: "${title}",
        body: "${content.replace(/"/g, '\\"')}"
      }) {
        page {
          id
          title
          body
          handle
          url
        }
        userErrors {
          field
          message
        }
      }
    }
  `);

  const responseJson = await response.json();
  
  if (responseJson.data.pageUpdate.userErrors.length > 0) {
    throw new Error(responseJson.data.pageUpdate.userErrors[0].message);
  }
  
  return responseJson.data.pageUpdate.page;
}

/**
 * Fetch pages from the Shopify store
 * @param session The authenticated session
 * @param limit The number of pages to fetch (default: 10)
 * @returns Array of pages
 */
export async function fetchPages(session: any, limit = 10) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    query {
      pages(first: ${limit}) {
        nodes {
          id
          title
          body
          handle
          url
          createdAt
          updatedAt
        }
      }
    }
  `);

  const responseJson = await response.json();
  return responseJson.data.pages.nodes;
}

/**
 * Delete a page from the Shopify store
 * @param session The authenticated session
 * @param id The page ID
 * @returns Boolean indicating success
 */
export async function deletePage(session: any, id: string) {
  const { admin } = await shopify.authenticate.admin(session);
  
  const response = await admin.graphql(`
    mutation {
      pageDelete(input: {
        id: "${id}"
      }) {
        deletedPageId
        userErrors {
          field
          message
        }
      }
    }
  `);

  const responseJson = await response.json();
  
  if (responseJson.data.pageDelete.userErrors.length > 0) {
    throw new Error(responseJson.data.pageDelete.userErrors[0].message);
  }
  
  return true;
}