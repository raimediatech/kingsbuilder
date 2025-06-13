// api/routes/templates.js - Templates routes
const express = require('express');
const router = express.Router();

// Templates home page
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

    // Render the templates page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder Templates</title>
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

          .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
          }

          .template-card {
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .template-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          .template-image {
            height: 200px;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 24px;
          }

          .template-content {
            padding: 15px;
          }

          .template-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
          }

          .template-description {
            font-size: 14px;
            color: var(--text-color);
            opacity: 0.7;
            margin-bottom: 15px;
          }

          .template-actions {
            display: flex;
            justify-content: space-between;
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

            .template-grid {
              grid-template-columns: 1fr;
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
                <a href="/templates?shop=${shop}" class="nav-link active">
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
              <h2>Templates</h2>
              <div style="display: flex; align-items: center;">
                <button id="theme-toggle" class="theme-toggle">
                  <i class="fas fa-moon"></i>
                </button>
                <a href="/templates/new?shop=${shop}" class="btn">
                  <i class="fas fa-plus"></i>
                  Create Template
                </a>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Available Templates</h3>
              </div>

              <div class="template-grid">
                <div class="template-card">
                  <div class="template-image">
                    <i class="fas fa-image"></i>
                  </div>
                  <div class="template-content">
                    <h4 class="template-title">Landing Page</h4>
                    <p class="template-description">A clean, modern landing page template with hero section and features.</p>
                    <div class="template-actions">
                      <a href="/builder/new?template=landing&shop=${shop}" class="btn btn-sm">Use Template</a>
                      <button class="btn btn-sm btn-outline">Preview</button>
                    </div>
                  </div>
                </div>

                <div class="template-card">
                  <div class="template-image">
                    <i class="fas fa-image"></i>
                  </div>
                  <div class="template-content">
                    <h4 class="template-title">About Us</h4>
                    <p class="template-description">Tell your brand story with this professional about page template.</p>
                    <div class="template-actions">
                      <a href="/builder/new?template=about&shop=${shop}" class="btn btn-sm">Use Template</a>
                      <button class="btn btn-sm btn-outline">Preview</button>
                    </div>
                  </div>
                </div>

                <div class="template-card">
                  <div class="template-image">
                    <i class="fas fa-image"></i>
                  </div>
                  <div class="template-content">
                    <h4 class="template-title">Contact</h4>
                    <p class="template-description">A contact page with form, map and business information.</p>
                    <div class="template-actions">
                      <a href="/builder/new?template=contact&shop=${shop}" class="btn btn-sm">Use Template</a>
                      <button class="btn btn-sm btn-outline">Preview</button>
                    </div>
                  </div>
                </div>

                <div class="template-card">
                  <div class="template-image">
                    <i class="fas fa-image"></i>
                  </div>
                  <div class="template-content">
                    <h4 class="template-title">FAQ</h4>
                    <p class="template-description">Answer common questions with this organized FAQ template.</p>
                    <div class="template-actions">
                      <a href="/builder/new?template=faq&shop=${shop}" class="btn btn-sm">Use Template</a>
                      <button class="btn btn-sm btn-outline">Preview</button>
                    </div>
                  </div>
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
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the templates page: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

module.exports = router;
