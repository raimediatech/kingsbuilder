import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';

// Install Remix globals
installGlobals();

const app = express();

// Serve static files
app.use(express.static('public'));

// Redirect root to /app
app.get('/', (req, res) => {
  res.redirect('/app');
});

// Handle Remix requests
app.all(
  '*',
  createRequestHandler({
    build: await import('../build/index.js'),
  })
);

export default app;
