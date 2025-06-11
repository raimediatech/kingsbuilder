const express = require('express');
const router = express.Router();

// Landing page route
router.get('/', (req, res) => {
  // Check if this is a Shopify request
  const shop = req.query.shop;
  const host = req.query.host;

  if (shop || host) {
    // This is a Shopify request, redirect to app
    return res.redirect('/' + req.originalUrl.substring(1));
  }

  // Otherwise serve the landing page
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://admin.shopify.com https://*.myshopify.com;">
  <title>KingsBuilder - Premium Shopify Page Builder</title>
  <!-- Font styles are included inline -->
  <script>
    // Check if this is a Shopify request and redirect to the app
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('shop') || urlParams.has('host')) {
      // This is a Shopify request - redirect to root which will handle authentication
      window.location.href = "/" + window.location.search;
    }
  </script>
  <style>
    :root {
      --primary: #000000;
      --primary-light: #222222;
      --accent: #FFFFFF;
      --accent-light: #CCCCCC;
      --text-light: #FFFFFF;
      --text-gray: #AAAAAA;
      --text-dark: #000000;
      --bg-dark: #0A0A0A;
      --bg-card: #111111;
      --bg-card-hover: #1A1A1A;
      --border-color: #333333;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-light);
      margin: 0;
      padding: 0;
      line-height: 1.6;
      overflow-x: hidden;
    }

    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05), transparent 70%);
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 1200px;
      width: 100%;
      text-align: center;
    }

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      background-color: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(10px);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo {
      width: 50px;
      height: 50px;
      background-color: #222222;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .nav-links {
      display: flex;
      gap: 30px;
    }

    .nav-link {
      color: var(--text-light);
      text-decoration: none;
      font-size: 18px;
      transition: color 0.3s;
    }

    .nav-link:hover {
      color: var(--accent);
    }

    .hero-title {
      font-size: 80px;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 20px;
      background: linear-gradient(to right, #FFFFFF, #AAAAAA);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .hero-subtitle {
      font-size: 24px;
      color: var(--text-gray);
      max-width: 700px;
      margin: 0 auto 40px;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 60px;
    }

    .button {
      display: inline-block;
      padding: 16px 32px;
      background-color: #222222;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }

    .button:hover {
      background-color: #333333;
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
    }

    .button-outline {
      background-color: transparent;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      box-shadow: none;
    }

    .button-outline:hover {
      background-color: #FFFFFF;
      color: #000000;
    }

    .features-section {
      padding: 100px 20px;
      background-color: var(--primary);
    }

    .section-title {
      font-size: 48px;
      text-align: center;
      margin-bottom: 60px;
      font-weight: 600;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      background-color: var(--bg-card);
      border-radius: 16px;
      padding: 40px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .feature-card:hover {
      transform: translateY(-10px);
      background-color: var(--bg-card-hover);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(to right, #333333, #222222);
    }

    .feature-icon {
      font-size: 36px;
      margin-bottom: 20px;
      color: #FFFFFF;
    }

    .feature-title {
      font-size: 24px;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .feature-description {
      color: var(--text-gray);
      font-size: 18px;
      line-height: 1.6;
    }

    .pricing-section {
      padding: 100px 20px;
      background-color: var(--bg-dark);
      position: relative;
      overflow: hidden;
    }

    .pricing-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      background: radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.03), transparent 70%);
      z-index: 1;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .pricing-card {
      background-color: var(--bg-card);
      border-radius: 16px;
      padding: 40px;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .pricing-card.popular {
      transform: scale(1.05);
      border: 2px solid #333333;
      z-index: 3;
    }

    .pricing-card:hover {
      transform: translateY(-10px);
      background-color: var(--bg-card-hover);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    }

    .pricing-card.popular:hover {
      transform: scale(1.05) translateY(-10px);
    }

    .popular-badge {
      position: absolute;
      top: -15px;
      right: 20px;
      background-color: #333333;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .pricing-title {
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .pricing-price {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--text-light);
    }

    .pricing-description {
      color: var(--text-gray);
      font-size: 18px;
      margin-bottom: 30px;
    }

    .pricing-features {
      list-style: none;
      margin-bottom: 30px;
    }

    .pricing-feature {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      color: var(--text-gray);
    }

    .pricing-feature::before {
      content: '✓';
      margin-right: 10px;
      color: #FFFFFF;
      font-weight: bold;
    }

    .testimonials-section {
      padding: 100px 20px;
      background-color: var(--primary-light);
      position: relative;
      overflow: hidden;
    }

    .testimonials-section::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50%;
      height: 100%;
      background: radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.03), transparent 70%);
      z-index: 1;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .testimonial-card {
      background-color: var(--bg-card);
      border-radius: 16px;
      padding: 40px;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .testimonial-card:hover {
      transform: translateY(-10px);
      background-color: var(--bg-card-hover);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    }

    .testimonial-text {
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 30px;
      position: relative;
    }

    .testimonial-text::before {
      content: '"';
      font-size: 60px;
      position: absolute;
      top: -20px;
      left: -10px;
      color: #333333;
      opacity: 0.5;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
    }

    .author-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 20px;
      background-color: #333333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .author-role {
      font-size: 16px;
      color: var(--text-gray);
    }

    .cta-section {
      padding: 100px 20px;
      background-color: var(--bg-dark);
      text-align: center;
    }

    .cta-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-subtitle {
      font-size: 20px;
      color: var(--text-gray);
      max-width: 600px;
      margin: 0 auto 40px;
    }

    .footer {
      background-color: var(--primary);
      padding: 60px 20px;
      color: var(--text-gray);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .footer-description {
      margin-bottom: 20px;
      max-width: 300px;
    }

    .footer-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--text-light);
    }

    .footer-links {
      list-style: none;
    }

    .footer-link {
      margin-bottom: 10px;
    }

    .footer-link a {
      color: var(--text-gray);
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-link a:hover {
      color: var(--text-light);
    }

    .social-links {
      display: flex;
      gap: 15px;
    }

    .social-link {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background-color: var(--bg-card-hover);
      transform: translateY(-5px);
    }

    .copyright {
      text-align: center;
      padding: 20px;
      background-color: var(--primary);
      color: var(--text-gray);
      border-top: 1px solid var(--border-color);
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .navbar {
        padding: 15px 20px;
      }

      .nav-links {
        display: none;
      }

      .hero-title {
        font-size: 48px;
      }

      .hero-subtitle {
        font-size: 20px;
      }

      .cta-buttons {
        flex-direction: column;
        gap: 15px;
      }

      .section-title {
        font-size: 36px;
      }

      .testimonials-grid {
        grid-template-columns: 1fr;
      }

      .cta-title {
        font-size: 36px;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 18px;
      }

      .button {
        padding: 12px 24px;
        font-size: 16px;
      }

      .section-title {
        font-size: 30px;
      }

      .feature-card, .pricing-card, .testimonial-card {
        padding: 30px;
      }
    }
  </style>
</head>
<body>
  <header class="navbar">
    <div class="logo-container">
      <div class="logo">KB</div>
      <div class="logo-text">KingsBuilder</div>
    </div>
    <nav class="nav-links">
      <a href="#features" class="nav-link">Features</a>
      <a href="#pricing" class="nav-link">Pricing</a>
      <a href="#testimonials" class="nav-link">Testimonials</a>
      <a href="/install" class="nav-link">Get Started</a>
    </nav>
  </header>

  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">KingsBuilder</h1>
      <p class="hero-subtitle">Welcome to KingsBuilder - The Ultimate Page Builder for Shopify. Create beautiful, customized pages for your Shopify store without writing any code.</p>
      <div class="cta-buttons">
        <a href="https://apps.shopify.com/kingsbuilder" class="button">Open in Shopify</a>
        <a href="/install" class="button button-outline">Get Started</a>
      </div>
    </div>
  </section>

  <section id="features" class="features-section">
    <h2 class="section-title">Features</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3 class="feature-title">Drag & Drop Builder</h3>
        <p class="feature-description">Create pages with our intuitive drag-and-drop interface.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3 class="feature-title">Pre-built Templates</h3>
        <p class="feature-description">Start with professionally designed templates.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3 class="feature-title">Mobile Responsive</h3>
        <p class="feature-description">All pages look great on any device.</p>
      </div>
    </div>
  </section>

  <section id="pricing" class="pricing-section">
    <h2 class="section-title">Simple Pricing</h2>
    <p class="hero-subtitle" style="margin-bottom: 60px;">Choose the plan that works best for your business</p>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3 class="pricing-title">Starter</h3>
        <div class="pricing-price">$9.99/month</div>
        <p class="pricing-description">Perfect for small stores just getting started</p>
        <ul class="pricing-features">
          <li class="pricing-feature">Up to 5 custom pages</li>
          <li class="pricing-feature">Basic templates</li>
          <li class="pricing-feature">Email support</li>
        </ul>
        <a href="/install" class="button">Get Started</a>
      </div>
      <div class="pricing-card popular">
        <div class="popular-badge">Most Popular</div>
        <h3 class="pricing-title">Professional</h3>
        <div class="pricing-price">$19.99/month</div>
        <p class="pricing-description">For growing businesses with more needs</p>
        <ul class="pricing-features">
          <li class="pricing-feature">Unlimited custom pages</li>
          <li class="pricing-feature">All templates</li>
          <li class="pricing-feature">Priority support</li>
          <li class="pricing-feature">Advanced analytics</li>
        </ul>
        <a href="/install" class="button">Get Started</a>
      </div>
      <div class="pricing-card">
        <h3 class="pricing-title">Enterprise</h3>
        <div class="pricing-price">$49.99/month</div>
        <p class="pricing-description">For large stores with custom requirements</p>
        <ul class="pricing-features">
          <li class="pricing-feature">Unlimited custom pages</li>
          <li class="pricing-feature">All templates + exclusive designs</li>
          <li class="pricing-feature">Dedicated support</li>
          <li class="pricing-feature">Advanced analytics</li>
          <li class="pricing-feature">Custom development</li>
        </ul>
        <a href="/install" class="button">Get Started</a>
      </div>
    </div>
  </section>

  <section id="testimonials" class="testimonials-section">
    <h2 class="section-title">What Our Customers Say</h2>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p class="testimonial-text">KingsBuilder has completely transformed how we create landing pages. It's so intuitive and the templates are beautiful. We've seen a 30% increase in conversions since switching.</p>
        <div class="testimonial-author">
          <div class="author-avatar">S</div>
          <div class="author-info">
            <div class="author-name">Sarah Johnson</div>
            <div class="author-role">Marketing Director, FashionHub</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="testimonial-text">As someone with no coding experience, I was able to create professional-looking pages for my store in minutes. The customer support team is also incredibly helpful.</p>
        <div class="testimonial-author">
          <div class="author-avatar">M</div>
          <div class="author-info">
            <div class="author-name">Michael Chen</div>
            <div class="author-role">Owner, GadgetWorld</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="testimonial-text">We've tried several page builders, but KingsBuilder stands out for its ease of use and performance. Our pages load faster and look more professional than ever before.</p>
        <div class="testimonial-author">
          <div class="author-avatar">J</div>
          <div class="author-info">
            <div class="author-name">Jessica Williams</div>
            <div class="author-role">E-commerce Manager, HomeEssentials</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <h2 class="cta-title">Ready to Build Beautiful Pages?</h2>
    <p class="cta-subtitle">Join thousands of Shopify merchants who are creating stunning pages with KingsBuilder.</p>
    <a href="/install" class="button">Get Started Today</a>
  </section>

  <footer class="footer">
    <div class="footer-content">
      <div>
        <div class="footer-logo">
          <div class="logo">KB</div>
          <div class="logo-text">KingsBuilder</div>
        </div>
        <p class="footer-description">The ultimate page builder for Shopify stores. Create beautiful, high-converting pages without any coding.</p>
        <div class="social-links">
          <a href="#" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="white"/>
            </svg>
          </a>
          <a href="#" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" fill="white"/>
            </svg>
          </a>
          <a href="#" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.07 18.28C7.5 17.38 10.12 16.5 12 16.5C13.88 16.5 16.51 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20C10.14 20 8.43 19.36 7.07 18.28ZM18.36 16.83C16.93 15.09 13.46 14.5 12 14.5C10.54 14.5 7.07 15.09 5.64 16.83C4.62 15.49 4 13.82 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 13.82 19.38 15.49 18.36 16.83ZM12 6C10.06 6 8.5 7.56 8.5 9.5C8.5 11.44 10.06 13 12 13C13.94 13 15.5 11.44 15.5 9.5C15.5 7.56 13.94 6 12 6ZM12 11C11.17 11 10.5 10.33 10.5 9.5C10.5 8.67 11.17 8 12 8C12.83 8 13.5 8.67 13.5 9.5C13.5 10.33 12.83 11 12 11Z" fill="white"/>
            </svg>
          </a>
        </div>
      </div>
      <div>
        <h3 class="footer-title">Product</h3>
        <ul class="footer-links">
          <li class="footer-link"><a href="#features">Features</a></li>
          <li class="footer-link"><a href="#pricing">Pricing</a></li>
          <li class="footer-link"><a href="#testimonials">Testimonials</a></li>
          <li class="footer-link"><a href="#">Templates</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer-title">Company</h3>
        <ul class="footer-links">
          <li class="footer-link"><a href="#">About Us</a></li>
          <li class="footer-link"><a href="#">Careers</a></li>
          <li class="footer-link"><a href="#">Blog</a></li>
          <li class="footer-link"><a href="#">Press</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer-title">Support</h3>
        <ul class="footer-links">
          <li class="footer-link"><a href="#">Help Center</a></li>
          <li class="footer-link"><a href="#">Contact Us</a></li>
          <li class="footer-link"><a href="#">Privacy Policy</a></li>
          <li class="footer-link"><a href="#">Terms of Service</a></li>
        </ul>
      </div>
    </div>
  </footer>
  <div class="copyright">
    © 2023 KingsBuilder. All rights reserved.
  </div>
</body>
</html>`);
});

module.exports = router;