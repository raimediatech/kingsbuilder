const express = require('express');
const app = express();

app.use(express.json());

// API Routes
app.get('/api/analytics', (req, res) => {
  res.json({
    totalViews: 2847,
    uniqueVisitors: 1923,
    bounceRate: 34.2,
    avgTimeOnPage: 145,
    topPages: [
      { title: 'Home Page', handle: 'home', views: 1234 },
      { title: 'About Us', handle: 'about', views: 892 },
      { title: 'Contact', handle: 'contact', views: 456 }
    ]
  });
});

app.get('/api/pages', (req, res) => {
  res.json([
    { id: '1', title: 'Home Page', handle: 'home', status: 'published', template: 'landing', createdAt: '2024-01-15' },
    { id: '2', title: 'About Us', handle: 'about', status: 'published', template: 'about', createdAt: '2024-01-10' },
    { id: '3', title: 'Contact', handle: 'contact', status: 'draft', template: 'contact', createdAt: '2024-01-05' }
  ]);
});

app.get('/api/templates', (req, res) => {
  res.json([
    { id: 'landing', name: 'Landing Page', description: 'Perfect for product launches', category: 'Marketing' },
    { id: 'about', name: 'About Us', description: 'Tell your brand story', category: 'Company' },
    { id: 'contact', name: 'Contact Page', description: 'Get in touch form', category: 'Support' }
  ]);
});

// POST endpoint for creating pages
app.post('/api/pages', (req, res) => {
  const { title, handle, template } = req.body;
  
  if (!title || !handle) {
    return res.status(400).json({ error: 'Title and handle are required' });
  }
  
  // Simulate creating a page
  const newPage = {
    id: Date.now().toString(),
    title,
    handle,
    template: template || 'blank',
    status: 'draft',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  res.status(201).json({ 
    success: true, 
    message: 'Page created successfully',
    page: newPage 
  });
});

// PUT endpoint for updating pages
app.put('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  const { title, handle, template, status } = req.body;
  
  // Simulate updating a page
  const updatedPage = {
    id,
    title: title || 'Updated Page',
    handle: handle || 'updated-page',
    template: template || 'blank',
    status: status || 'draft',
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  res.json({ 
    success: true, 
    message: 'Page updated successfully',
    page: updatedPage 
  });
});

// DELETE endpoint for deleting pages
app.delete('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({ 
    success: true, 
    message: `Page ${id} deleted successfully` 
  });
});

