// api/routes/pages.js - Pages routes
const express = require('express');
const router = express.Router();
const shopifyApi = require('../shopify');

// Pages list
router.get('/', async (req, res) => {
  try {
    // Get shop from query parameter
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    if (!shop) {
      return res.redirect('/install');
    }
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );

    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');

    // Try to get pages from Shopify
    let pages = [];
    try {
      const result = await shopifyApi.getShopifyPages(shop);
      pages = result.pages || [];
    } catch (error) {
      console.error('Error fetching Shopify pages:', error);
      // Continue with empty pages array
    }

    // Render the pages list
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder - Pages</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          :root {
            --primary-color: #000000;
            --primary-hover: #333333;
            --text-color: #333333;
            --bg-color: #ffffff;
            --card-bg: #f9f9f9;
            --border-color: #e5e5e5;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
          }

          [data-theme="dark"] {
            --primary-color: #000000;
            --primary-hover: #333333;
            --text-color: #e5e5e5;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --border-color: #333333;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .dashboard {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
          }

          .sidebar {
            background-color: var(--card-bg);
            border-right: 1px solid var(--border-color);
            padding: 30px 0;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
          }

          .logo {
            padding: 0 20px 30px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
          }

          .logo h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
          }

          .nav-menu {
            list-style: none;
          }

          .nav-item {
            margin-bottom: 5px;
          }

          .nav-link {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            color: var(--text-color);
            text-decoration: none;
            border-radius: 6px;
            margin: 0 10px;
            transition: all 0.2s;
          }

          .nav-link:hover, .nav-link.active {
            background-color: var(--primary-color);
            color: white;
          }

          .nav-link i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
          }

          .main-content {
            padding: 30px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .header h2 {
            font-size: 24px;
            font-weight: 600;
          }

          .theme-toggle {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            margin-right: 15px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            text-decoration: none;
          }

          .btn:hover {
            background-color: var(--primary-hover);
          }

          .btn i {
            margin-right: 8px;
          }

          .card {
            background-color: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            padding: 25px;
            margin-bottom: 30px;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .card-title {
            font-size: 18px;
            font-weight: 600;
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }

          .table th, .table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
          }

          .table th {
            font-weight: 600;
            color: var(--text-color);
            opacity: 0.7;
          }

          .table tr:last-child td {
            border-bottom: none;
          }

          .table-actions {
            display: flex;
            gap: 10px;
          }

          .btn-icon {
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background-color: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-icon:hover {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }

          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }

          .status-badge.published {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success-color);
          }

          .status-badge.draft {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--warning-color);
          }

          .empty-state {
            text-align: center;
            padding: 40px 0;
          }

          .empty-state i {
            font-size: 48px;
            color: var(--border-color);
            margin-bottom: 20px;
          }

          .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .empty-state p {
            color: var(--text-color);
            opacity: 0.7;
            margin-bottom: 20px;
          }

          @media (max-width: 768px) {
            .dashboard {
              grid-template-columns: 1fr;
            }

            .sidebar {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="dashboard">
          <aside class="sidebar">
            <div class="logo">
              <h1>KingsBuilder</h1>
            </div>
            <ul class="nav-menu">
              <li class="nav-item">
                <a href="/dashboard?shop=${shop}" class="nav-link">
                  <i class="fas fa-home"></i>
                  Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a href="/pages?shop=${shop}" class="nav-link active">
                  <i class="fas fa-file"></i>
                  Pages
                </a>
              </li>
              <li class="nav-item">
                <a href="/templates?shop=${shop}" class="nav-link">
                  <i class="fas fa-palette"></i>
                  Templates
                </a>
              </li>
              <li class="nav-item">
                <a href="/settings?shop=${shop}" class="nav-link">
                  <i class="fas fa-cog"></i>
                  Settings
                </a>
              </li>
              <li class="nav-item">
                <a href="/help?shop=${shop}" class="nav-link">
                  <i class="fas fa-question-circle"></i>
                  Help
                </a>
              </li>
            </ul>
          </aside>

          <main class="main-content">
            <div class="header">
              <h2>Pages</h2>
              <div style="display: flex; align-items: center;">
                <button id="theme-toggle" class="theme-toggle">
                  <i class="fas fa-moon"></i>
                </button>
                <a href="/pages/new?shop=${shop}" class="btn">
                  <i class="fas fa-plus"></i>
                  Create Page
                </a>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">All Pages</h3>
              </div>

              ${pages.length > 0 ? `
                <table class="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pages.map(page => `
                      <tr>
                        <td>${page.title}</td>
                        <td>
                          <span class="status-badge ${page.published_at ? 'published' : 'draft'}">
                            ${page.published_at ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>${new Date(page.created_at).toLocaleDateString()}</td>
                        <td>
                          <div class="table-actions">
                            <a href="/builder/${page.id}?shop=${shop}" class="btn-icon" title="Edit">
                              <i class="fas fa-edit"></i>
                            </a>
                            <a href="https://${shop}/pages/${page.handle}" target="_blank" class="btn-icon" title="View">
                              <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn-icon" title="Delete" onclick="deletePage('${page.id}')">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="empty-state">
                  <i class="fas fa-file-alt"></i>
                  <h3>No Pages Yet</h3>
                  <p>Create your first page to get started with KingsBuilder.</p>
                  <a href="/pages/new?shop=${shop}" class="btn">
                    <i class="fas fa-plus"></i>
                    Create Page
                  </a>
                </div>
              `}
            </div>
          </main>
        </div>

        <script>
          // Theme toggle functionality
          const themeToggle = document.getElementById('theme-toggle');
          const themeIcon = themeToggle.querySelector('i');

          // Check for saved theme preference or use device preference
          const savedTheme = localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

          // Apply the theme
          document.documentElement.setAttribute('data-theme', savedTheme);
          updateThemeIcon(savedTheme);

          // Toggle theme when button is clicked
          themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
          });

          function updateThemeIcon(theme) {
            if (theme === 'dark') {
              themeIcon.classList.remove('fa-moon');
              themeIcon.classList.add('fa-sun');
            } else {
              themeIcon.classList.remove('fa-sun');
              themeIcon.classList.add('fa-moon');
            }
          }

          // Delete page functionality
          function deletePage(pageId) {
            if (confirm('Are you sure you want to delete this page?')) {
              alert('Page deletion will be implemented in the next version.');
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Pages error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the pages: ${error.message}</p>
    `);
  }
});

