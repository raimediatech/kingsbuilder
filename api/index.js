// Simple API handler for Vercel deployment
export default function handler(req, res) {
  // Log environment variables (without sensitive values)
  console.log('Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- SHOPIFY_APP_URL exists:', !!process.env.SHOPIFY_APP_URL);
  console.log('- SHOPIFY_API_KEY exists:', !!process.env.SHOPIFY_API_KEY);
  console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  // Return a simple landing page
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KingsBuilder - Coming Soon</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          color: #2c6ecb;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          background-color: #2c6ecb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          font-weight: bold;
        }
        .status {
          display: inline-block;
          padding: 8px 16px;
          background-color: #ebf5ff;
          color: #2c6ecb;
          border-radius: 20px;
          font-weight: 500;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">KB</div>
        <h1>KingsBuilder</h1>
        <p>Our Shopify app is currently under development and will be available soon.</p>
        <p>We're working on creating a seamless experience for building and managing your Shopify store.</p>
        <div class="status">Coming Soon</div>
      </div>
    </body>
    </html>
  `);
}