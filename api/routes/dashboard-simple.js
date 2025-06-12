// api/routes/dashboard-simple.js - Simple Dashboard route
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const shop = req.query.shop || req.cookies?.shopOrigin;
  
  if (!shop) {
    return res.status(400).send('Shop parameter is required');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>Dashboard</h1>
      <p>Shop: ${shop}</p>
      <p>This is a simple dashboard page.</p>
      <p><a href="/dashboard-modern?shop=${shop}">Go to Modern Dashboard</a></p>
    </body>
    </html>
  `);
});

module.exports = router;
