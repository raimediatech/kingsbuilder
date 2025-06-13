// api/routes/settings.js - Settings routes
const express = require('express');
const router = express.Router();

// Settings home page
router.get('/', async (req, res) => {
  try {
    // Get shop from various possible sources
    const shop = req.query.shop || req.shopifyShop || req.headers['x-shopify-shop-domain'] || req.cookies?.shopOrigin;
    
    // Set security headers for Shopify iframe embedding
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.myshopify.com https://*.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;"
    );

    // Remove X-Frame-Options as it's deprecated and causing issues
    res.removeHeader('X-Frame-Options');

    // Render the settings page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder Settings</title>
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

          .form-group {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .form-control {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 14px;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
          }

          .form-check {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }

          .form-check-input {
            margin-right: 10px;
          }

          .form-text {
            font-size: 12px;
            color: var(--text-color);
            opacity: 0.7;
            margin-top: 5px;
          }

          .settings-tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
          }

          .settings-tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-weight: 500;
          }

          .settings-tab.active {
            border-bottom-color: var(--primary-color);
            color: var(--primary-color);
          }

          .tab-content {
            display: none;
          }

          .tab-content.active {
            display: block;
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
                <a href="/pages?shop=${shop}" class="nav-link">
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
                <a href="/settings?shop=${shop}" class="nav-link active">
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
              <h2>Settings</h2>
              <div style="display: flex; align-items: center;">
                <button id="theme-toggle" class="theme-toggle">
                  <i class="fas fa-moon"></i>
                </button>
                <button id="save-settings" class="btn">
                  <i class="fas fa-save"></i>
                  Save Settings
                </button>
              </div>
            </div>

            <div class="settings-tabs">
              <div class="settings-tab active" data-tab="general">General</div>
              <div class="settings-tab" data-tab="appearance">Appearance</div>
              <div class="settings-tab" data-tab="advanced">Advanced</div>
            </div>

            <div class="card">
              <div id="general-tab" class="tab-content active">
                <div class="form-group">
                  <label class="form-label">Store Name</label>
                  <input type="text" class="form-control" value="${shop}" disabled>
                  <small class="form-text">This is your Shopify store name.</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Default Page Title</label>
                  <input type="text" class="form-control" placeholder="Enter default page title">
                  <small class="form-text">This title will be used for new pages if no title is specified.</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Default Meta Description</label>
                  <textarea class="form-control" rows="3" placeholder="Enter default meta description"></textarea>
                  <small class="form-text">This description will be used for SEO if no description is specified.</small>
                </div>

                <div class="form-group">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" checked>
                    Auto-publish pages
                  </label>
                  <small class="form-text">When enabled, new pages will be automatically published.</small>
                </div>
              </div>

              <div id="appearance-tab" class="tab-content">
                <div class="form-group">
                  <label class="form-label">Theme</label>
                  <select class="form-control">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                  <small class="form-text">Choose the theme for the KingsBuilder dashboard.</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Primary Color</label>
                  <input type="color" class="form-control" value="#000000">
                  <small class="form-text">This color will be used for buttons and accents.</small>
                </div>

                <div class="form-group">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" checked>
                    Show page previews
                  </label>
                  <small class="form-text">When enabled, page previews will be shown in the dashboard.</small>
                </div>
              </div>

              <div id="advanced-tab" class="tab-content">
                <div class="form-group">
                  <label class="form-label">Custom CSS</label>
                  <textarea class="form-control" rows="5" placeholder="Enter custom CSS"></textarea>
                  <small class="form-text">This CSS will be applied to all pages created with KingsBuilder.</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Custom JavaScript</label>
                  <textarea class="form-control" rows="5" placeholder="Enter custom JavaScript"></textarea>
                  <small class="form-text">This JavaScript will be applied to all pages created with KingsBuilder.</small>
                </div>

                <div class="form-group">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input">
                    Enable developer mode
                  </label>
                  <small class="form-text">When enabled, additional developer options will be available.</small>
                </div>

                <div class="form-group">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input">
                    Clear cache
                  </label>
                  <small class="form-text">Clear the KingsBuilder cache to resolve any display issues.</small>
                </div>
              </div>
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

          // Settings tabs functionality
          const tabs = document.querySelectorAll('.settings-tab');
          const tabContents = document.querySelectorAll('.tab-content');

          tabs.forEach(tab => {
            tab.addEventListener('click', () => {
              const tabId = tab.getAttribute('data-tab');
              
              // Remove active class from all tabs and contents
              tabs.forEach(t => t.classList.remove('active'));
              tabContents.forEach(c => c.classList.remove('active'));
              
              // Add active class to clicked tab and corresponding content
              tab.classList.add('active');
              document.getElementById(`${tabId}-tab`).classList.add('active');
            });
          });

          // Save settings functionality
          document.getElementById('save-settings').addEventListener('click', () => {
            alert('Settings saved successfully!');
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the settings page: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

module.exports = router;
