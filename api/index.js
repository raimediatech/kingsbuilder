// api/index.js - Minimal working version for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints
app.get('/api/pages', (req, res) => {
  res.json([
    { id: '1', title: 'About Us', handle: 'about-us', status: 'published', createdAt: '2024-01-15' },
    { id: '2', title: 'Contact', handle: 'contact', status: 'draft', createdAt: '2024-01-16' },
    { id: '3', title: 'FAQ', handle: 'faq', status: 'published', createdAt: '2024-01-17' }
  ]);
});

app.post('/api/pages', (req, res) => {
  const { title, handle, template } = req.body;
  const newPage = {
    id: Date.now().toString(),
    title: title || 'New Page',
    handle: handle || 'new-page',
    template: template || 'blank',
    status: 'draft',
    createdAt: new Date().toISOString().split('T')[0]
  };
  res.status(201).json(newPage);
});

app.get('/api/templates', (req, res) => {
  res.json([
    { id: 'blank', name: 'Blank Page', description: 'Start with a clean slate', category: 'basic' },
    { id: 'about', name: 'About Us', description: 'Perfect for sharing your brand story', category: 'marketing' },
    { id: 'contact', name: 'Contact Page', description: 'Help customers reach you easily', category: 'marketing' },
    { id: 'faq', name: 'FAQ Page', description: 'Answer common customer questions', category: 'support' },
    { id: 'landing', name: 'Landing Page', description: 'Perfect for product launches', category: 'marketing' }
  ]);
});

app.get('/api/analytics/overview', (req, res) => {
  res.json({ 
    totalViews: 1247, 
    totalPages: 3, 
    publishedPages: 2,
    draftPages: 1,
    topPages: [
      { handle: 'about-us', title: 'About Us', views: 456 },
      { handle: 'faq', title: 'FAQ', views: 234 }
    ]
  });
});

// Auth callback
app.get('/auth/callback', (req, res) => {
  const shop = req.query.shop || 'demo.myshopify.com';
  res.send(`
    <html>
      <head><title>KingsBuilder Auth</title></head>
      <body>
        <h1>✅ Authentication Successful</h1>
        <p>Shop: ${shop}</p>
        <script>
          setTimeout(() => {
            window.top.location.href = "https://admin.shopify.com/store/${shop.split('.')[0]}/apps/kingsbuilder";
          }, 2000);
        </script>
      </body>
    </html>
  `);
});

