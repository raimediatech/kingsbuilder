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
    totalViews: 2847, 
    totalPages: 3, 
    publishedPages: 2,
    draftPages: 1,
    uniqueVisitors: 1923,
    bounceRate: 32.5,
    avgTimeOnPage: 145,
    topPages: [
      { handle: 'about-us', title: 'About Us', views: 1456, visitors: 892, bounceRate: 28.3 },
      { handle: 'faq', title: 'FAQ', views: 834, visitors: 623, bounceRate: 35.7 },
      { handle: 'contact', title: 'Contact', views: 557, visitors: 408, bounceRate: 41.2 }
    ],
    trafficSources: [
      { source: 'Direct', visits: 1234, percentage: 43.4 },
      { source: 'Google Search', visits: 892, percentage: 31.3 },
      { source: 'Social Media', visits: 456, percentage: 16.0 },
      { source: 'Email', visits: 265, percentage: 9.3 }
    ],
    pageViewsOverTime: [
      { date: '2024-01-01', views: 234 },
      { date: '2024-01-02', views: 345 },
      { date: '2024-01-03', views: 456 },
      { date: '2024-01-04', views: 567 },
      { date: '2024-01-05', views: 432 },
      { date: '2024-01-06', views: 543 },
      { date: '2024-01-07', views: 270 }
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
            .app-layout { display: flex; min-height: 100vh; }
            .sidebar { width: 250px; background: #ffffff; border-right: 1px solid #e1e3e5; box-shadow: 2px 0 4px rgba(0,0,0,0.1); }
            .sidebar-header { padding: 24px 20px; border-bottom: 1px solid #e1e3e5; }
            .sidebar-header h2 { margin: 0; color: #2c6ecb; font-size: 1.5rem; }
            .sidebar-nav { padding: 20px 0; }
            .nav-item { display: flex; align-items: center; padding: 12px 20px; color: #374151; text-decoration: none; transition: all 0.2s; }
            .nav-item:hover { background: #f3f4f6; color: #2c6ecb; }
            .nav-item.active { background: #eff6ff; color: #2c6ecb; border-right: 3px solid #2c6ecb; }
            .nav-icon { margin-right: 12px; font-size: 1.1rem; }
            .main-content { flex: 1; padding: 24px; overflow-y: auto; }
            .content-section { display: none; }
            .content-section.active { display: block; }
            .page-header { margin-bottom: 24px; }
            .page-header h1 { margin: 0 0 8px 0; font-size: 2rem; color: #1f2937; }
            .page-header p { margin: 0; color: #6b7280; }
            .stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
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
          <div class="app-layout">
            <!-- Sidebar Navigation -->
            <div class="sidebar">
              <div class="sidebar-header">
                <h2>🏗️ KingsBuilder</h2>
              </div>
              <nav class="sidebar-nav">
                <a href="#" class="nav-item active" onclick="showSection('dashboard')">
                  <span class="nav-icon">📊</span>
                  Dashboard
                </a>
                <a href="#" class="nav-item" onclick="showSection('pages')">
                  <span class="nav-icon">📄</span>
                  Pages
                </a>
                <a href="#" class="nav-item" onclick="showSection('templates')">
                  <span class="nav-icon">📋</span>
                  Templates
                </a>
                <a href="#" class="nav-item" onclick="showSection('analytics')">
                  <span class="nav-icon">📈</span>
                  Analytics
                </a>
                <a href="#" class="nav-item" onclick="showSection('settings')">
                  <span class="nav-icon">⚙️</span>
                  Settings
                </a>
              </nav>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
              <!-- Dashboard Section -->
              <div id="dashboard-section" class="content-section active">
                <div class="page-header">
                  <h1>Dashboard</h1>
                  <p>Welcome to KingsBuilder - Your Shopify Page Builder</p>
                </div>
                
                <div class="stats-overview">
                  <div class="stat-card">
                    <div class="stat-number" id="total-pages">0</div>
                    <div class="stat-label">Total Pages</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="published-pages">0</div>
                    <div class="stat-label">Published</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="draft-pages">0</div>
                    <div class="stat-label">Drafts</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="total-views">0</div>
                    <div class="stat-label">Total Views</div>
                  </div>
                </div>
                
                <div class="card">
                  <h3>Quick Actions</h3>
                  <button class="button" onclick="showCreatePageModal()">+ Create New Page</button>
                  <button class="button" onclick="showSection('templates')">Browse Templates</button>
                  <button class="button" onclick="showSection('analytics')">View Analytics</button>
                </div>
                
                <div class="card">
                  <h3>Recent Pages</h3>
                  <div id="recent-pages">
                    <!-- Recent pages will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Pages Section -->
              <div id="pages-section" class="content-section">
                <div class="page-header">
                  <h1>Pages</h1>
                  <button class="button" onclick="showCreatePageModal()">+ Create New Page</button>
                </div>
                
                <div class="card">
                  <div id="all-pages">
                    <!-- All pages will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Templates Section -->
              <div id="templates-section" class="content-section">
                <div class="page-header">
                  <h1>Templates</h1>
                  <p>Choose from our professionally designed templates</p>
                </div>
                
                <div class="templates-grid" id="templates-list">
                  <!-- Templates will be loaded here -->
                </div>
              </div>
              
              <!-- Analytics Section -->
              <div id="analytics-section" class="content-section">
                <div class="page-header">
                  <h1>Analytics</h1>
                  <p>Track your page performance</p>
                </div>
                
                <div class="stats-overview">
                  <div class="stat-card">
                    <div class="stat-number" id="analytics-views">0</div>
                    <div class="stat-label">Total Page Views</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="analytics-visitors">0</div>
                    <div class="stat-label">Unique Visitors</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="analytics-bounce">0%</div>
                    <div class="stat-label">Bounce Rate</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number" id="analytics-time">0s</div>
                    <div class="stat-label">Avg. Time on Page</div>
                  </div>
                </div>
                
                <div class="card">
                  <h3>Top Performing Pages</h3>
                  <div id="top-pages">
                    <!-- Top pages will be loaded here -->
                  </div>
                </div>
                
                <div class="card">
                  <h3>Traffic Sources</h3>
                  <div id="traffic-sources">
                    <!-- Traffic sources will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Settings Section -->
              <div id="settings-section" class="content-section">
                <div class="page-header">
                  <h1>Settings</h1>
                  <p>Configure your KingsBuilder app</p>
                </div>
                
                <div class="card">
                  <h3>App Configuration</h3>
                  <div class="form-group">
                    <label>Shop Domain:</label>
                    <input type="text" value="${shop}" readonly>
                  </div>
                  <div class="form-group">
                    <label>App Status:</label>
                    <span class="status">✅ Connected</span>
                  </div>
                  <div class="form-group">
                    <label>Version:</label>
                    <span>1.0.0</span>
                  </div>
                </div>
                
                <div class="card">
                  <h3>Page Settings</h3>
                  <div class="form-group">
                    <label>
                      <input type="checkbox" checked> Auto-publish pages
                    </label>
                  </div>
                  <div class="form-group">
                    <label>
                      <input type="checkbox" checked> Enable analytics tracking
                    </label>
                  </div>
                  <div class="form-group">
                    <label>
                      <input type="checkbox"> Enable SEO optimization
                    </label>
                  </div>
                  <button class="button">Save Settings</button>
                </div>
              </div>
            </div>
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
            // Load data on page load
            document.addEventListener('DOMContentLoaded', function() {
              loadDashboardData();
              loadPages();
              loadTemplates();
            });
            
            function showSection(sectionName) {
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
              event.target.classList.add('active');
              
              // Load section-specific data
              if (sectionName === 'analytics') {
                loadAnalyticsData();
              } else if (sectionName === 'templates') {
                loadTemplates();
              } else if (sectionName === 'pages') {
                loadPages();
              }
            }
            
            async function loadDashboardData() {
              try {
                const response = await fetch('/api/analytics/overview');
                const data = await response.json();
                
                document.getElementById('total-pages').textContent = data.totalPages;
                document.getElementById('published-pages').textContent = data.publishedPages;
                document.getElementById('draft-pages').textContent = data.draftPages;
                document.getElementById('total-views').textContent = data.totalViews.toLocaleString();
                
                // Load recent pages
                const recentPages = document.getElementById('recent-pages');
                recentPages.innerHTML = data.topPages.slice(0, 3).map(page => \`
                  <div class="page-item">
                    <div class="page-info">
                      <h4>\${page.title}</h4>
                      <p>Handle: \${page.handle} • \${page.views} views</p>
                    </div>
                    <span style="color: #2c6ecb; font-weight: bold;">\${page.views} views</span>
                  </div>
                \`).join('');
              } catch (error) {
                console.error('Error loading dashboard data:', error);
              }
            }
            
            function showCreatePageModal() {
              document.getElementById('createPageModal').style.display = 'flex';
            }
            
            async function loadAnalyticsData() {
              try {
                const response = await fetch('/api/analytics/overview');
                const data = await response.json();
                
                document.getElementById('analytics-views').textContent = data.totalViews.toLocaleString();
                document.getElementById('analytics-visitors').textContent = data.uniqueVisitors.toLocaleString();
                document.getElementById('analytics-bounce').textContent = data.bounceRate + '%';
                document.getElementById('analytics-time').textContent = data.avgTimeOnPage + 's';
                
                // Load top pages
                const topPages = document.getElementById('top-pages');
                topPages.innerHTML = data.topPages.map(page => \`
                  <div class="page-item">
                    <div class="page-info">
                      <h4>\${page.title}</h4>
                      <p>Handle: \${page.handle} • Bounce Rate: \${page.bounceRate}%</p>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: bold; color: #2c6ecb;">\${page.views} views</div>
                      <div style="font-size: 12px; color: #6b7280;">\${page.visitors} visitors</div>
                    </div>
                  </div>
                \`).join('');
                
                // Load traffic sources
                const trafficSources = document.getElementById('traffic-sources');
                trafficSources.innerHTML = data.trafficSources.map(source => \`
                  <div class="page-item">
                    <div class="page-info">
                      <h4>\${source.source}</h4>
                      <p>\${source.visits} visits</p>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: bold; color: #2c6ecb;">\${source.percentage}%</div>
                    </div>
                  </div>
                \`).join('');
              } catch (error) {
                console.error('Error loading analytics data:', error);
              }
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
                  loadDashboardData();
                  
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
                
                const pageHTML = pages.map(page => \`
                  <div class="page-item">
                    <div class="page-info">
                      <h4>\${page.title}</h4>
                      <p>Handle: \${page.handle} • Created: \${page.createdAt}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span class="page-status status-\${page.status}">\${page.status}</span>
                      <button class="button-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button>
                    </div>
                  </div>
                \`).join('');
                
                // Update both dashboard and pages section
                const allPagesElement = document.getElementById('all-pages');
                if (allPagesElement) {
                  allPagesElement.innerHTML = pageHTML;
                }
                
                const pagesListElement = document.getElementById('pagesList');
                if (pagesListElement) {
                  pagesListElement.innerHTML = pageHTML;
                }
              } catch (error) {
                console.error('Error loading pages:', error);
              }
            }
            
            async function loadTemplates() {
              try {
                const response = await fetch('/api/templates');
                const templates = await response.json();
                
                const templateHTML = templates.map(template => \`
                  <div class="template-card" onclick="selectTemplate('\${template.id}')">
                    <h4>\${template.name}</h4>
                    <p>\${template.description}</p>
                    <small style="color: #2c6ecb; font-weight: 600; text-transform: uppercase;">\${template.category}</small>
                    <div style="margin-top: 12px;">
                      <button class="button" style="width: 100%; margin: 0;">Use Template</button>
                    </div>
                  </div>
                \`).join('');
                
                // Update both modal and templates section
                const templatesGridElement = document.getElementById('templatesGrid');
                if (templatesGridElement) {
                  templatesGridElement.innerHTML = templateHTML;
                }
                
                const templatesListElement = document.getElementById('templates-list');
                if (templatesListElement) {
                  templatesListElement.innerHTML = templateHTML;
                }
              } catch (error) {
                console.error('Error loading templates:', error);
              }
            }
            
            function selectTemplate(templateId) {
              document.getElementById('pageTemplate').value = templateId;
              closeModal('templatesModal');
              showCreatePageModal();
              
              // Pre-fill template name as page title
              const templates = {
                'blank': 'New Page',
                'about': 'About Us',
                'contact': 'Contact Us',
                'faq': 'Frequently Asked Questions',
                'landing': 'Landing Page'
              };
              
              if (templates[templateId]) {
                document.getElementById('pageTitle').value = templates[templateId];
                updateHandle();
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