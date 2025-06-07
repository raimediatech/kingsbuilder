// api/index.js - Fixed version for Shopify connection
const express = require('express');
const path = require('path');
const cors = require('cors');
const pagesRouter = require('./pages');
const templatesRouter = require('./templates');
const analyticsRouter = require('./analytics');
const { connectToDatabase } = require('./database');

// Get Shopify API key from environment variables or use a default for development
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '8e6e7c9c5c9c9c9c9c9c9c9c9c9c9c9c';

const app = express();

// Parse JSON request body
app.use(express.json());

// Enable CORS for Shopify domains
app.use(cors({
  origin: [
    'https://admin.shopify.com',
    'https://accounts.shopify.com',
    'https://shop.app',
    'https://kingsbuilder.myshopify.com',
    'https://kingsbuilder-git-main-ajay-rais-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Shopify-Access-Token']
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database connection
connectToDatabase().catch(console.error);

// Register API routers
app.use('/api/pages', pagesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/analytics', analyticsRouter);

// Handle Shopify auth callback
app.get('/auth/callback', (req, res) => {
  const shop = req.query.shop || 'kingsbuilder.myshopify.com';
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>KingsBuilder - Authentication</title>
        <script>
          // Redirect to Shopify admin with the app
          window.top.location.href = "https://admin.shopify.com/store/${shop.split('.')[0]}/apps/kingsbuilder";
        </script>
      </head>
      <body>
        <p>Authenticating with Shopify...</p>
      </body>
    </html>
  `);
});

// Handle editor route
app.get('/editor', (req, res) => {
  // Check if this is a Shopify request
  const isShopifyRequest = req.query.shop || req.query.host || req.query.hmac;
  
  if (!isShopifyRequest) {
    return res.redirect('/?error=unauthorized');
  }
  
  // Serve the editor page
  res.sendFile(path.join(__dirname, '../public/editor.html'));
});

// Handle analytics route
app.get('/analytics', (req, res) => {
  // Check if this is a Shopify request
  const isShopifyRequest = req.query.shop || req.query.host || req.query.hmac;
  
  if (!isShopifyRequest) {
    return res.redirect('/?error=unauthorized');
  }
  
  // Serve the analytics page
  res.sendFile(path.join(__dirname, '../public/analytics.html'));
});

// Handle Shopify app requests
app.get('*', (req, res) => {
  // Check if this is a Shopify request
  const isShopifyRequest = req.query.shop || req.query.host || req.query.hmac;
  const shop = req.query.shop || 'kingsbuilder.myshopify.com';
  const host = req.query.host || '';
  
  if (isShopifyRequest) {
    // Shopify app interface
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css" />
          <script src="https://unpkg.com/@shopify/app-bridge@3.7.9/umd/index.js"></script>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #202223;
              background-color: #f6f6f7;
            }
            .app-container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding: 16px 20px;
              background-color: #ffffff;
              border-bottom: 1px solid #ddd;
            }
            .logo {
              font-size: 20px;
              font-weight: bold;
              color: #2c6ecb;
            }
            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 20px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 16px;
              background-color: #2c6ecb;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              text-decoration: none;
            }
            .button:hover {
              background-color: #1a5cb8;
            }
            .page-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              color: #637381;
            }
            .empty-state h3 {
              margin-bottom: 10px;
              color: #202223;
            }
            .tabs {
              display: flex;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
            }
            .tab {
              padding: 10px 20px;
              cursor: pointer;
              border-bottom: 2px solid transparent;
            }
            .tab.active {
              border-bottom-color: #2c6ecb;
              color: #2c6ecb;
            }
            .nav-link {
              color: #637381;
              text-decoration: none;
              padding: 8px 0;
              font-weight: 500;
              position: relative;
            }
            .nav-link.active {
              color: #2c6ecb;
            }
            .nav-link.active:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 2px;
              background-color: #2c6ecb;
            }
            .nav-link:hover {
              color: #2c6ecb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KingsBuilder</div>
            <div style="display: flex; gap: 20px;">
              <a href="#" class="nav-link active" data-nav="pages">Pages</a>
              <a href="#" class="nav-link" data-nav="templates">Templates</a>
              <a href="/analytics?shop=${shop}&host=${host}" class="nav-link" data-nav="analytics">Analytics</a>
              <a href="#" class="nav-link" data-nav="settings">Settings</a>
            </div>
          </div>
          
          <div class="app-container">
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Pages</h2>
                <a href="#create-page" class="button" id="createPageBtn">Create New Page</a>
              </div>
              <p>Create and manage custom pages for your Shopify store.</p>
              
              <div style="margin-top: 20px;">
                <div class="tabs">
                  <div class="tab active" data-tab="all">All Pages</div>
                  <div class="tab" data-tab="published">Published</div>
                  <div class="tab" data-tab="drafts">Drafts</div>
                </div>
                
                <div class="empty-state" id="emptyState">
                  <h3>No pages yet</h3>
                  <p>Click "Create New Page" to build your first custom page.</p>
                </div>
                
                <div id="pagesList" style="display: none; margin-top: 20px;">
                  <!-- Pages will be loaded here -->
                </div>
                
                <div id="createPageForm" style="display: none; margin-top: 20px;">
                  <h3>Create New Page</h3>
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Page Title</label>
                    <input type="text" id="pageTitle" placeholder="Enter page title" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">URL Handle</label>
                    <div style="display: flex; align-items: center;">
                      <span style="color: #666; margin-right: 5px;">yourstore.myshopify.com/pages/</span>
                      <input type="text" id="pageHandle" placeholder="page-handle" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Template</label>
                    <select id="pageTemplate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                      <option value="blank">Blank Page</option>
                      <option value="about">About Us</option>
                      <option value="contact">Contact Page</option>
                      <option value="faq">FAQ Page</option>
                      <option value="landing">Landing Page</option>
                    </select>
                  </div>
                  
                  <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="cancelCreate" style="padding: 8px 16px; background: none; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="createPage" style="padding: 8px 16px; background-color: #2c6ecb; color: white; border: none; border-radius: 4px; cursor: pointer;">Create Page</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card" id="quickStartGuide">
              <h2>Quick Start Guide</h2>
              <p>Follow these steps to create your first custom page:</p>
              <ol>
                <li>Click "Create New Page" to start with a blank canvas or template</li>
                <li>Use the drag-and-drop editor to add and arrange elements</li>
                <li>Customize colors, fonts, and content to match your brand</li>
                <li>Preview your page to see how it will look on different devices</li>
                <li>Publish your page when you're ready to make it live</li>
              </ol>
            </div>
            
            <div class="card" id="templateGallery" style="display: none;">
              <h2>Template Gallery</h2>
              <p>Choose from our professionally designed templates to get started quickly.</p>
              
              <div id="templatesGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer;" data-template="about">
                  <div style="height: 120px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span>About Us</span>
                  </div>
                  <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0;">About Us</h4>
                    <p style="margin: 0; font-size: 14px; color: #666;">Perfect for sharing your brand story</p>
                  </div>
                </div>
                
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer;" data-template="contact">
                  <div style="height: 120px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span>Contact Page</span>
                  </div>
                  <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0;">Contact Page</h4>
                    <p style="margin: 0; font-size: 14px; color: #666;">Help customers reach you easily</p>
                  </div>
                </div>
                
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer;" data-template="faq">
                  <div style="height: 120px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span>FAQ Page</span>
                  </div>
                  <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0;">FAQ Page</h4>
                    <p style="margin: 0; font-size: 14px; color: #666;">Answer common customer questions</p>
                  </div>
                </div>
                
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer;" data-template="landing">
                  <div style="height: 120px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span>Landing Page</span>
                  </div>
                  <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0;">Landing Page</h4>
                    <p style="margin: 0; font-size: 14px; color: #666;">Perfect for product launches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Initialize AppBridge with the correct format
            const shopifyHost = "${host}";
            const shopDomain = "${shop}";
            
            if (window.shopify && window.shopify.AppBridge) {
              try {
                const app = window.shopify.AppBridge({
                  apiKey: "${SHOPIFY_API_KEY}",
                  host: shopifyHost,
                  forceRedirect: true
                });
                console.log('AppBridge initialized successfully');
              } catch (error) {
                console.error('AppBridge initialization error:', error);
              }
            } else if (shopifyHost && window.AppBridge) {
              try {
                // Alternative initialization for older AppBridge versions
                const app = window.AppBridge.createApp({
                  apiKey: "${SHOPIFY_API_KEY}",
                  host: shopifyHost
                });
                console.log('AppBridge initialized successfully (alternative method)');
              } catch (error) {
                console.error('AppBridge initialization error (alternative method):', error);
              }
            } else {
              console.warn('AppBridge not available or missing host parameter');
            }
            
            // Load pages from API
            async function loadPages() {
              try {
                const response = await fetch(`/api/pages?shop=${shopDomain}`);
                const pages = await response.json();
                
                const pagesList = document.getElementById('pagesList');
                const emptyState = document.getElementById('emptyState');
                
                if (pages.length > 0) {
                  let pagesHtml = '';
                  
                  pages.forEach(page => {
                    const editorUrl = `/editor?shop=${shopDomain}&host=${shopifyHost}&page=${page.handle}&template=${page.template}`;
                    const statusBadge = page.status === 'published' ? 
                      '<span style="background-color: #e8f5e8; color: #2e7d2e; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Published</span>' :
                      '<span style="background-color: #fff4e6; color: #b7791f; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Draft</span>';
                    
                    pagesHtml += `
                      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                          <h3 style="margin: 0 0 5px 0;">${page.title}</h3>
                          <p style="margin: 0; color: #666; font-size: 14px;">/${page.handle} ${statusBadge}</p>
                        </div>
                        <div>
                          <a href="${editorUrl}" style="padding: 8px 12px; background: none; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; cursor: pointer; display: inline-block; text-decoration: none; color: inherit;">Edit</a>
                          <button onclick="togglePageStatus('${page.handle}', '${page.status}')" style="padding: 8px 12px; background-color: #2c6ecb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ${page.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </div>
                    `;
                  });
                  
                  pagesList.innerHTML = pagesHtml;
                  pagesList.style.display = 'block';
                  emptyState.style.display = 'none';
                } else {
                  pagesList.style.display = 'none';
                  emptyState.style.display = 'block';
                }
              } catch (error) {
                console.error('Error loading pages:', error);
                // Fallback to localStorage for demo
                loadSavedPages();
              }
            }
            
            // Fallback function for localStorage
            function loadSavedPages() {
              const savedPages = JSON.parse(localStorage.getItem('kingsbuilder_pages') || '[]');
              const pagesList = document.getElementById('pagesList');
              const emptyState = document.getElementById('emptyState');
              
              if (savedPages.length > 0) {
                let pagesHtml = '';
                
                savedPages.forEach(page => {
                  const editorUrl = `/editor?shop=${shopDomain}&host=${shopifyHost}&page=${page.handle}&template=${page.template}`;
                  
                  pagesHtml += `
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <div>
                        <h3 style="margin: 0 0 5px 0;">${page.title}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">/${page.handle}</p>
                      </div>
                      <div>
                        <a href="${editorUrl}" style="padding: 8px 12px; background: none; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; cursor: pointer; display: inline-block; text-decoration: none; color: inherit;">Edit</a>
                        <button style="padding: 8px 12px; background-color: #2c6ecb; color: white; border: none; border-radius: 4px; cursor: pointer;">Publish</button>
                      </div>
                    </div>
                  `;
                });
                
                pagesList.innerHTML = pagesHtml;
                pagesList.style.display = 'block';
                emptyState.style.display = 'none';
              } else {
                pagesList.style.display = 'none';
                emptyState.style.display = 'block';
              }
            }
            
            // Toggle page status
            async function togglePageStatus(handle, currentStatus) {
              try {
                const action = currentStatus === 'published' ? 'unpublish' : 'publish';
                const response = await fetch(`/api/pages/${handle}/${action}?shop=${shopDomain}`, {
                  method: 'POST'
                });
                
                if (response.ok) {
                  loadPages(); // Reload pages
                } else {
                  alert('Failed to update page status');
                }
              } catch (error) {
                console.error('Error updating page status:', error);
                alert('Failed to update page status');
              }
            }
            
            // Make function global
            window.togglePageStatus = togglePageStatus;
            
            // Load pages on initial load
            loadPages();
            
            // App functionality
            // Handle navigation
            document.querySelectorAll('.nav-link').forEach(link => {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // In a real app, this would navigate to different sections
                const section = link.textContent.toLowerCase();
                console.log('Navigation selected:', section);
                
                // Simple mock navigation
                if (section === 'templates') {
                  document.getElementById('templateGallery').style.display = 'block';
                  document.getElementById('quickStartGuide').style.display = 'none';
                  document.getElementById('createPageForm').style.display = 'none';
                  document.getElementById('emptyState').style.display = 'none';
                  document.getElementById('pagesList').style.display = 'none';
                } else if (section === 'pages') {
                  document.getElementById('templateGallery').style.display = 'none';
                  document.getElementById('quickStartGuide').style.display = 'block';
                  document.getElementById('createPageForm').style.display = 'none';
                  
                  // Check if we have pages
                  if (document.getElementById('pagesList').innerHTML.trim()) {
                    document.getElementById('emptyState').style.display = 'none';
                    document.getElementById('pagesList').style.display = 'block';
                  } else {
                    document.getElementById('emptyState').style.display = 'block';
                    document.getElementById('pagesList').style.display = 'none';
                  }
                }
              });
            });
            
            // Handle tabs
            document.querySelectorAll('.tab').forEach(tab => {
              tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // In a real app, this would filter the pages based on the selected tab
                console.log('Tab selected:', tab.dataset.tab);
              });
            });
            
            // Template selection
            document.querySelectorAll('#templatesGrid > div').forEach(template => {
              template.addEventListener('click', () => {
                const templateId = template.dataset.template;
                document.getElementById('pageTemplate').value = templateId;
                
                // Add visual selection indicator
                document.querySelectorAll('#templatesGrid > div').forEach(t => {
                  t.style.border = '1px solid #ddd';
                });
                template.style.border = '2px solid #2c6ecb';
              });
            });
            
            // Create page button
            document.getElementById('createPageBtn').addEventListener('click', (e) => {
              e.preventDefault();
              document.getElementById('emptyState').style.display = 'none';
              document.getElementById('pagesList').style.display = 'none';
              document.getElementById('createPageForm').style.display = 'block';
              document.getElementById('quickStartGuide').style.display = 'none';
              document.getElementById('templateGallery').style.display = 'block';
            });
            
            // Cancel create page
            document.getElementById('cancelCreate').addEventListener('click', () => {
              document.getElementById('createPageForm').style.display = 'none';
              document.getElementById('emptyState').style.display = 'block';
              document.getElementById('quickStartGuide').style.display = 'block';
              document.getElementById('templateGallery').style.display = 'none';
            });
            
            // Auto-generate handle from title
            document.getElementById('pageTitle').addEventListener('input', (e) => {
              const title = e.target.value;
              const handle = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              document.getElementById('pageHandle').value = handle;
            });
            
            // Create page submission
            document.getElementById('createPage').addEventListener('click', async () => {
              const title = document.getElementById('pageTitle').value;
              const handle = document.getElementById('pageHandle').value;
              const template = document.getElementById('pageTemplate').value;
              
              if (!title || !handle) {
                alert('Please fill in all required fields');
                return;
              }
              
              try {
                // Create page via API
                const response = await fetch('/api/pages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    title,
                    handle,
                    template,
                    shop: shopDomain
                  })
                });
                
                if (response.ok) {
                  const createdPage = await response.json();
                  
                  // Create editor URL with parameters
                  const editorUrl = `/editor?shop=${shopDomain}&host=${shopifyHost}&page=${handle}&template=${template}`;
                  
                  // Show success message and redirect to editor
                  alert('Page created successfully! Redirecting to the page editor...');
                  
                  // Redirect to editor
                  window.location.href = editorUrl;
                } else {
                  const error = await response.json();
                  alert('Error creating page: ' + error.error);
                }
              } catch (error) {
                console.error('Error creating page:', error);
                
                // Fallback to localStorage for demo
                const pageData = { title, handle, template, created: new Date().toISOString() };
                const existingPages = JSON.parse(localStorage.getItem('kingsbuilder_pages') || '[]');
                existingPages.push(pageData);
                localStorage.setItem('kingsbuilder_pages', JSON.stringify(existingPages));
                
                const editorUrl = `/editor?shop=${shopDomain}&host=${shopifyHost}&page=${handle}&template=${template}`;
                alert('Page created successfully! Redirecting to the page editor...');
                window.location.href = editorUrl;
              }
            });
          </script>
        </body>
      </html>
    `);
  }
  
  // Regular landing page for non-Shopify requests
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
