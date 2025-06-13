// api/routes/help.js - Help routes
const express = require('express');
const router = express.Router();

// Help page
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

    // Render the help page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder - Help</title>
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

          .faq-item {
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
          }

          .faq-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .faq-question {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .faq-question i {
            transition: transform 0.3s;
          }

          .faq-answer {
            display: none;
            padding: 10px 0;
            line-height: 1.6;
          }

          .faq-item.active .faq-question i {
            transform: rotate(180deg);
          }

          .faq-item.active .faq-answer {
            display: block;
          }

          .help-section {
            margin-bottom: 40px;
          }

          .help-section h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
          }

          .help-section p {
            margin-bottom: 15px;
            line-height: 1.6;
          }

          .help-section ul {
            margin-left: 20px;
            margin-bottom: 15px;
          }

          .help-section li {
            margin-bottom: 8px;
            line-height: 1.6;
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
                <a href="/settings?shop=${shop}" class="nav-link">
                  <i class="fas fa-cog"></i>
                  Settings
                </a>
              </li>
              <li class="nav-item">
                <a href="/help?shop=${shop}" class="nav-link active">
                  <i class="fas fa-question-circle"></i>
                  Help
                </a>
              </li>
            </ul>
          </aside>

          <main class="main-content">
            <div class="header">
              <h2>Help & Support</h2>
              <div style="display: flex; align-items: center;">
                <button id="theme-toggle" class="theme-toggle">
                  <i class="fas fa-moon"></i>
                </button>
              </div>
            </div>

            <div class="help-section">
              <h3>Getting Started</h3>
              <p>Welcome to KingsBuilder, the ultimate page builder for your Shopify store. Here's how to get started:</p>
              <ol>
                <li>Navigate to the <a href="/pages?shop=${shop}">Pages</a> section to create your first page.</li>
                <li>Choose from our pre-designed <a href="/templates?shop=${shop}">Templates</a> or start from scratch.</li>
                <li>Use the drag-and-drop builder to customize your page.</li>
                <li>Save and publish your page to make it live on your store.</li>
              </ol>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Frequently Asked Questions</h3>
              </div>

              <div class="faq-list">
                <div class="faq-item">
                  <div class="faq-question">
                    How do I create a new page?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    To create a new page, go to the Pages section and click on the "Create Page" button. You can either start from scratch or choose from our pre-designed templates.
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    Can I use my own custom code?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    Yes, you can add custom CSS and JavaScript to your pages. Go to the Settings section and look for the "Advanced Settings" card where you can add your custom code.
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    How do I publish my page?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    After creating or editing your page in the builder, click the "Publish" button in the top-right corner. This will make your page live on your Shopify store.
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    Can I edit a published page?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    Yes, you can edit a published page at any time. Go to the Pages section, find the page you want to edit, and click the edit icon. Make your changes and publish again to update the live page.
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    How do I contact support?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    If you need further assistance, please email us at support@kingsbuilder.com or use the chat widget in the bottom-right corner of the screen.
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Video Tutorials</h3>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                <div>
                  <div style="background-color: #f0f0f0; height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border-radius: 6px;">
                    <i class="fas fa-play-circle" style="font-size: 48px;"></i>
                  </div>
                  <h4 style="margin-bottom: 5px;">Getting Started with KingsBuilder</h4>
                  <p style="font-size: 14px; opacity: 0.7;">Learn the basics of using KingsBuilder to create beautiful pages.</p>
                </div>
                <div>
                  <div style="background-color: #f0f0f0; height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border-radius: 6px;">
                    <i class="fas fa-play-circle" style="font-size: 48px;"></i>
                  </div>
                  <h4 style="margin-bottom: 5px;">Advanced Page Building Techniques</h4>
                  <p style="font-size: 14px; opacity: 0.7;">Take your pages to the next level with advanced features.</p>
                </div>
                <div>
                  <div style="background-color: #f0f0f0; height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border-radius: 6px;">
                    <i class="fas fa-play-circle" style="font-size: 48px;"></i>
                  </div>
                  <h4 style="margin-bottom: 5px;">Using Templates Effectively</h4>
                  <p style="font-size: 14px; opacity: 0.7;">Learn how to customize templates to match your brand.</p>
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

          // FAQ accordion functionality
          const faqItems = document.querySelectorAll('.faq-item');
          
          faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
              item.classList.toggle('active');
            });
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Help error:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>An error occurred while loading the help page: ${error.message}</p>
    `);
  }
});

module.exports = router;
