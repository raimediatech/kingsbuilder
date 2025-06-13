// api/routes/help.js - Help routes
const express = require('express');
const router = express.Router();

// Help home page
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

    // Render the help page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KingsBuilder Help</title>
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

          .help-search {
            position: relative;
            margin-bottom: 30px;
          }

          .help-search input {
            width: 100%;
            padding: 15px 20px;
            padding-left: 50px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 16px;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .help-search i {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-color);
            opacity: 0.5;
            font-size: 20px;
          }

          .help-categories {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .help-category {
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .help-category:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          .help-category i {
            font-size: 32px;
            margin-bottom: 15px;
            color: var(--primary-color);
          }

          .help-category h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .help-category p {
            font-size: 14px;
            color: var(--text-color);
            opacity: 0.7;
          }

          .faq-item {
            margin-bottom: 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
          }

          .faq-question {
            padding: 15px 20px;
            background-color: var(--bg-color);
            font-weight: 500;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .faq-question:hover {
            background-color: var(--card-bg);
          }

          .faq-answer {
            padding: 0 20px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s, padding 0.3s;
          }

          .faq-answer.active {
            padding: 15px 20px;
            max-height: 500px;
          }

          .faq-question i {
            transition: transform 0.3s;
          }

          .faq-question.active i {
            transform: rotate(180deg);
          }

          @media (max-width: 768px) {
            .dashboard {
              grid-template-columns: 1fr;
            }

            .sidebar {
              display: none;
            }

            .help-categories {
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
              <h2>Help Center</h2>
              <div style="display: flex; align-items: center;">
                <button id="theme-toggle" class="theme-toggle">
                  <i class="fas fa-moon"></i>
                </button>
                <a href="mailto:support@kingsbuilder.com" class="btn">
                  <i class="fas fa-envelope"></i>
                  Contact Support
                </a>
              </div>
            </div>

            <div class="help-search">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search for help...">
            </div>

            <div class="help-categories">
              <div class="help-category">
                <i class="fas fa-rocket"></i>
                <h3>Getting Started</h3>
                <p>Learn the basics of KingsBuilder</p>
              </div>
              <div class="help-category">
                <i class="fas fa-file-alt"></i>
                <h3>Page Builder</h3>
                <p>Create and edit pages</p>
              </div>
              <div class="help-category">
                <i class="fas fa-palette"></i>
                <h3>Templates</h3>
                <p>Use and customize templates</p>
              </div>
              <div class="help-category">
                <i class="fas fa-cog"></i>
                <h3>Settings</h3>
                <p>Configure your KingsBuilder</p>
              </div>
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
                    <p>To create a new page, click on the "Create Page" button in the dashboard. You can start from scratch or use one of our pre-designed templates. Once in the page builder, you can add elements by dragging them from the left sidebar onto your page.</p>
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    How do I publish my page to my Shopify store?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    <p>Once you've finished designing your page, click the "Save & Publish" button in the top right corner of the page builder. This will save your page and make it live on your Shopify store. You can also save a draft version by clicking "Save Draft" if you're not ready to publish yet.</p>
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    Can I use my own custom CSS and JavaScript?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    <p>Yes, you can add custom CSS and JavaScript to your pages. Go to the Settings section and navigate to the Advanced tab. There you'll find fields to enter your custom CSS and JavaScript code that will be applied to all pages created with KingsBuilder.</p>
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    How do I add products to my page?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    <p>In the page builder, you'll find a "Product" element in the Shopify section of the left sidebar. Drag this element onto your page, then click on it to open the properties panel. There you can search for and select products from your store to display on your page.</p>
                  </div>
                </div>

                <div class="faq-item">
                  <div class="faq-question">
                    Is KingsBuilder compatible with all Shopify themes?
                    <i class="fas fa-chevron-down"></i>
                  </div>
                  <div class="faq-answer">
                    <p>Yes, KingsBuilder is designed to work with all Shopify themes. The pages you create with KingsBuilder are standalone and will inherit your theme's header and footer, but the content area will be fully controlled by KingsBuilder.</p>
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

          // FAQ accordion functionality
          const faqQuestions = document.querySelectorAll('.faq-question');

          faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
              const answer = question.nextElementSibling;
              const isActive = question.classList.contains('active');

              // Close all other answers
              document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
              });

              // Toggle current answer
              if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
              }
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
      <pre>${error.stack}</pre>
    `);
  }
});

module.exports = router;