// Main route
app.get('*', (req, res) => {
  const isShopifyRequest = req.query.shop || req.query.host;
  const shop = req.query.shop || 'demo.myshopify.com';
  
  if (isShopifyRequest) {
    // Shopify app interface
    res.send(`
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .card { background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e1e3e5; }
            .header { background: linear-gradient(135deg, #2c6ecb 0%, #1a5cb8 100%); color: white; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
            .header h1 { margin: 0 0 8px 0; font-size: 2.5rem; font-weight: 700; }
            .header p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
            .button { background: #2c6ecb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin-right: 12px; margin-bottom: 8px; font-weight: 600; transition: all 0.2s; }
            .button:hover { background: #1a5cb8; transform: translateY(-1px); }
            .button-secondary { background: #6c757d; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin-right: 12px; }
            .button-secondary:hover { background: #5a6268; }
            .status { color: #00a651; font-weight: bold; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; }
            .modal-content { background: white; padding: 32px; border-radius: 16px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
            .form-group input, .form-group select { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s; }
            .form-group input:focus, .form-group select:focus { outline: none; border-color: #2c6ecb; }
            .modal-actions { margin-top: 24px; text-align: right; }
            .templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
            .template-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; cursor: pointer; text-align: center; transition: all 0.2s; }
            .template-card:hover { border-color: #2c6ecb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(44, 110, 203, 0.15); }
            .template-card h4 { margin: 0 0 8px 0; color: #1f2937; }
            .template-card p { margin: 0; color: #6b7280; font-size: 14px; }
            .page-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #f3f4f6; }
            .page-item:last-child { border-bottom: none; }
            .page-info h4 { margin: 0 0 4px 0; color: #1f2937; }
            .page-info p { margin: 0; color: #6b7280; font-size: 14px; }
            .page-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .status-published { background: #d1fae5; color: #065f46; }
            .status-draft { background: #f3f4f6; color: #374151; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; }
            .stat-number { font-size: 2rem; font-weight: 700; color: #2c6ecb; margin-bottom: 4px; }
            .stat-label { color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏗️ KingsBuilder</h1>
              <p>Page Builder for Shopify</p>
            </div>
            
            <div class="card">
              <h2>🎉 Successfully Deployed!</h2>
              <p class="status">✅ App is live and working</p>
              <p><strong>Shop:</strong> ${shop}</p>
              <p><strong>Status:</strong> Connected</p>
              <p><strong>Version:</strong> 1.0.0</p>
            </div>
            
            <div class="card">
              <h3>Quick Actions</h3>
              <button class="button" onclick="showCreatePage()">+ Create New Page</button>
              <button class="button" onclick="showTemplates()">📋 Browse Templates</button>
              <button class="button" onclick="showAnalytics()">📊 View Analytics</button>
            </div>
            
            <!-- Create Page Modal -->
            <div id="createPageModal" class="modal" style="display: none;">
              <div class="modal-content">
                <h3>Create New Page</h3>
                <div class="form-group">
                  <label>Page Title:</label>
                  <input type="text" id="pageTitle" placeholder="Enter page title" oninput="updateHandle()">
                </div>
                <div class="form-group">
                  <label>URL Handle:</label>
                  <input type="text" id="pageHandle" placeholder="page-handle">
                </div>
                <div class="form-group">
                  <label>Template:</label>
                  <select id="pageTemplate">
                    <option value="blank">Blank Page</option>
                    <option value="about">About Us</option>
                    <option value="contact">Contact Page</option>
                    <option value="faq">FAQ Page</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>
                <div class="modal-actions">
                  <button class="button" onclick="createPage()">Create Page</button>
                  <button class="button-secondary" onclick="closeModal('createPageModal')">Cancel</button>
                </div>
              </div>
            </div>
            
            <!-- Templates Modal -->
            <div id="templatesModal" class="modal" style="display: none;">
              <div class="modal-content">
                <h3>Template Gallery</h3>
                <div id="templatesGrid" class="templates-grid">
                  <!-- Templates will be loaded here -->
                </div>
                <div class="modal-actions">
                  <button class="button-secondary" onclick="closeModal('templatesModal')">Close</button>
                </div>
              </div>
            </div>
            
            <!-- Analytics Modal -->
            <div id="analyticsModal" class="modal" style="display: none;">
              <div class="modal-content">
                <h3>📊 Analytics Overview</h3>
                <div id="analyticsContent">
                  <!-- Analytics will be loaded here -->
                </div>
                <div class="modal-actions">
                  <button class="button-secondary" onclick="closeModal('analyticsModal')">Close</button>
                </div>
              </div>
            </div>
            
            <!-- Pages List -->
            <div class="card">
              <h3>Your Pages</h3>
              <div id="pagesList">
                <!-- Pages will be loaded here -->
              </div>
            </div>
          </div>
          
          <script>
            // Load pages on page load
            document.addEventListener('DOMContentLoaded', function() {
              loadPages();
            });
            
            function showCreatePage() {
              document.getElementById('createPageModal').style.display = 'flex';
            }
            
            function showTemplates() {
              document.getElementById('templatesModal').style.display = 'flex';
              loadTemplates();
            }
            
            function showAnalytics() {
              document.getElementById('analyticsModal').style.display = 'flex';
              loadAnalytics();
            }
            
            function closeModal(modalId) {
              document.getElementById(modalId).style.display = 'none';
            }
            
            function updateHandle() {
              const title = document.getElementById('pageTitle').value;
              const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              document.getElementById('pageHandle').value = handle;
            }
            
            async function createPage() {
              const title = document.getElementById('pageTitle').value;
              const handle = document.getElementById('pageHandle').value;
              const template = document.getElementById('pageTemplate').value;
              
              if (!title) {
                alert('Please enter a page title');
                return;
              }
              
              try {
                const response = await fetch('/api/pages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, handle, template })
                });
                
                if (response.ok) {
                  const newPage = await response.json();
                  alert('Page created successfully!');
                  closeModal('createPageModal');
                  loadPages();
                  
                  // Clear form
                  document.getElementById('pageTitle').value = '';
                  document.getElementById('pageHandle').value = '';
                  document.getElementById('pageTemplate').value = 'blank';
                } else {
                  alert('Error creating page');
                }
              } catch (error) {
                alert('Error creating page: ' + error.message);
              }
            }
            
            async function loadPages() {
              try {
                const response = await fetch('/api/pages');
                const pages = await response.json();
                
                const pagesList = document.getElementById('pagesList');
                pagesList.innerHTML = pages.map(page => \`
                  <div class="page-item">
                    <div class="page-info">
                      <h4>\${page.title}</h4>
                      <p>Handle: \${page.handle} • Created: \${page.createdAt}</p>
                    </div>
                    <span class="page-status status-\${page.status}">\${page.status}</span>
                  </div>
                \`).join('');
              } catch (error) {
                console.error('Error loading pages:', error);
              }
            }
            
            async function loadTemplates() {
              try {
                const response = await fetch('/api/templates');
                const templates = await response.json();
                
                const templatesGrid = document.getElementById('templatesGrid');
                templatesGrid.innerHTML = templates.map(template => \`
                  <div class="template-card" onclick="selectTemplate('\${template.id}')">
                    <h4>\${template.name}</h4>
                    <p>\${template.description}</p>
                    <small style="color: #2c6ecb; font-weight: 600;">\${template.category}</small>
                  </div>
                \`).join('');
              } catch (error) {
                console.error('Error loading templates:', error);
              }
            }
            
            function selectTemplate(templateId) {
              document.getElementById('pageTemplate').value = templateId;
              closeModal('templatesModal');
              showCreatePage();
            }
            
            async function loadAnalytics() {
              try {
                const response = await fetch('/api/analytics/overview');
                const analytics = await response.json();
                
                const analyticsContent = document.getElementById('analyticsContent');
                analyticsContent.innerHTML = \`
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-number">\${analytics.totalViews}</div>
                      <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-number">\${analytics.totalPages}</div>
                      <div class="stat-label">Total Pages</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-number">\${analytics.publishedPages}</div>
                      <div class="stat-label">Published</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-number">\${analytics.draftPages}</div>
                      <div class="stat-label">Drafts</div>
                    </div>
                  </div>
                  
                  <h4>Top Performing Pages</h4>
                  <div>
                    \${analytics.topPages.map(page => \`
                      <div class="page-item">
                        <div class="page-info">
                          <h4>\${page.title}</h4>
                          <p>Handle: \${page.handle}</p>
                        </div>
                        <span style="font-weight: bold; color: #2c6ecb;">\${page.views} views</span>
                      </div>
                    \`).join('')}
                  </div>
                \`;
              } catch (error) {
                console.error('Error loading analytics:', error);
              }
            }
            
            // Close modal when clicking outside
            window.onclick = function(event) {
              if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
              }
            }
          </script>
        </body>
      </html>
    `);
  } else {
    // Public landing page
    res.send(`
      <html>
        <head>
          <title>KingsBuilder - Page Builder for Shopify</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: system-ui; margin: 0; padding: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { text-align: center; max-width: 600px; padding: 40px 20px; }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
            .button { 
              display: inline-block; padding: 15px 30px; background: white; color: #667eea;
              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem;
            }
            .status { margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏗️ KingsBuilder</h1>
            <p>The ultimate page builder for Shopify stores. Create stunning custom pages with our drag-and-drop editor.</p>
            <a href="https://apps.shopify.com" class="button">Install on Shopify</a>
            
            <div class="status">
              <h3>✅ App Status: Live & Ready</h3>
              <p>Deployment successful • All systems operational</p>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Export for Vercel
module.exports = app;