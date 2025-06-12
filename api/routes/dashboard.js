// api/routes/dashboard.js - Dashboard routes
const express = require('express');
const router = express.Router();
const shopifyApi = require('../shopify');
const { PageModel } = require('../database');
// Temporarily comment out to fix startup issue
// const { getAccessToken } = require('../utils/session');

// Dashboard home page
router.get('/', async (req, res) => {
  try {
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Get access token from various possible sources
    const accessToken = req.headers['x-shopify-access-token'] || req.shopifyAccessToken || req.cookies?.shopifyAccessToken;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );
    
    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');
    
    // Get pages from Shopify or database
    let pages = [];
    
    if (shop && accessToken) {
      try {
        const result = await shopifyApi.getShopifyPages(shop, accessToken);
        if (result && result.pages) {
          pages = result.pages;
          console.log(`Retrieved ${pages.length} pages from Shopify`);
        }
      } catch (error) {
        console.error('Error fetching pages from Shopify:', error.message);
        // Continue with database or empty list
      }
    }
    
    // If no pages from Shopify, try database
    if (pages.length === 0 && shop) {
      try {
        pages = await PageModel.findByShop(shop);
        console.log(`Retrieved ${pages.length} pages from database`);
      } catch (dbError) {
        console.error('Error fetching pages from database:', dbError.message);
      }
    }
    
    // Render the dashboard HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          
          <script>
            // Store shop info
            window.shopOrigin = "${shop || ''}";
            
            // Function to create a new page
            async function createNewPage() {
              try {
                const title = document.getElementById('new-page-title').value;
                
                if (!title) {
                  showNotification('Please enter a page title', 'error');
                  return;
                }
                
                // Generate a handle from the title
                const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                
                const response = await fetch('/pages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Shop-Domain': window.shopOrigin
                  },
                  body: JSON.stringify({
                    title: title,
                    handle: handle,
                    content: '<p>Start building your page content here.</p>'
                  })
                });
                
                const result = await response.json();
                console.log('Create page response:', result);
                
                if (result.success) {
                  showNotification('Page created successfully!', 'success');
                  // Redirect to the builder for the new page
                  window.location.href = '/builder/' + result.page.id + '?shop=' + window.shopOrigin;
                } else {
                  showNotification('Error creating page: ' + (result.message || 'Unknown error'), 'error');
                }
              } catch (error) {
                console.error('Error creating page:', error);
                showNotification('Failed to create page. Please try again.', 'error');
              }
            }
            
            // Function to delete a page
            async function deletePage(pageId, pageTitle) {
              if (!confirm('Are you sure you want to delete "' + pageTitle + '"? This action cannot be undone.')) {
                return;
              }
              
              try {
                const response = await fetch('/pages/' + pageId, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Shop-Domain': window.shopOrigin
                  }
                });
                
                const result = await response.json();
                if (result.success) {
                  showNotification('Page deleted successfully!', 'success');
                  // Remove the page from the list
                  const pageElement = document.getElementById('page-' + pageId);
                  if (pageElement) {
                    pageElement.remove();
                  }
                } else {
                  showNotification('Error deleting page: ' + result.message, 'error');
                }
              } catch (error) {
                console.error('Error deleting page:', error);
                showNotification('Failed to delete page. Please try again.', 'error');
              }
            }
            
            // Show notification
            function showNotification(message, type = 'info') {
              const notification = document.createElement('div');
              notification.className = 'notification ' + type;
              notification.textContent = message;
              
              document.body.appendChild(notification);
              
              setTimeout(() => {
                notification.classList.add('show');
              }, 10);
              
              setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                  notification.remove();
                }, 300);
              }, 3000);
            }
          </script>
          
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            
            .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
            
            .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .dashboard-title { margin: 0; font-size: 24px; font-weight: 600; color: #111827; }
            
            .create-page-btn { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; }
            .create-page-btn:hover { background: #4f46e5; }
            
            .pages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            
            .page-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.2s; }
            .page-card:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); transform: translateY(-2px); }
            
            .page-header { padding: 20px; border-bottom: 1px solid #e1e3e5; }
            .page-title { margin: 0; font-size: 18px; font-weight: 600; color: #111827; }
            .page-meta { display: flex; justify-content: space-between; margin-top: 10px; }
            .page-date { font-size: 12px; color: #6b7280; }
            .page-status { font-size: 12px; padding: 2px 8px; border-radius: 12px; }
            .page-status.published { background: #d1fae5; color: #065f46; }
            .page-status.draft { background: #f3f4f6; color: #6b7280; }
            
            .page-content { padding: 20px; }
            .page-preview { height: 100px; overflow: hidden; margin-bottom: 20px; color: #6b7280; font-size: 14px; }
            
            .page-actions { display: flex; gap: 10px; }
            .page-action-btn { flex: 1; padding: 8px 0; text-align: center; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
            .page-action-btn.edit { background: #6366f1; color: white; }
            .page-action-btn.delete { background: #fee2e2; color: #ef4444; }
            .page-action-btn.edit:hover { background: #4f46e5; }
            .page-action-btn.delete:hover { background: #fecaca; }
            
            .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .empty-state h2 { margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #111827; }
            .empty-state p { margin: 0 0 20px 0; color: #6b7280; }
            
            .create-page-form { margin-top: 30px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
            .form-title { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827; }
            .form-row { margin-bottom: 20px; }
            .form-row label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
            .form-row input { width: 100%; padding: 10px 12px; border: 1px solid #e1e3e5; border-radius: 6px; font-size: 14px; }
            .form-row input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
            .form-actions { display: flex; justify-content: flex-end; }
            
            .notification { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; background: #1e1e2e; color: white; transform: translateY(100px); opacity: 0; transition: all 0.3s; z-index: 1000; }
            .notification.show { transform: translateY(0); opacity: 1; }
            .notification.success { background: #10b981; }
            .notification.error { background: #ef4444; }
            .notification.info { background: #3b82f6; }
            
            /* Modal */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
            .modal.show { display: flex; justify-content: center; align-items: center; }
            .modal-content { background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .modal-header { padding: 20px; border-bottom: 1px solid #e1e3e5; }
            .modal-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #111827; }
            .modal-body { padding: 20px; }
            .modal-footer { padding: 20px; border-top: 1px solid #e1e3e5; display: flex; justify-content: flex-end; gap: 10px; }
            .modal-btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
            .modal-btn.cancel { background: #f3f4f6; color: #374151; border: 1px solid #e1e3e5; }
            .modal-btn.primary { background: #6366f1; color: white; border: none; }
            .modal-btn.cancel:hover { background: #e5e7eb; }
            .modal-btn.primary:hover { background: #4f46e5; }
            
            /* Responsive */
            @media (max-width: 768px) {
              .dashboard-header { flex-direction: column; align-items: flex-start; gap: 20px; }
              .pages-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="dashboard-container">
            <div class="dashboard-header">
              <h1 class="dashboard-title">KingsBuilder Dashboard</h1>
              <button class="create-page-btn" onclick="document.getElementById('create-page-modal').classList.add('show')">+ Create New Page</button>
            </div>
            
            <div class="pages-grid">
              ${pages.length > 0 ? pages.map(page => `
                <div class="page-card" id="page-${page.id}">
                  <div class="page-header">
                    <h2 class="page-title">${page.title}</h2>
                    <div class="page-meta">
                      <span class="page-date">Updated: ${new Date(page.updated_at).toLocaleDateString()}</span>
                      <span class="page-status ${page.published ? 'published' : 'draft'}">${page.published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                  <div class="page-content">
                    <div class="page-preview">
                      ${page.body_html ? page.body_html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' : 'No content'}
                    </div>
                    <div class="page-actions">
                      <a href="/builder/${page.id}?shop=${shop}" class="page-action-btn edit">Edit</a>
                      <button class="page-action-btn delete" onclick="deletePage('${page.id}', '${page.title.replace(/'/g, "\\'")}')">Delete</button>
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="empty-state">
                  <h2>No Pages Found</h2>
                  <p>Create your first page to get started with KingsBuilder.</p>
                  <button class="create-page-btn" onclick="document.getElementById('create-page-modal').classList.add('show')">+ Create New Page</button>
                </div>
              `}
            </div>
          </div>
          
          <!-- Create Page Modal -->
          <div class="modal" id="create-page-modal">
            <div class="modal-content">
              <div class="modal-header">
                <h2>Create New Page</h2>
              </div>
              <div class="modal-body">
                <div class="form-row">
                  <label for="new-page-title">Page Title</label>
                  <input type="text" id="new-page-title" placeholder="Enter page title">
                </div>
              </div>
              <div class="modal-footer">
                <button class="modal-btn cancel" onclick="document.getElementById('create-page-modal').classList.remove('show')">Cancel</button>
                <button class="modal-btn primary" onclick="createNewPage()">Create Page</button>
              </div>
            </div>
          </div>
          
          <script>
            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
              const modal = document.getElementById('create-page-modal');
              if (event.target === modal) {
                modal.classList.remove('show');
              }
            });
            
            // Prevent form submission on enter
            document.getElementById('new-page-title').addEventListener('keydown', function(event) {
              if (event.key === 'Enter') {
                event.preventDefault();
                createNewPage();
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; text-align: center; }
            .error-container { max-width: 600px; margin: 0 auto; }
            h1 { color: #ef4444; }
            .error-message { background: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Error Loading Dashboard</h1>
            <p>There was an error loading the dashboard. Please try again or contact support if the problem persists.</p>
            <div class="error-message">
              <strong>Error:</strong> ${error.message}
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

module.exports = router;