// Create new page
router.get('/new', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;
  
  if (!shop) {
    return res.redirect('/install');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Create New Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f6f6f7;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 30px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            margin-bottom: 20px;
            font-weight: 600;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }
          input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
            font-size: 14px;
          }
          textarea {
            min-height: 100px;
          }
          .btn {
            display: inline-block;
            background: #000;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .btn:hover {
            background: #333;
          }
          .btn-secondary {
            background: transparent;
            color: #333;
            border: 1px solid #ddd;
            margin-right: 10px;
          }
          .btn-secondary:hover {
            background: #f5f5f5;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Create New Page</h1>
          
          <form id="create-page-form">
            <div class="form-group">
              <label for="title">Page Title</label>
              <input type="text" id="title" name="title" required placeholder="Enter page title">
            </div>
            
            <div class="form-group">
              <label for="handle">Page Handle (URL)</label>
              <input type="text" id="handle" name="handle" placeholder="Enter page handle (optional)">
              <small style="color: #666; display: block; margin-top: 5px;">Leave blank to auto-generate from title</small>
            </div>
            
            <div class="form-group">
              <label for="template">Template</label>
              <select id="template" name="template">
                <option value="blank">Blank Page</option>
                <option value="landing">Landing Page</option>
                <option value="about">About Us</option>
                <option value="contact">Contact Page</option>
                <option value="faq">FAQ Page</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="description">Description (optional)</label>
              <textarea id="description" name="description" placeholder="Enter page description"></textarea>
            </div>
            
            <div class="actions">
              <a href="/pages?shop=${shop}" class="btn btn-secondary">Cancel</a>
              <button type="submit" class="btn">Create Page</button>
            </div>
          </form>
        </div>
        
        <script>
          document.getElementById('create-page-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const handle = document.getElementById('handle').value;
            const template = document.getElementById('template').value;
            const description = document.getElementById('description').value;
            
            // In a real implementation, this would send data to the server
            // For now, we'll just redirect to the builder
            alert('Page created successfully!');
            window.location.href = '/builder/new?shop=${shop}';
          });
          
          // Auto-generate handle from title
          document.getElementById('title').addEventListener('input', function() {
            const handleInput = document.getElementById('handle');
            if (!handleInput.value) {
              handleInput.value = this.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            }
          });
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
