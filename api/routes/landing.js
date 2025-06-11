// api/routes/landing.js - Landing page route
const express = require('express');
const router = express.Router();

// Landing page route
router.get('/', (req, res) => {
  // Check if this is a Shopify request
  const shop = req.query.shop;
  const host = req.query.host;
  
  if (shop || host) {
    // This is a Shopify request - redirect to root which will handle authentication
    return res.redirect('/' + (req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : ''));
  }
  
  // Render the landing page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="frame-ancestors https://admin.shopify.com https://*.myshopify.com;">
      <title>KingsBuilder - Premium Shopify Page Builder</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--bg-dark);
          color: var(--text-light);
          margin: 0;
          padding: 0;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background-color: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-light);
          text-decoration: none;
        }

        .nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-gray);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: var(--text-light);
        }

        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: var(--text-light);
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
        }

        .btn:hover {
          background-color: var(--primary-light);
          transform: translateY(-2px);
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid var(--primary);
        }

        .btn-outline:hover {
          background-color: var(--primary);
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 5rem;
          overflow: hidden;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, var(--text-light), var(--text-gray));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-gray);
          margin-bottom: 2rem;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .hero-image {
          position: absolute;
          top: 50%;
          right: -5%;
          transform: translateY(-50%);
          width: 60%;
          max-width: 800px;
          z-index: 1;
          border-radius: 0.5rem;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--border-color);
        }

        .features {
          padding: 8rem 0;
          background-color: var(--bg-dark);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-gray);
          text-align: center;
          max-width: 600px;
          margin: 0 auto 4rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background-color: var(--bg-card);
          border-radius: 0.5rem;
          padding: 2rem;
          transition: all 0.3s;
          border: 1px solid var(--border-color);
        }

        .feature-card:hover {
          background-color: var(--bg-card-hover);
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-gray);
        }

        .testimonials {
          padding: 8rem 0;
          background-color: var(--bg-dark);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background-color: var(--bg-card);
          border-radius: 0.5rem;
          padding: 2rem;
          border: 1px solid var(--border-color);
        }

        .testimonial-content {
          font-style: italic;
          margin-bottom: 1.5rem;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
        }

        .testimonial-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          margin-right: 1rem;
          object-fit: cover;
        }

        .testimonial-name {
          font-weight: 600;
        }

        .testimonial-role {
          color: var(--text-gray);
          font-size: 0.875rem;
        }

        .pricing {
          padding: 8rem 0;
          background-color: var(--bg-dark);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .pricing-card {
          background-color: var(--bg-card);
          border-radius: 0.5rem;
          padding: 2rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-5px);
        }

        .pricing-card.featured {
          border: 1px solid var(--primary);
          position: relative;
        }

        .pricing-card.featured::before {
          content: "Popular";
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary);
          color: var(--text-light);
          padding: 0.25rem 1rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .pricing-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .pricing-price {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .pricing-duration {
          color: var(--text-gray);
          font-size: 0.875rem;
        }

        .pricing-features {
          list-style: none;
          margin-bottom: 2rem;
        }

        .pricing-feature {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .pricing-feature i {
          color: var(--primary);
          margin-right: 0.5rem;
        }

        .cta {
          padding: 8rem 0;
          background-color: var(--bg-dark);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .cta-description {
          color: var(--text-gray);
          margin-bottom: 2rem;
        }

        .footer {
          background-color: var(--bg-card);
          padding: 4rem 0;
          border-top: 1px solid var(--border-color);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-description {
          color: var(--text-gray);
          margin-bottom: 1.5rem;
        }

        .footer-social {
          display: flex;
          gap: 1rem;
        }

        .footer-social a {
          color: var(--text-gray);
          font-size: 1.25rem;
          transition: color 0.3s;
        }

        .footer-social a:hover {
          color: var(--text-light);
        }

        .footer-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          list-style: none;
        }

        .footer-link {
          margin-bottom: 0.75rem;
        }

        .footer-link a {
          color: var(--text-gray);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-link a:hover {
          color: var(--text-light);
        }

        .copyright {
          text-align: center;
          padding: 2rem 0;
          color: var(--text-gray);
          font-size: 0.875rem;
          border-top: 1px solid var(--border-color);
          margin-top: 4rem;
        }

        /* Responsive styles */
        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-image {
            width: 50%;
            right: -10%;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
          }

          .nav {
            flex-wrap: wrap;
            justify-content: center;
          }

          .hero {
            padding-top: 8rem;
            text-align: center;
          }

          .hero-content {
            margin: 0 auto;
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero-image {
            position: relative;
            width: 100%;
            max-width: 500px;
            margin: 3rem auto 0;
            right: 0;
            transform: none;
          }

          .section-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="header-container container">
          <a href="/" class="logo">KingsBuilder</a>
          <nav class="nav">
            <a href="#features" class="nav-link">Features</a>
            <a href="#testimonials" class="nav-link">Testimonials</a>
            <a href="#pricing" class="nav-link">Pricing</a>
            <a href="/dashboard" class="btn">Get Started</a>
          </nav>
        </div>
      </header>

      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Create Stunning Shopify Pages Without Coding</h1>
            <p class="hero-subtitle">KingsBuilder is a premium drag-and-drop page builder that helps you create beautiful, high-converting pages for your Shopify store in minutes.</p>
            <div class="hero-buttons">
              <a href="/dashboard" class="btn">Start Building Now</a>
              <a href="#features" class="btn btn-outline">Learn More</a>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <i class="fas fa-store"></i>
                <span>5,000+ Stores</span>
              </div>
              <div class="stat">
                <i class="fas fa-star"></i>
                <span>4.9/5 Rating</span>
              </div>
              <div class="stat">
                <i class="fas fa-file"></i>
                <span>100,000+ Pages Built</span>
              </div>
            </div>
          </div>
          <img src="https://cdn.shopify.com/s/files/1/0070/7032/files/shopify-pagefly-page-builder.png" alt="KingsBuilder Interface" class="hero-image">
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Powerful Features</h2>
          <p class="section-subtitle">Everything you need to create professional pages that convert visitors into customers.</p>
          
          <div class="features-grid">
            <div class="feature-card">
              <i class="fas fa-paint-brush feature-icon"></i>
              <h3 class="feature-title">Drag & Drop Editor</h3>
              <p class="feature-description">Build pages visually with our intuitive drag-and-drop interface. No coding required.</p>
            </div>
            
            <div class="feature-card">
              <i class="fas fa-mobile-alt feature-icon"></i>
              <h3 class="feature-title">Mobile Responsive</h3>
              <p class="feature-description">All pages look perfect on any device, from desktop to mobile phones.</p>
            </div>
            
            <div class="feature-card">
              <i class="fas fa-bolt feature-icon"></i>
              <h3 class="feature-title">Lightning Fast</h3>
              <p class="feature-description">Optimized for speed to ensure your pages load quickly and rank higher in search results.</p>
            </div>
            
            <div class="feature-card">
              <i class="fas fa-layer-group feature-icon"></i>
              <h3 class="feature-title">50+ Elements</h3>
              <p class="feature-description">Choose from a wide range of elements to build any type of page you need.</p>
            </div>
            
            <div class="feature-card">
              <i class="fas fa-file-alt feature-icon"></i>
              <h3 class="feature-title">Ready-Made Templates</h3>
              <p class="feature-description">Start with professionally designed templates and customize them to match your brand.</p>
            </div>
            
            <div class="feature-card">
              <i class="fas fa-code feature-icon"></i>
              <h3 class="feature-title">Custom Code</h3>
              <p class="feature-description">Add your own HTML, CSS, and JavaScript for advanced customization.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" class="testimonials">
        <div class="container">
          <h2 class="section-title">What Our Customers Say</h2>
          <p class="section-subtitle">Join thousands of Shopify merchants who love KingsBuilder.</p>
          
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <p class="testimonial-content">"KingsBuilder has completely transformed how we create pages for our store. It's so easy to use and the results look professional."</p>
              <div class="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah Johnson" class="testimonial-avatar">
                <div>
                  <p class="testimonial-name">Sarah Johnson</p>
                  <p class="testimonial-role">Fashion Store Owner</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <p class="testimonial-content">"We've seen a 35% increase in conversions since switching to pages built with KingsBuilder. The templates are beautiful and convert really well."</p>
              <div class="testimonial-author">
                <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Michael Chen" class="testimonial-avatar">
                <div>
                  <p class="testimonial-name">Michael Chen</p>
                  <p class="testimonial-role">Electronics Store</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <p class="testimonial-content">"As someone with no design skills, KingsBuilder has been a game-changer. I can create professional-looking pages in minutes instead of hiring a designer."</p>
              <div class="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Emma Rodriguez" class="testimonial-avatar">
                <div>
                  <p class="testimonial-name">Emma Rodriguez</p>
                  <p class="testimonial-role">Jewelry Store Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing">
        <div class="container">
          <h2 class="section-title">Simple, Transparent Pricing</h2>
          <p class="section-subtitle">Choose the plan that's right for your business.</p>
          
          <div class="pricing-grid">
            <div class="pricing-card">
              <div class="pricing-header">
                <h3 class="pricing-name">Starter</h3>
                <p class="pricing-price">$9.99</p>
                <p class="pricing-duration">per month</p>
              </div>
              
              <ul class="pricing-features">
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>5 Pages</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Basic Elements</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Mobile Responsive</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Basic Templates</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Email Support</span>
                </li>
              </ul>
              
              <a href="/dashboard" class="btn btn-outline" style="width: 100%; text-align: center;">Get Started</a>
            </div>
            
            <div class="pricing-card featured">
              <div class="pricing-header">
                <h3 class="pricing-name">Professional</h3>
                <p class="pricing-price">$19.99</p>
                <p class="pricing-duration">per month</p>
              </div>
              
              <ul class="pricing-features">
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Unlimited Pages</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>All Elements</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Advanced Customization</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Premium Templates</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Priority Support</span>
                </li>
              </ul>
              
              <a href="/dashboard" class="btn" style="width: 100%; text-align: center;">Get Started</a>
            </div>
            
            <div class="pricing-card">
              <div class="pricing-header">
                <h3 class="pricing-name">Enterprise</h3>
                <p class="pricing-price">$49.99</p>
                <p class="pricing-duration">per month</p>
              </div>
              
              <ul class="pricing-features">
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Everything in Professional</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Custom Code Injection</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>A/B Testing</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Advanced Analytics</span>
                </li>
                <li class="pricing-feature">
                  <i class="fas fa-check"></i>
                  <span>Dedicated Support</span>
                </li>
              </ul>
              
              <a href="/dashboard" class="btn btn-outline" style="width: 100%; text-align: center;">Get Started</a>
            </div>
          </div>
        </div>
      </section>

      <section class="cta">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">Ready to Build Amazing Pages?</h2>
            <p class="cta-description">Join thousands of Shopify merchants who are creating beautiful, high-converting pages with KingsBuilder.</p>
            <a href="/dashboard" class="btn">Start Building Now</a>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <h3 class="footer-logo">KingsBuilder</h3>
              <p class="footer-description">The premium page builder for Shopify stores.</p>
              <div class="footer-social">
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-linkedin"></i></a>
              </div>
            </div>
            
            <div>
              <h4 class="footer-title">Product</h4>
              <ul class="footer-links">
                <li class="footer-link"><a href="#features">Features</a></li>
                <li class="footer-link"><a href="#pricing">Pricing</a></li>
                <li class="footer-link"><a href="#">Templates</a></li>
                <li class="footer-link"><a href="#">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="footer-title">Resources</h4>
              <ul class="footer-links">
                <li class="footer-link"><a href="#">Documentation</a></li>
                <li class="footer-link"><a href="#">Tutorials</a></li>
                <li class="footer-link"><a href="#">Blog</a></li>
                <li class="footer-link"><a href="#">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="footer-title">Company</h4>
              <ul class="footer-links">
                <li class="footer-link"><a href="#">About Us</a></li>
                <li class="footer-link"><a href="#">Careers</a></li>
                <li class="footer-link"><a href="#">Contact</a></li>
                <li class="footer-link"><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div class="copyright">
            &copy; 2023 KingsBuilder. All rights reserved.
          </div>
        </div>
      </footer>
    </body>
    </html>
  `);
});

module.exports = router;