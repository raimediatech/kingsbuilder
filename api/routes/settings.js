// api/routes/settings.js - Settings routes
const express = require('express');
const router = express.Router();

// Settings page
router.get('/', (req, res) => {
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

    // Render the settings page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder - Settings</title>
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
          }

          [data-theme="dark"] {
            --primary-color: #000000;
            --primary-hover: #333333;
            --text-color: #e5e5e5;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --border-color: #333333;
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
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: var(--bg-color);
            color: var(--text-color);
            font-size: 14px;
          }

          .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
          }

          .form-text {
            font-size: 12px;
            color: var(--text-color);
            opacity: 0.7;
            margin-top: 5px;
          }

          .form-check {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }

          .form-check-input {
            margin-right: 10px;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
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
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">General Settings</h3>
              </div>

              <form id="settings-form">
                <div class="form-group">
                  <label class="form-label" for="store-name">Store Name</label>
                  <input type="text" class="form-control" id="store-name" value="${shop.split('.')[0]}">
                  <div class="form-text">This is your Shopify store name.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="default-layout">Default Page Layout</label>
                  <select class="form-control" id="default-layout">
                    <option value="standard">Standard</option>
                    <option value="full-width">Full Width</option>
                    <option value="boxed">Boxed</option>
                  </select>
                  <div class="form-text">Choose the default layout for new pages.</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Page Features</label>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="feature-seo" checked>
                    <label for="feature-seo">Enable SEO settings for pages</label>
                  </div>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="feature-analytics" checked>
                    <label for="feature-analytics">Enable analytics tracking</label>
                  </div>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="feature-comments">
                    <label for="feature-comments">Enable comments on pages</label>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn">
                    <i class="fas fa-save"></i> Save Settings
                  </button>
                </div>
              </form>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Advanced Settings</h3>
              </div>

              <form id="advanced-settings-form">
                <div class="form-group">
                  <label class="form-label" for="custom-css">Custom CSS</label>
                  <textarea class="form-control" id="custom-css" rows="5" placeholder="Enter custom CSS here"></textarea>
                  <div class="form-text">Add custom CSS to be applied to all your pages.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="custom-js">Custom JavaScript</label>
                  <textarea class="form-control" id="custom-js" rows="5" placeholder="Enter custom JavaScript here"></textarea>
                  <div class="form-text">Add custom JavaScript to be applied to all your pages.</div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn">
                    <i class="fas fa-save"></i> Save Advanced Settings
                  </button>
                </div>
              </form>
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

          // Form submission
          document.getElementById('settings-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Settings saved successfully!');
          });

          document.getElementById('advanced-settings-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Advanced settings saved successfully!');
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the settings: ${error.message}</p>
    `);
  }
});

module.exports = router;