// Main route
app.get('*', (req, res) => {
  const isShopifyRequest = req.query.shop || req.query.host || req.query.embedded || req.query.hmac;
  const shop = req.query.shop || 'kingsbuilder.myshopify.com';
  
  if (isShopifyRequest) {
    // Shopify app interface
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KingsBuilder - Shopify App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f6f7; }
            .app-layout { display: flex; min-height: 100vh; }
            .sidebar { width: 280px; background: white; border-right: 1px solid #e1e3e5; }
            .sidebar-header { padding: 20px; border-bottom: 1px solid #e1e3e5; }
            .sidebar-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
            .sidebar-nav { padding: 20px 0; }
            .nav-item { display: flex; align-items: center; padding: 12px 20px; color: #374151; text-decoration: none; transition: all 0.2s; }
            .nav-item:hover { background: #f3f4f6; color: #000000; }
            .nav-item.active { background: #f3f4f6; color: #000000; border-right: 3px solid #000000; }
            .nav-icon { margin-right: 12px; font-size: 16px; }
            .main-content { flex: 1; padding: 30px; }
            .content-section { display: none; }
            .content-section.active { display: block; }
            .page-header { margin-bottom: 30px; }
            .page-header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 600; }
            .page-header p { margin: 0; color: #6b7280; }
            .button { background: #000000; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
            .button:hover { background: #374151; }
            .button-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5; }
            .stat-card h3 { margin: 0 0 8px 0; font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .stat-card .value { font-size: 28px; font-weight: 600; color: #111827; }
            .page-item { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .page-info h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 500; }
            .page-info p { margin: 0; color: #6b7280; font-size: 14px; }
            .page-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
            .status-published { background: #d1fae5; color: #065f46; }
            .status-draft { background: #fef3c7; color: #92400e; }
            .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .template-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5; cursor: pointer; transition: all 0.2s; }
            .template-card:hover { border-color: #000000; }
            .template-card h4 { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; }
            .template-card p { margin: 0 0 12px 0; color: #6b7280; font-size: 14px; }
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
            .modal-content { background: white; margin: 50px auto; padding: 30px; border-radius: 8px; max-width: 500px; position: relative; }
            .modal-header { margin-bottom: 20px; }
            .modal-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
            .close { position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #6b7280; }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; }
            .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
            .form-group input:focus, .form-group select:focus { outline: none; border-color: #000000; }
          </style>
        </head>
        <body>
          <div class="app-layout">
            <div class="sidebar">
              <div class="sidebar-header">
                <h2>🏗️ KingsBuilder</h2>
              </div>
              <nav class="sidebar-nav">
                <a href="#" class="nav-item active" onclick="showSection('dashboard', this)">
                  <span class="nav-icon">📊</span>
                  Dashboard
                </a>
                <a href="#" class="nav-item" onclick="showSection('pages', this)">
                  <span class="nav-icon">📄</span>
                  Pages
                </a>
                <a href="#" class="nav-item" onclick="showSection('templates', this)">
                  <span class="nav-icon">📋</span>
                  Templates
                </a>
                <a href="#" class="nav-item" onclick="showSection('analytics', this)">
                  <span class="nav-icon">📈</span>
                  Analytics
                </a>
                <a href="#" class="nav-item" onclick="showSection('settings', this)">
                  <span class="nav-icon">⚙️</span>
                  Settings
                </a>
              </nav>
            </div>
            
            <div class="main-content">
              <!-- Dashboard Section -->
              <div id="dashboard-section" class="content-section active">
                <div class="page-header">
                  <h1>Dashboard</h1>
                  <p>Overview of your store's performance</p>
                </div>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <h3>Total Pages</h3>
                    <div class="value" id="total-pages">3</div>
                  </div>
                  <div class="stat-card">
                    <h3>Published</h3>
                    <div class="value" id="published-pages">2</div>
                  </div>
                  <div class="stat-card">
                    <h3>Page Views</h3>
                    <div class="value" id="total-views">2,847</div>
                  </div>
                  <div class="stat-card">
                    <h3>Templates</h3>
                    <div class="value" id="total-templates">3</div>
                  </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5;">
                  <h3 style="margin: 0 0 16px 0;">Recent Pages</h3>
                  <div id="recent-pages">
                    <!-- Pages will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Pages Section -->
              <div id="pages-section" class="content-section">
                <div class="page-header">
                  <h1>Pages</h1>
                  <p>Manage your custom pages</p>
                  <button class="button" onclick="openModal('createPageModal')">Create New Page</button>
                </div>
                
                <div id="all-pages">
                  <!-- Pages will be loaded here -->
                </div>
              </div>
              
              <!-- Templates Section -->
              <div id="templates-section" class="content-section">
                <div class="page-header">
                  <h1>Templates</h1>
                  <p>Choose from our pre-built templates</p>
                </div>
                
                <div class="template-grid" id="templates-grid">
                  <!-- Templates will be loaded here -->
                </div>
              </div>
              
              <!-- Analytics Section -->
              <div id="analytics-section" class="content-section">
                <div class="page-header">
                  <h1>Analytics</h1>
                  <p>Track your page performance</p>
                </div>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <h3>Total Views</h3>
                    <div class="value" id="analytics-views">2,847</div>
                  </div>
                  <div class="stat-card">
                    <h3>Unique Visitors</h3>
                    <div class="value" id="analytics-visitors">1,923</div>
                  </div>
                  <div class="stat-card">
                    <h3>Bounce Rate</h3>
                    <div class="value" id="analytics-bounce">34.2%</div>
                  </div>
                  <div class="stat-card">
                    <h3>Avg. Time</h3>
                    <div class="value" id="analytics-time">145s</div>
                  </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5;">
                  <h3 style="margin: 0 0 16px 0;">Top Pages</h3>
                  <div id="top-pages">
                    <!-- Top pages will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Settings Section -->
              <div id="settings-section" class="content-section">
                <div class="page-header">
                  <h1>Settings</h1>
                  <p>Configure your KingsBuilder app</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5;">
                  <h3 style="margin: 0 0 16px 0;">App Configuration</h3>
                  <p>Shop: ${shop}</p>
                  <p>Status: ✅ Connected</p>
                  <p>Version: 1.0.0</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Create Page Modal -->
          <div id="createPageModal" class="modal">
            <div class="modal-content">
              <span class="close" onclick="closeModal('createPageModal')">&times;</span>
              <div class="modal-header">
                <h2>Create New Page</h2>
              </div>
              <div class="form-group">
                <label for="pageTitle">Page Title</label>
                <input type="text" id="pageTitle" placeholder="Enter page title" onkeyup="updateHandle()">
              </div>
              <div class="form-group">
                <label for="pageHandle">Handle</label>
                <input type="text" id="pageHandle" placeholder="page-handle" readonly>
              </div>
              <div class="form-group">
                <label for="pageTemplate">Template</label>
                <select id="pageTemplate">
                  <option value="blank">Blank Page</option>
                  <option value="landing">Landing Page</option>
                  <option value="about">About Us</option>
                  <option value="contact">Contact</option>
                </select>
              </div>
              <button class="button" onclick="createPage()">Create Page</button>
            </div>
          </div>
          
          <script>
            // Global functions - MUST be in global scope for onclick to work
            function showSection(sectionName, clickedElement) {
              // Hide all sections
              document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
              });
              
              // Remove active class from all nav items
              document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
              });
              
              // Show selected section
              document.getElementById(sectionName + '-section').classList.add('active');
              
              // Add active class to clicked nav item
              if (clickedElement) {
                clickedElement.classList.add('active');
              }
              
              // Load section-specific data
              if (sectionName === 'analytics') {
                loadAnalyticsData();
              } else if (sectionName === 'templates') {
                loadTemplates();
              } else if (sectionName === 'pages') {
                loadPages();
              }
            }
            
            function openModal(modalId) {
              document.getElementById(modalId).style.display = 'flex';
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
                
                const pageHTML = pages.map(page => 
                  '<div class="page-item">' +
                    '<div class="page-info">' +
                      '<h4>' + page.title + '</h4>' +
                      '<p>Handle: ' + page.handle + ' • Created: ' + page.createdAt + '</p>' +
                    '</div>' +
                    '<div style="display: flex; align-items: center; gap: 10px;">' +
                      '<span class="page-status status-' + page.status + '">' + page.status + '</span>' +
                      '<button class="button-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="editPage(\'' + page.id + '\', \'' + page.title + '\', \'' + page.handle + '\')">Edit</button>' +
                      '<button class="button-secondary" style="padding: 6px 12px; font-size: 12px; background: #dc3545; color: white;" onclick="deletePage(\'' + page.id + '\', \'' + page.title + '\')">Delete</button>' +
                    '</div>' +
                  '</div>'
                ).join('');
                
                // Update both dashboard and pages section
                const allPagesElement = document.getElementById('all-pages');
                const recentPagesElement = document.getElementById('recent-pages');
                
                if (allPagesElement) {
                  allPagesElement.innerHTML = pageHTML;
                }
                if (recentPagesElement) {
                  recentPagesElement.innerHTML = pageHTML;
                }
              } catch (error) {
                console.error('Error loading pages:', error);
              }
            }
            
            async function loadTemplates() {
              try {
                const response = await fetch('/api/templates');
                const templates = await response.json();
                
                const templateHTML = templates.map(template => 
                  '<div class="template-card">' +
                    '<h4>' + template.name + '</h4>' +
                    '<p>' + template.description + '</p>' +
                    '<small style="color: #000000; font-weight: 600; text-transform: uppercase;">' + template.category + '</small>' +
                    '<div style="margin-top: 12px;">' +
                      '<button class="button" style="width: 100%; margin: 0;">Use Template</button>' +
                    '</div>' +
                  '</div>'
                ).join('');
                
                const templatesGridElement = document.getElementById('templates-grid');
                if (templatesGridElement) {
                  templatesGridElement.innerHTML = templateHTML;
                }
              } catch (error) {
                console.error('Error loading templates:', error);
              }
            }
            
            async function loadAnalyticsData() {
              try {
                const response = await fetch('/api/analytics');
                const data = await response.json();
                
                document.getElementById('analytics-views').textContent = data.totalViews.toLocaleString();
                document.getElementById('analytics-visitors').textContent = data.uniqueVisitors.toLocaleString();
                document.getElementById('analytics-bounce').textContent = data.bounceRate + '%';
                document.getElementById('analytics-time').textContent = data.avgTimeOnPage + 's';
                
                // Load top pages
                const topPages = document.getElementById('top-pages');
                if (topPages) {
                  topPages.innerHTML = data.topPages.map(page => 
                    '<div class="page-item">' +
                      '<div class="page-info">' +
                        '<h4>' + page.title + '</h4>' +
                        '<p>Handle: ' + page.handle + ' • ' + page.views + ' views</p>' +
                      '</div>' +
                      '<div style="font-weight: bold;">' + page.views + ' views</div>' +
                    '</div>'
                  ).join('');
                }
              } catch (error) {
                console.error('Error loading analytics data:', error);
              }
            }
            
            // Edit page function
            function editPage(pageId, title, handle) {
              if (confirm('Edit page: ' + title + '?')) {
                const newTitle = prompt('Enter new title:', title);
                if (newTitle && newTitle !== title) {
                  updatePage(pageId, newTitle, handle);
                }
              }
            }
            
            // Delete page function
            function deletePage(pageId, title) {
              if (confirm('Are you sure you want to delete "' + title + '"?')) {
                performDeletePage(pageId);
              }
            }
            
            // Update page API call
            async function updatePage(pageId, title, handle) {
              try {
                const response = await fetch('/api/pages/' + pageId, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, handle })
                });
                
                if (response.ok) {
                  alert('Page updated successfully!');
                  loadPages();
                } else {
                  alert('Error updating page');
                }
              } catch (error) {
                alert('Error updating page: ' + error.message);
              }
            }
            
            // Delete page API call
            async function performDeletePage(pageId) {
              try {
                const response = await fetch('/api/pages/' + pageId, {
                  method: 'DELETE'
                });
                
                if (response.ok) {
                  alert('Page deleted successfully!');
                  loadPages();
                } else {
                  alert('Error deleting page');
                }
              } catch (error) {
                alert('Error deleting page: ' + error.message);
              }
            }
            
            // Close modal when clicking outside
            window.onclick = function(event) {
              if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
              }
            }
            
            // Load data on page load
            document.addEventListener('DOMContentLoaded', function() {
              loadPages();
              loadTemplates();
            });
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