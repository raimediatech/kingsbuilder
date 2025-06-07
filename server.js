// server.js - Simple Express server for Shopify app
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = require('./api/index.js');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`KingsBuilder Shopify app listening on port ${port}`);
  console.log(`App URL: ${process.env.SHOPIFY_APP_URL || 'http://localhost:' + port}`);
});
